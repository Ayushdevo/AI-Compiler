import React, { useState } from 'react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CompilerScreen, {
  CompilationResult,
} from './components/CompilerScreen';
import SchemaScreen from './components/SchemaScreen';
import MetricsScreen from './components/MetricsScreen';
import LibraryScreen from './components/LibraryScreen';

import {
  GOLD_TEMPLATES,
  Screen,
  TemplateData,
} from './types';

import {
  Cpu,
  Activity,
  BookOpen,
  Layers,
} from 'lucide-react';


/* ============================================================
   TYPES
   ============================================================ */

interface ApiResponse {
  success?: boolean;
  data?: any;
  error?: string;
  message?: string;

  [key: string]: any;
}


/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Convert a backend response into the structure expected
 * by CompilerScreen.
 *
 * This is intentionally defensive because the backend may
 * return either:
 *
 * {
 *   data: {...}
 * }
 *
 * or directly:
 *
 * {
 *   id: "...",
 *   pipelineOutputJson: "..."
 * }
 */
function normalizeCompilationResult(
  response: ApiResponse
): CompilationResult | null {

  const raw =
    response?.data &&
    typeof response.data === 'object'
      ? response.data
      : response;

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  /*
   * Some backend versions may return metrics in slightly
   * different locations. We normalize them here.
   */

  const metrics = raw.metrics || {};

  const stageTimings =
    raw.stageTimings || {};


  const validation =
    raw.validation || {
      valid: false,
      errors: [],
      warnings: [],
    };


  const result: CompilationResult = {
    id:
      raw.id ||
      raw.runId ||
      `run_${Date.now()}`,

    model:
      typeof raw.model === 'string'
        ? raw.model
        : '—',

    name:
      raw.name ||
      'Untitled Compilation',

    complexity:
      raw.complexity ||
      'UNKNOWN',

    prompt:
      raw.prompt ||
      '',

    architectureVersion:
      raw.architectureVersion ||
      raw.architecture_version ||
      'v1',

    optimizationFlags:
      Array.isArray(raw.optimizationFlags)
        ? raw.optimizationFlags
        : Array.isArray(raw.optimization_flags)
          ? raw.optimization_flags
          : [],

    pipelineOutputJson:
      typeof raw.pipelineOutputJson === 'string'
        ? raw.pipelineOutputJson
        : typeof raw.pipeline_output_json === 'string'
          ? raw.pipeline_output_json
          : JSON.stringify(
              raw.pipelineOutput ||
              raw.ir ||
              {},
              null,
              2
            ),

    typeSafetyChecked:
      Boolean(
        raw.typeSafetyChecked ??
        raw.type_safety_checked ??
        false
      ),

    consistencyStatus:
      raw.consistencyStatus ||
      raw.consistency_status ||
      'NOT_RUN',

    repairLog:
      raw.repairLog ||
      raw.repair_log ||
      'No repair information returned.',

    inferenceTime:
      raw.inferenceTime ||
      raw.inference_time ||
      (
        metrics.durationMs != null
          ? `${metrics.durationMs}ms`
          : '—'
      ),

    tokensUsed:
      Number(
        raw.tokensUsed ??
        raw.tokens_used ??
        metrics.tokensUsed ??
        metrics.tokens_used ??
        0
      ),

    metrics: {
      durationMs:
        Number(
          metrics.durationMs ??
          metrics.duration_ms ??
          raw.durationMs ??
          raw.duration_ms ??
          0
        ),

      inferenceTime:
        metrics.inferenceTime ||
        metrics.inference_time ||
        raw.inferenceTime ||
        raw.inference_time ||
        '—',

      tokensUsed:
        Number(
          metrics.tokensUsed ??
          metrics.tokens_used ??
          raw.tokensUsed ??
          raw.tokens_used ??
          0
        ),

      llmCalls:
        Number(
          metrics.llmCalls ??
          metrics.llm_calls ??
          raw.llmCalls ??
          raw.llm_calls ??
          1
        ),
    },

    stageTimings: {
      intentExtraction: {
        durationMs:
          Number(
            stageTimings.intentExtraction?.durationMs ??
            stageTimings.intentExtraction?.duration_ms ??
            0
          ),
      },

      systemDesign: {
        durationMs:
          Number(
            stageTimings.systemDesign?.durationMs ??
            stageTimings.systemDesign?.duration_ms ??
            0
          ),
      },

      codeEmission: {
        durationMs:
          Number(
            stageTimings.codeEmission?.durationMs ??
            stageTimings.codeEmission?.duration_ms ??
            0
          ),
      },

      validation: {
        durationMs:
          Number(
            stageTimings.validation?.durationMs ??
            stageTimings.validation?.duration_ms ??
            0
          ),
      },
    },

    validation: {
      valid: Boolean(validation.valid),

      errors:
        Array.isArray(validation.errors)
          ? validation.errors
          : [],

      warnings:
        Array.isArray(validation.warnings)
          ? validation.warnings
          : [],
    },

    uiSchemaCode:
      raw.uiSchemaCode ||
      raw.ui_schema_code ||
      '',

    apiSchemaCode:
      raw.apiSchemaCode ||
      raw.api_schema_code ||
      '',

    dbSchemaCode:
      raw.dbSchemaCode ||
      raw.db_schema_code ||
      '',

    authSchemaYaml:
      raw.authSchemaYaml ||
      raw.auth_schema_yaml ||
      '',

    permissions:
      raw.permissions,
  };

  return result;
}


