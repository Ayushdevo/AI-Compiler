import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

/**
 * Gemini client
 */
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return null;
    }

    aiClient = new GoogleGenAI({
      apiKey,
    });
  }

  return aiClient;
}

/**
 * ============================================================
 * GEMINI RETRY WRAPPER
 * ============================================================
 *
 * Gemini can temporarily return 429/5xx responses when the
 * service is busy. These are transient failures, so retry them
 * with exponential backoff instead of immediately failing the
 * compilation.
 *
 * We deliberately do NOT retry permanent errors such as an
 * invalid API key, malformed request, or invalid model name.
 */
async function generateWithRetry(
  request: any,
  maxRetries = 3
): Promise<any> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await aiClientOrThrow().models.generateContent(request);
    } catch (error: any) {
      lastError = error;

      const status =
        error?.status ??
        error?.code ??
        error?.response?.status ??
        error?.error?.code;

      const message =
        error?.message ??
        error?.error?.message ??
        String(error);

      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        /UNAVAILABLE|high demand|overloaded|temporarily unavailable|rate limit/i.test(
          message
        );

      if (!retryable || attempt >= maxRetries) {
        throw error;
      }

      const delayMs = Math.min(
        1500 * Math.pow(2, attempt),
        10000
      );

      console.warn(
        `[GEMINI] Temporary failure (${status ?? 'unknown'}). ` +
        `Retry ${attempt + 1}/${maxRetries} in ${delayMs}ms`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delayMs)
      );
    }
  }

  throw lastError;
}

/**
 * Return the configured Gemini client or throw a clear error.
 *
 * This keeps generateWithRetry independent from the request
 * handler's local `ai` variable.
 */
function aiClientOrThrow(): GoogleGenAI {
  const client = getGeminiClient();

  if (!client) {
    throw new Error(
      'Gemini client is not configured. Set GEMINI_API_KEY.'
    );
  }

  return client;
}

/**
 * Types
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface StageTiming {
  durationMs: number;
}

interface CompilationMetrics {
  durationMs: number;
  inferenceTime: string;
  tokensUsed: number;
  llmCalls: number;
}

interface ApplicationIR {
  architectureVersion?: string;
  complexityClassification?: string;
  entities?: Array<{
    id?: string;
    type?: string;
    fields?: string[];
  }>;
  endpoints?: string[];
  roles?: string[];
  securityLevel?: string;
}

interface GeneratedArtifacts {
  uiCode: string;
  apiCode: string;
  dbCode: string;
  authYaml: string;
  permissions: unknown;
}

/**
 * Utility
 */
function now(): number {
  return performance.now();
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

function createRunId(): string {
  return `CMP-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Basic validation of the intermediate representation.
 *
 * This is intentionally deterministic.
 * We do NOT ask the LLM whether its own output is valid.
 */
function validateIntermediateRepresentation(
  value: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!value || typeof value !== 'object') {
    return {
      valid: false,
      errors: ['Intermediate representation is not an object'],
      warnings,
    };
  }

  const ir = value as ApplicationIR;

  if (!ir.architectureVersion) {
    errors.push('Missing architectureVersion');
  }

  if (!Array.isArray(ir.entities)) {
    errors.push('entities must be an array');
  } else {
    if (ir.entities.length === 0) {
      warnings.push('No entities were generated');
    }

    ir.entities.forEach((entity, index) => {
      if (!entity || typeof entity !== 'object') {
        errors.push(`Entity ${index} is invalid`);
        return;
      }

      if (!entity.id) {
        errors.push(`Entity ${index} is missing id`);
      }

      if (!entity.type) {
        errors.push(`Entity ${index} is missing type`);
      }

      if (!Array.isArray(entity.fields)) {
        errors.push(`Entity ${entity.id || index} fields must be an array`);
      } else if (entity.fields.length === 0) {
        warnings.push(`Entity ${entity.id || index} has no fields`);
      }
    });
  }

  if (!Array.isArray(ir.endpoints)) {
    errors.push('endpoints must be an array');
  }

  if (!Array.isArray(ir.roles)) {
    errors.push('roles must be an array');
  }

  if (!ir.securityLevel) {
    warnings.push('No security level was specified');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Cross-layer validation.
 *
 * This does not claim to compile FastAPI/PostgreSQL/TypeScript.
 * It checks that the compiler produced all expected artifacts
 * and that the central IR is structurally valid.
 */
function validateCrossLayerOutput(
  pipelineIR: unknown,
  artifacts: GeneratedArtifacts
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const irValidation = validateIntermediateRepresentation(
    pipelineIR
  );

  errors.push(...irValidation.errors);
  warnings.push(...irValidation.warnings);

  if (!artifacts.uiCode?.trim()) {
    errors.push('UI artifact is empty');
  }

  if (!artifacts.apiCode?.trim()) {
    errors.push('API artifact is empty');
  }

  if (!artifacts.dbCode?.trim()) {
    errors.push('Database artifact is empty');
  }

  if (!artifacts.authYaml?.trim()) {
    errors.push('Auth policy artifact is empty');
  }

  /**
   * Basic artifact sanity checks.
   */
  if (
    artifacts.apiCode &&
    !artifacts.apiCode.includes('FastAPI')
  ) {
    warnings.push('API artifact does not appear to contain FastAPI');
  }

  if (
    artifacts.dbCode &&
    !/CREATE\s+TABLE/i.test(artifacts.dbCode)
  ) {
    warnings.push('Database artifact contains no CREATE TABLE statement');
  }

  if (
    artifacts.uiCode &&
    !/(React|export\s+default|function)/i.test(artifacts.uiCode)
  ) {
    warnings.push(
      'UI artifact does not appear to contain a React component'
    );
  }

  if (irValidation.valid) {
    const ir = pipelineIR as Required<ApplicationIR>;
    const artifactText = [
      artifacts.uiCode,
      artifacts.apiCode,
      artifacts.dbCode,
      artifacts.authYaml,
      JSON.stringify(artifacts.permissions ?? {}),
    ].join('\n').toLowerCase();

    for (const entity of ir.entities) {
      const entityNames = [entity.id, entity.type].filter(Boolean);
      if (entityNames.length === 0) continue;

      const dbTableNames = artifacts.dbCode.matchAll(
        /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([a-zA-Z0-9_]+)/gi
      );
      const hasDatabaseTable = Array.from(dbTableNames).some((match) =>
        entityNames.some((entityName) => containsIdentifier(match[1], entityName))
      );
      if (!hasDatabaseTable) {
        errors.push(`Database table missing for entity ${entity.id}`);
      }

      const apiModelNames = artifacts.apiCode.matchAll(
        /class\s+([a-zA-Z0-9_]+)\s*(?:\(|:)/gi
      );
      const hasApiModel = Array.from(apiModelNames).some((match) =>
        entityNames.some((entityName) => containsIdentifier(match[1], entityName))
      );
      if (!hasApiModel) {
        errors.push(`API model missing for entity ${entity.id}`);
      }

      for (const field of entity.fields || []) {
        const fieldName = sourceIdentifier(field);
        if (fieldName && !containsIdentifier(artifactText, fieldName)) {
          errors.push(`Field ${fieldName} from entity ${entity.id} is absent from emitted artifacts`);
        }
      }
    }

    for (const endpoint of ir.endpoints) {
      const pathMatch = String(endpoint).match(/\/(?:[\w{}-]+\/)*[\w{}-]+/);
      if (pathMatch && !artifacts.apiCode.toLowerCase().includes(pathMatch[0].toLowerCase())) {
        errors.push(`API route missing for endpoint ${endpoint}`);
      }
    }

    for (const role of ir.roles) {
      if (!containsIdentifier(artifactText, role)) {
        errors.push(`Permission configuration missing declared role ${role}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceIdentifier(value: unknown): string {
  return String(value ?? '')
    .split(/[:\s]/, 1)[0]
    .replace(/[^a-zA-Z0-9_]/g, '');
}

function identifierVariants(value: unknown): string[] {
  const identifier = sourceIdentifier(value);
  if (!identifier) return [];

  const snake = identifier
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
  const canonical = snake
    .replace(/^(entity|role|model|table)_/, '')
    .replace(/_0x[0-9a-f]+$/i, '');
  const candidates = [snake, canonical];

  return Array.from(new Set(candidates.flatMap((candidate) => {
    const compact = candidate.replace(/_/g, '');
    const singular = candidate.endsWith('s') ? candidate.slice(0, -1) : candidate;
    const plural = singular.endsWith('s') ? singular : `${singular}s`;
    return [identifier.toLowerCase(), candidate, compact, singular, plural];
  }))).filter(Boolean);
}

function containsIdentifier(source: string, value: unknown): boolean {
  const lowerSource = source.toLowerCase();
  return identifierVariants(value).some((variant) =>
    new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'i').test(lowerSource)
  );
}

/**
 * Health endpoint
 */
app.get('/api/health', (_req, res) => {
  const llmConfigured = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    status: llmConfigured ? 'ok' : 'degraded',
    compiler: llmConfigured ? 'ready' : 'unavailable',
    llmConfigured,
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main compiler endpoint
 *
 * Pipeline:
 *
 * Natural Language
 *       ↓
 * Intent Extraction
 *       ↓
 * System Design / IR
 *       ↓
 * Artifact Generation
 *       ↓
 * Deterministic Validation
 *       ↓
 * Final Output
 */
app.post('/api/generate', async (req, res) => {
  // express.json() leaves req.body undefined for requests without a JSON body.
  // Reject these as client errors instead of throwing before the handler's try/catch.
  const prompt = req.body?.prompt;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      error: 'Prompt must be a string',
    });
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 10) {
    return res.status(400).json({
      error: 'Prompt is too short',
      code: 'INVALID_PROMPT',
    });
  }

  const runId = createRunId();
  const compilationStart = now();

  const ai = getGeminiClient();

  /**
   * Do not silently fake successful compilation in production.
   */
  if (!ai) {
    return res.status(503).json({
      error: 'Compiler unavailable',
      code: 'MISSING_GEMINI_API_KEY',
      runId,
    });
  }

  try {
    /**
     * ============================================================
     * STAGE 1 — INTENT EXTRACTION
     * ============================================================
     */
    console.log(`[${runId}] [STAGE 1] Intent Extraction`);

    const stage1Start = now();

    const extractionResponse =
      await generateWithRetry({
        model: GEMINI_MODEL,

        contents: `
You are the frontend parser of an AI application compiler.

Your job is to convert a natural-language application requirement
into a structured intent representation.

USER REQUIREMENT:
${JSON.stringify(trimmedPrompt)}

Extract:

1. Core product features
2. Entities / actors / user roles
3. Security requirements
4. PII requirements
5. Billing or premium workflows
6. Important domain specifications

Rules:
- Return only valid JSON.
- Do not invent requirements that are not reasonably implied.
- Keep the extracted information concise.
- Do not claim that anything has been validated.
`,

        config: {
          responseMimeType: 'application/json',

          responseSchema: {
            type: Type.OBJECT,

            required: [
              'features',
              'roles',
              'billingWorkflows',
              'specifications',
            ],

            properties: {
              features: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              roles: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              billingWorkflows: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              specifications: {
                type: Type.STRING,
              },
            },
          },
        },
      });

    const intentTime = Math.round(now() - stage1Start);

    const intentText =
      extractionResponse.text?.trim() || '{}';

    let parsedIntent: unknown;

    try {
      parsedIntent = JSON.parse(intentText);
    } catch {
      return res.status(500).json({
        error: 'Intent extraction returned invalid JSON',
        code: 'INVALID_INTENT_JSON',
        runId,
      });
    }

    console.log(
      `[${runId}] [STAGE 1] Complete in ${intentTime}ms`
    );

    /**
     * ============================================================
     * STAGE 2 — SYSTEM DESIGN / INTERMEDIATE REPRESENTATION
     * ============================================================
     */
    console.log(`[${runId}] [STAGE 2] System Design`);

    const stage2Start = now();

    const designResponse =
      await generateWithRetry({
        model: GEMINI_MODEL,

        contents: `
You are the architecture stage of an AI application compiler.

Convert the extracted intent below into a formal application
intermediate representation.

EXTRACTED INTENT:
${JSON.stringify(parsedIntent)}

Create a structured system design containing:

- architectureVersion
- complexityClassification
- entities
- fields for every entity
- API endpoints
- roles
- security level

Rules:
- Every entity must have an id, type and fields.
- Keep fields explicit.
- API endpoints should correspond to the entities.
- Do not generate application code yet.
- Return only valid JSON.
- Do not claim that the design has been executed or deployed.
`,

        config: {
          responseMimeType: 'application/json',

          responseSchema: {
            type: Type.OBJECT,

            required: [
              'architectureVersion',
              'entities',
              'endpoints',
              'roles',
              'securityLevel',
            ],

            properties: {
              architectureVersion: {
                type: Type.STRING,
              },

              complexityClassification: {
                type: Type.STRING,
              },

              entities: {
                type: Type.ARRAY,

                items: {
                  type: Type.OBJECT,

                  required: [
                    'id',
                    'type',
                    'fields',
                  ],

                  properties: {
                    id: {
                      type: Type.STRING,
                    },

                    type: {
                      type: Type.STRING,
                    },

                    fields: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                      },
                    },
                  },
                },
              },

              endpoints: {
                type: Type.ARRAY,

                items: {
                  type: Type.STRING,
                },
              },

              roles: {
                type: Type.ARRAY,

                items: {
                  type: Type.STRING,
                },
              },

              securityLevel: {
                type: Type.STRING,
              },
            },
          },
        },
      });

    const systemDesignTime = Math.round(
      now() - stage2Start
    );

    let systemDesign: ApplicationIR;

    try {
      systemDesign = JSON.parse(
        designResponse.text?.trim() || '{}'
      );
    } catch {
      return res.status(500).json({
        error: 'System design returned invalid JSON',
        code: 'INVALID_IR_JSON',
        runId,
      });
    }

    const irValidation =
      validateIntermediateRepresentation(systemDesign);

    console.log(
      `[${runId}] [STAGE 2] Complete in ${systemDesignTime}ms`
    );

    if (!irValidation.valid) {
      return res.status(422).json({
        error: 'Generated intermediate representation failed validation',
        code: 'INVALID_IR',
        runId,
        validation: irValidation,
      });
    }

    /**
     * ============================================================
     * STAGE 3 — ARTIFACT EMISSION
     * ============================================================
     */
    console.log(`[${runId}] [STAGE 3] Artifact Emission`);

    const stage3Start = now();

    const schemaGenerationResponse =
      await generateWithRetry({
        model: GEMINI_MODEL,

        contents: `
You are the artifact-emission stage of an AI application compiler.

SYSTEM DESIGN / INTERMEDIATE REPRESENTATION:
${JSON.stringify(systemDesign)}

Generate synchronized application artifacts based strictly
on the supplied system design.

The compiler currently targets:

1. Next.js / React frontend
2. FastAPI backend
3. PostgreSQL database
4. YAML access policies

Return:

- name
- complexity
- architectureVersion
- optimizationFlags
- pipelineOutputJson
- repairLog
- uiSchemaCode
- apiSchemaCode
- dbSchemaCode
- authSchemaYaml
- permissions

IMPORTANT:

The intermediate representation supplied above is the ONLY source of truth.
Do not redesign the application. Do not rename, omit, or invent entities,
fields, endpoints, roles, or security requirements.

UI fields must correspond to IR fields.
API models must correspond to IR fields.
Database columns must correspond to IR fields.
API routes must correspond to IR endpoints.
Permissions must reference declared IR roles and entities.

Do not return pipelineOutputJson. The server constructs it from the canonical
intermediate representation; Gemini must not regenerate or reinterpret it.

repairLog is an emission note only. Do not claim that a repair, validation,
deployment, or check occurred unless this stage actually performed it.

Do NOT claim:
- deployment
- execution
- type checking
- security auditing
- benchmark performance
- latency guarantees

unless they are actually provided as part of the input.

Return only valid JSON.
`,

        config: {
          responseMimeType: 'application/json',

          responseSchema: {
            type: Type.OBJECT,

            required: [
              'name',
              'complexity',
              'architectureVersion',
              'optimizationFlags',
              'repairLog',
              'uiSchemaCode',
              'apiSchemaCode',
              'dbSchemaCode',
              'authSchemaYaml',
              'permissions',
            ],

            properties: {
              name: {
                type: Type.STRING,
              },

              complexity: {
                type: Type.STRING,
              },

              architectureVersion: {
                type: Type.STRING,
              },

              optimizationFlags: {
                type: Type.ARRAY,

                items: {
                  type: Type.STRING,
                },
              },

              repairLog: {
                type: Type.STRING,
              },

              uiSchemaCode: {
                type: Type.STRING,
              },

              apiSchemaCode: {
                type: Type.STRING,
              },

              dbSchemaCode: {
                type: Type.STRING,
              },

              authSchemaYaml: {
                type: Type.STRING,
              },

              permissions: {
                type: Type.OBJECT,

                properties: {
                  admin: {
                    type: Type.ARRAY,

                    items: {
                      type: Type.OBJECT,

                      properties: {
                        entity: {
                          type: Type.STRING,
                        },

                        read: {
                          type: Type.BOOLEAN,
                        },

                        write: {
                          type: Type.BOOLEAN,
                        },

                        update: {
                          type: Type.BOOLEAN,
                        },

                        delete: {
                          type: Type.BOOLEAN,
                        },
                      },
                    },
                  },

                  member: {
                    type: Type.ARRAY,

                    items: {
                      type: Type.OBJECT,

                      properties: {
                        entity: {
                          type: Type.STRING,
                        },

                        read: {
                          type: Type.BOOLEAN,
                        },

                        write: {
                          type: Type.BOOLEAN,
                        },

                        update: {
                          type: Type.BOOLEAN,
                        },

                        delete: {
                          type: Type.BOOLEAN,
                        },
                      },
                    },
                  },

                  guest: {
                    type: Type.ARRAY,

                    items: {
                      type: Type.OBJECT,

                      properties: {
                        entity: {
                          type: Type.STRING,
                        },

                        read: {
                          type: Type.BOOLEAN,
                        },

                        write: {
                          type: Type.BOOLEAN,
                        },

                        update: {
                          type: Type.BOOLEAN,
                        },

                        delete: {
                          type: Type.BOOLEAN,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

    const codeEmissionTime = Math.round(
      now() - stage3Start
    );

    let parsedData: any;

    try {
      parsedData = JSON.parse(
        schemaGenerationResponse.text?.trim() || '{}'
      );
    } catch {
      return res.status(500).json({
        error: 'Artifact generation returned invalid JSON',
        code: 'INVALID_ARTIFACT_JSON',
        runId,
      });
    }

    /**
     * ============================================================
     * STAGE 4 — DETERMINISTIC VALIDATION
     * ============================================================
     */
    console.log(`[${runId}] [STAGE 4] Validation`);

    const stage4Start = now();

    const validation =
      validateCrossLayerOutput(
        systemDesign,
        {
        uiCode: parsedData.uiSchemaCode || '',
        apiCode: parsedData.apiSchemaCode || '',
        dbCode: parsedData.dbSchemaCode || '',
        authYaml: parsedData.authSchemaYaml || '',
          permissions: parsedData.permissions,
        }
      );

    const validationTime = Math.round(
      now() - stage4Start
    );

    /**
     * Repair status is based on actual validation,
     * not on repairLog length.
     */
    const emissionNotes =
      typeof parsedData.repairLog === 'string'
        ? parsedData.repairLog.trim()
        : '';

    const consistencyStatus =
      validation.valid
        ? 'SYNCED'
        : 'VALIDATION_FAILED';

    /**
     * ============================================================
     * FINAL METRICS
     * ============================================================
     */
    const totalDurationMs = Math.round(
      now() - compilationStart
    );

    const tokensUsed =
      (extractionResponse.usageMetadata?.totalTokenCount || 0) +
      (designResponse.usageMetadata?.totalTokenCount || 0) +
      (schemaGenerationResponse.usageMetadata?.totalTokenCount || 0);

    const metrics: CompilationMetrics = {
      durationMs: totalDurationMs,

      inferenceTime:
        formatDuration(totalDurationMs),

      tokensUsed,

      llmCalls: 3,
    };

    /**
     * ============================================================
     * FINAL RESPONSE
     * ============================================================
     */
    const output = {
      id: runId,
      runId,
      model: GEMINI_MODEL,

      name:
        parsedData.name ||
        'Generated Application',

      icon: 'layers',

      complexity:
        parsedData.complexity ||
        systemDesign.complexityClassification ||
        'L2 - Dynamic',

      prompt: trimmedPrompt,

      architectureVersion:
        parsedData.architectureVersion ||
        systemDesign.architectureVersion ||
        '1.0.0',

      optimizationFlags:
        Array.isArray(parsedData.optimizationFlags)
          ? parsedData.optimizationFlags
          : [],

      /**
       * This is the actual central IR.
       */
      pipelineOutputJson:
        JSON.stringify(
          systemDesign,
          null,
          2
        ),

      /**
       * We have NOT run tsc here.
       * Therefore we do not claim TypeScript validation.
       */
      typeSafetyChecked: false,

      consistencyStatus,

      repairLog:
        emissionNotes ||
        'No server-side corrections were applied.',

      /**
       * Real measurements from this request.
       */
      inferenceTime:
        metrics.inferenceTime,

      tokensUsed:
        metrics.tokensUsed,

      metrics,

      stageTimings: {
        intentExtraction: {
          durationMs: intentTime,
        } satisfies StageTiming,

        systemDesign: {
          durationMs: systemDesignTime,
        } satisfies StageTiming,

        codeEmission: {
          durationMs: codeEmissionTime,
        } satisfies StageTiming,

        validation: {
          durationMs: validationTime,
        } satisfies StageTiming,
      },

      validation: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      },

      artifacts: {
        ui: parsedData.uiSchemaCode || '',
        api: parsedData.apiSchemaCode || '',
        database: parsedData.dbSchemaCode || '',
        auth: parsedData.authSchemaYaml || '',
      },

      /**
       * Generated artifacts.
       */
      uiSchemaCode:
        parsedData.uiSchemaCode || '',

      apiSchemaCode:
        parsedData.apiSchemaCode || '',

      dbSchemaCode:
        parsedData.dbSchemaCode || '',

      authSchemaYaml:
        parsedData.authSchemaYaml || '',

      permissions:
        parsedData.permissions || {
          admin: [],
          member: [],
          guest: [],
        },

      /**
       * Keep dependencies empty unless
       * the compiler actually determines them.
       */
      dependencies: [],
    };

    console.log(
      `[${runId}] Compilation complete`,
      {
        duration: metrics.inferenceTime,
        tokens: metrics.tokensUsed,
        validation: validation.valid,
        repairs: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }
    );

    return res.json({
      simulated: false,
      data: output,
    });
  } catch (error) {
    console.error(
      `[${runId}] Compilation error:`,
      error
    );

    return res.status(500).json({
      error: 'Compilation failed',
      code: 'COMPILATION_ERROR',
      runId,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown compiler error',
    });
  }
});

/**
 * Development-only simulator.
 *
 * IMPORTANT:
 * This is intentionally NOT used automatically by /api/generate.
 *
 * If you want to use a simulator during local development,
 * call it explicitly from a separate development route.
 */
function simulateCompilation(prompt: string) {
  const words = prompt.split(/\s+/);

  const entities = words
    .filter((word) =>
      /^[A-Z][a-zA-Z]+/.test(word)
    )
    .map((word) =>
      word.replace(/[^a-zA-Z]/g, '')
    )
    .filter((word) => word.length > 2);

  const matchedEntities =
    entities.length > 0
      ? Array.from(new Set(entities)).slice(0, 3)
      : ['User', 'Record'];

  return {
    mode: 'DEVELOPMENT_SIMULATION',

    prompt,

    entities: matchedEntities,

    message:
      'This is a development-only simulation and not a real compilation.',
  };
}

/**
 * Optional development-only simulator endpoint.
 *
 * It is disabled in production.
 */
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/simulate', (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt must be a string',
      });
    }

    return res.json({
      simulated: true,
      data: simulateCompilation(prompt),
    });
  });
}

/**
 * Vite / production static serving
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },

      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(
      process.cwd(),
      'dist'
    );

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(
        path.join(distPath, 'index.html')
      );
    });
  }

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `Synapse compiler running on port ${PORT}`
      );

      console.log(
        `Model: ${GEMINI_MODEL}`
      );

      console.log(
        `LLM configured: ${Boolean(
          process.env.GEMINI_API_KEY
        )}`
      );
    }
  );
}

startServer();