/**
 * If the backend still returns TemplateData along with the
 * compilation result, keep the template selector working.
 */
function extractTemplate(
  response: ApiResponse
): TemplateData | null {

  const raw =
    response?.data &&
    typeof response.data === 'object'
      ? response.data
      : null;

  if (!raw) {
    return null;
  }

  /*
   * Only treat the backend result as TemplateData when it
   * actually contains template-like fields.
   */
  if (
    typeof raw.id === 'string' &&
    typeof raw.prompt === 'string' &&
    typeof raw.label === 'string'
  ) {
    return raw as TemplateData;
  }

  return null;
}


/* ============================================================
   APP
   ============================================================ */

export default function App() {

  const [
    currentScreen,
    setCurrentScreen,
  ] = useState<Screen>('compiler');


  const [
    template,
    setTemplate,
  ] = useState<TemplateData>(
    GOLD_TEMPLATES.crm
  );


  const [
    promptInput,
    setPromptInput,
  ] = useState<string>(
    GOLD_TEMPLATES.crm.prompt
  );


  /* ==========================================================
     REAL COMPILATION STATE
     ========================================================== */

  const [
    isCompiling,
    setIsCompiling,
  ] = useState(false);


  const [
    compilationResult,
    setCompilationResult,
  ] = useState<CompilationResult | null>(
    null
  );

  const [compileError, setCompileError] = useState<string | null>(null);


  /*
   * Used only by Sidebar to display pipeline state.
   *
   * 1 = running
   * 4 = completed
   */
  const [
    compileStep,
    setCompileStep,
  ] = useState(0);


  /* ==========================================================
     START COMPILATION
     ========================================================== */

  const startCompilation = async () => {

    if (isCompiling) {
      return;
    }


    const prompt =
      promptInput.trim();


    if (prompt.length < 10) {
      console.warn(
        'Compilation request is too short.'
      );

      return;
    }


    /* --------------------------------------------------------
       START
       -------------------------------------------------------- */

    setIsCompiling(true);
    setCompileError(null);

    setCompileStep(1);

    /*
     * Clear the previous result.
     *
     * This prevents an old successful compilation from
     * appearing while a new request is running.
     */
    setCompilationResult(null);


    try {

      /* ------------------------------------------------------
         REAL BACKEND REQUEST
         ------------------------------------------------------ */

      const response =
        await fetch(
          '/api/generate',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              prompt,
            }),
          }
        );


      /* ------------------------------------------------------
         HANDLE NON-200 RESPONSES
         ------------------------------------------------------ */

      let json: ApiResponse = {};

      try {
        json = await response.json();
      } catch {
        throw new Error(
          `Compiler returned an invalid response (${response.status}).`
        );
      }


      if (!response.ok) {

        throw new Error(
          json.error ||
          json.message ||
          `Compiler request failed with HTTP ${response.status}.`
        );

      }


      /* ------------------------------------------------------
         NORMALIZE RESULT
         ------------------------------------------------------ */

      const result =
        normalizeCompilationResult(json);


      if (!result) {

        throw new Error(
          'Compiler returned no usable compilation result.'
        );

      }


      /* ------------------------------------------------------
         STORE REAL RESULT
         ------------------------------------------------------ */

      setCompilationResult(result);

      setTemplate((current) => ({
        ...current,
        id: result.id,
        name: result.name,
        prompt: result.prompt,
        complexity: result.complexity,
        architectureVersion: result.architectureVersion,
        optimizationFlags: result.optimizationFlags,
        pipelineOutputJson: result.pipelineOutputJson,
        validation: result.validation,
        typeSafetyChecked: result.typeSafetyChecked,
        consistencyStatus: result.consistencyStatus as TemplateData['consistencyStatus'],
        repairLog: result.repairLog,
        inferenceTime: result.metrics.inferenceTime,
        tokensUsed: result.metrics.tokensUsed,
        uiSchemaCode: result.uiSchemaCode,
        apiSchemaCode: result.apiSchemaCode,
        dbSchemaCode: result.dbSchemaCode,
        authSchemaYaml: result.authSchemaYaml,
      }));


      /*
       * Keep template state compatible with the rest of the
       * application if the backend provides template data.
       */
      const returnedTemplate =
        extractTemplate(json);


      if (returnedTemplate) {
        setTemplate(returnedTemplate);
      }


      /* ------------------------------------------------------
         COMPLETE
         ------------------------------------------------------ */

      setCompileStep(4);

    } catch (error) {

      console.error(
        'Compiler request failed:',
        error
      );


      /*
       * Do NOT silently restore fake/mock values.
       *
       * This is important for the authenticity of the demo.
       */
      setCompilationResult(null);

      setCompileError(
        error instanceof Error
          ? error.message
          : 'Compilation failed'
      );

      setCompileStep(0);

    } finally {

      setIsCompiling(false);

    }
  };


  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const navigate = (
    screen: Screen
  ) => {
    setCurrentScreen(screen);
  };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (

    <div className="min-h-screen bg-[#020b14] text-[#d4e4fa] flex flex-col font-sans select-none antialiased cyber-grid-bg">


      {/* ======================================================
          HEADER
          ====================================================== */}

      <Header
        currentScreen={
          currentScreen
        }

        isCompiling={
          isCompiling
        }

        statusText={
          isCompiling
            ? 'COMPILER RUNNING'
            : currentScreen === 'schema'
              ? 'RUNTIME STABLE'
              : 'ENGINE ONLINE'
        }
      />


      {/* ======================================================
          MAIN FRAME
          ====================================================== */}

      <div className="flex-1 flex pt-16 h-[calc(100vh-64px)] overflow-hidden">


        {/* ====================================================
            DESKTOP NAVIGATION
            ==================================================== */}

        <nav className="hidden sm:flex flex-col w-18 bg-[#030d19]/95 border-r border-[#152538] items-center py-6 gap-6 select-none relative z-25 shrink-0">


          {/* COMPILER */}

          <button
            onClick={() =>
              navigate('compiler')
            }

            className={`p-3.5 rounded-xl transition-all cursor-pointer relative group ${
              currentScreen === 'compiler'

                ? 'bg-gradient-to-tr from-[#6265f0] to-[#8083ff] text-white shadow-[0_0_15px_rgba(98,101,240,0.4)]'

                : 'text-[#908fa0] hover:text-[#c0c1ff] hover:bg-[#122131]/60'
            }`}
          >

            <Cpu className="h-5 w-5" />

            <span className="absolute left-20 bg-[#091424] border border-[#1c2b3c] text-[#d4e4fa] font-label-caps text-[9px] tracking-wider px-2.5 py-1.5 rounded-lg shadow-xl scale-0 group-hover:scale-100 transition-all origin-left duration-200 z-50 whitespace-nowrap">
              Compiler Dashboard
            </span>

          </button>


          {/* SCHEMA */}

          <button
            onClick={() =>
              navigate('schema')
            }

            className={`p-3.5 rounded-xl transition-all cursor-pointer relative group ${
              currentScreen === 'schema'

                ? 'bg-gradient-to-tr from-[#6265f0] to-[#8083ff] text-white shadow-[0_0_15px_rgba(98,101,240,0.4)]'

                : 'text-[#908fa0] hover:text-[#c0c1ff] hover:bg-[#122131]/60'
            }`}
          >

            <Layers className="h-5 w-5" />

            <span className="absolute left-20 bg-[#091424] border border-[#1c2b3c] text-[#d4e4fa] font-label-caps text-[9px] tracking-wider px-2.5 py-1.5 rounded-lg shadow-xl scale-0 group-hover:scale-100 transition-all origin-left duration-200 z-50 whitespace-nowrap">
              Output Explorer
            </span>

          </button>


          {/* METRICS */}

          <button
            onClick={() =>
              navigate('metrics')
            }

            className={`p-3.5 rounded-xl transition-all cursor-pointer relative group ${
              currentScreen === 'metrics'

                ? 'bg-gradient-to-tr from-[#6265f0] to-[#8083ff] text-white shadow-[0_0_15px_rgba(98,101,240,0.4)]'

                : 'text-[#908fa0] hover:text-[#c0c1ff] hover:bg-[#122131]/60'
            }`}
          >

            <Activity className="h-5 w-5" />

            <span className="absolute left-20 bg-[#091424] border border-[#1c2b3c] text-[#d4e4fa] font-label-caps text-[9px] tracking-wider px-2.5 py-1.5 rounded-lg shadow-xl scale-0 group-hover:scale-100 transition-all origin-left duration-200 z-50 whitespace-nowrap">
              System Metrics
            </span>

          </button>


          {/* LIBRARY */}

          <button
            onClick={() =>
              navigate('library')
            }

            className={`p-3.5 rounded-xl transition-all cursor-pointer relative group ${
              currentScreen === 'library'

                ? 'bg-gradient-to-tr from-[#6265f0] to-[#8083ff] text-white shadow-[0_0_15px_rgba(98,101,240,0.4)]'

                : 'text-[#908fa0] hover:text-[#c0c1ff] hover:bg-[#122131]/60'
            }`}
          >

            <BookOpen className="h-5 w-5" />

            <span className="absolute left-20 bg-[#091424] border border-[#1c2b3c] text-[#d4e4fa] font-label-caps text-[9px] tracking-wider px-2.5 py-1.5 rounded-lg shadow-xl scale-0 group-hover:scale-100 transition-all origin-left duration-200 z-50 whitespace-nowrap">
              Dataset Library
            </span>

          </button>

        </nav>


        {/* ====================================================
            SECONDARY SIDEBAR
            ==================================================== */}

        <Sidebar
          currentScreen={
            currentScreen
          }

          isCompiling={
            isCompiling
          }

          compileStep={
            compileStep
          }

          template={
            template
          }

          hasCompilation={Boolean(compilationResult)}

          onNavigate={navigate}
        />


        {/* ====================================================
            CONTENT
            ==================================================== */}

        <main className="flex-1 flex flex-col overflow-y-auto bg-[#020b14]/70 relative custom-scrollbar pb-16 md:pb-0 animate-fade-in">


          {/* ==================================================
              COMPILER
              ================================================== */}

          {currentScreen === 'compiler' && (

            <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">

              <CompilerScreen

                promptInput={
                  promptInput
                }

                setPromptInput={
                  setPromptInput
                }

                selectedTemplate={
                  template
                }

                setTemplate={
                  setTemplate
                }

                onNavigate={
                  navigate
                }

                isCompiling={
                  isCompiling
                }

                onStartCompilation={
                  startCompilation
                }

                compilationResult={
                  compilationResult
                }

                compileError={compileError}

              />

            </div>

          )}


          {/* ==================================================
              SCHEMA
              ================================================== */}

          {currentScreen === 'schema' && (

            <SchemaScreen
              selectedTemplate={
                template
              }

              setTemplate={
                setTemplate
              }
            />

          )}


          {/* ==================================================
              METRICS
              ================================================== */}

          {currentScreen === 'metrics' && (

            <MetricsScreen compilationResult={compilationResult} />

          )}


          {/* ==================================================
              LIBRARY
              ================================================== */}

          {currentScreen === 'library' && (

            <LibraryScreen />

          )}

        </main>

      </div>


      {/* ======================================================
          MOBILE NAVIGATION
          ====================================================== */}

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#030d19] border-t border-[#464554] flex items-center justify-around z-50 px-2 select-none">


        {/* COMPILER */}

        <button
          onClick={() =>
            navigate('compiler')
          }

          className={`flex flex-col items-center gap-1 cursor-pointer w-16 py-1 ${
            currentScreen === 'compiler'
              ? 'text-[#c0c1ff]'
              : 'text-[#908fa0]'
          }`}
        >

          <Cpu className="h-[18px] w-[18px]" />

          <span className="text-[10px] font-label-caps font-bold">
            Compiler
          </span>

        </button>


        {/* SCHEMA */}

        <button
          onClick={() =>
            navigate('schema')
          }

          className={`flex flex-col items-center gap-1 cursor-pointer w-18 py-1 ${
            currentScreen === 'schema'
              ? 'text-[#c0c1ff]'
              : 'text-[#908fa0]'
          }`}
        >

          <Layers className="h-[18px] w-[18px]" />

          <span className="text-[10px] font-label-caps font-bold">
            Schema
          </span>

        </button>


        {/* METRICS */}

        <button
          onClick={() =>
            navigate('metrics')
          }

          className={`flex flex-col items-center gap-1 cursor-pointer w-16 py-1 ${
            currentScreen === 'metrics'
              ? 'text-[#c0c1ff]'
              : 'text-[#908fa0]'
          }`}
        >

          <Activity className="h-[18px] w-[18px]" />

          <span className="text-[10px] font-label-caps font-bold">
            Metrics
          </span>

        </button>


        {/* LIBRARY */}

        <button
          onClick={() =>
            navigate('library')
          }

          className={`flex flex-col items-center gap-1 cursor-pointer w-16 py-1 ${
            currentScreen === 'library'
              ? 'text-[#c0c1ff]'
              : 'text-[#908fa0]'
          }`}
        >

          <BookOpen className="h-[18px] w-[18px]" />

          <span className="text-[10px] font-label-caps font-bold">
            Library
          </span>

        </button>

      </nav>

    </div>
  );
}
