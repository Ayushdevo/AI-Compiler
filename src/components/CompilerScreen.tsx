import React, { useState } from 'react';
import {
  Bolt,
  Copy,
  Check,
  Users,
  School,
  ShoppingCart,
  Landmark,
  ShieldCheck,
  Zap,
  ChevronRight,
  AlertTriangle,
  Clock,
  Database,
  Code2,
} from 'lucide-react';

import {
  GOLD_TEMPLATES,
  TemplateData,
} from '../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface CompilationMetrics {
  durationMs: number;
  inferenceTime: string;
  tokensUsed: number;
  llmCalls: number;
}

interface StageTiming {
  durationMs: number;
}

export interface CompilationResult {
  id: string;
  model: string;
  name: string;
  complexity: string;
  prompt: string;
  architectureVersion: string;
  optimizationFlags: string[];

  pipelineOutputJson: string;

  typeSafetyChecked: boolean;
  consistencyStatus: string;
  repairLog: string;

  inferenceTime: string;
  tokensUsed: number;

  metrics: CompilationMetrics;

  stageTimings: {
    intentExtraction: StageTiming;
    systemDesign: StageTiming;
    codeEmission: StageTiming;
    validation: StageTiming;
  };

  validation: ValidationResult;

  uiSchemaCode: string;
  apiSchemaCode: string;
  dbSchemaCode: string;
  authSchemaYaml: string;

  permissions?: unknown;
}

interface CompilerScreenProps {
  promptInput: string;
  setPromptInput: (p: string) => void;

  selectedTemplate: TemplateData;
  setTemplate: (t: TemplateData) => void;

  onNavigate: (
    s: 'compiler' | 'schema' | 'metrics' | 'library'
  ) => void;

  isCompiling: boolean;

  onStartCompilation: () => void;

  /**
   * Actual response returned by /api/generate.
   */
  compilationResult?: CompilationResult | null;
  compileError?: string | null;
}

export default function CompilerScreen({
  promptInput,
  setPromptInput,
  selectedTemplate,
  setTemplate,
  onNavigate,
  isCompiling,
  onStartCompilation,
  compilationResult,
  compileError,
}: CompilerScreenProps) {
  const [activeTab, setActiveTab] =
    useState<'ir' | 'validation'>('ir');

  const [copied, setCopied] = useState(false);

  const hasCompilation =
    Boolean(compilationResult);

  /*
   * IMPORTANT:
   *
   * Before compilation:
   *   We show a neutral empty state.
   *
   * After compilation:
   *   We show ONLY values returned by server.ts.
   */

  const irOutput =
    compilationResult?.pipelineOutputJson || '';

  const validation =
    compilationResult?.validation || null;

  const isValid =
    compilationResult?.validation.valid === true;

  const consistencyStatus =
    compilationResult?.consistencyStatus ||
    'NOT_RUN';

  const repairLog =
    compilationResult?.repairLog ||
    'No compilation has been executed yet.';

  const inferenceTime =
    compilationResult?.inferenceTime ||
    '—';

  const tokensUsed =
    compilationResult?.tokensUsed ?? null;

  const handleCopy = async () => {
    if (!irOutput) return;

    try {
      await navigator.clipboard.writeText(
        irOutput
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const selectTemplate = (key: string) => {
    const gold = GOLD_TEMPLATES[key];

    if (!gold) return;

    setTemplate(gold);
    setPromptInput(gold.prompt);
  };

  /*
   * Pretty-print JSON.
   */
  const formatJsonOutput = (
    jsonString: string
  ) => {
    if (!jsonString) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Code2 className="w-10 h-10 text-[#465a73] mb-4" />

          <p className="text-sm text-[#908fa0]">
            No compilation result yet.
          </p>

          <p className="text-xs text-[#465a73] mt-2">
            Enter a requirement and run the compiler.
          </p>
        </div>
      );
    }

    try {
      const parsed =
        JSON.parse(jsonString);

      const pretty =
        JSON.stringify(
          parsed,
          null,
          2
        );

      return pretty
        .split('\n')
        .map((line, index) => {
          const highlighted =
            line
              .replace(
                /"([^"]+)":/g,
                '<span class="text-[#c0c1ff] font-semibold">"$1"</span>:'
              )
              .replace(
                /: "([^"]*)"/g,
                ': <span class="text-emerald-400">"$1"</span>'
              )
              .replace(
                /: (true|false|null)/g,
                ': <span class="text-amber-400 font-bold">$1</span>'
              )
              .replace(
                /: (-?\d+(\.\d+)?)/g,
                ': <span class="text-amber-400 font-bold">$1</span>'
              );

          return (
            <div
              key={index}
              className="flex hover:bg-[#122131]/20 font-mono py-0.5"
            >
              <span className="w-10 shrink-0 select-none text-right text-[#465a73] pr-4 text-xs border-r border-[#152538]">
                {index + 1}
              </span>

              <span
                className="pl-4 text-xs whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlighted,
                }}
              />
            </div>
          );
        });
    } catch {
      return (
        <pre className="font-mono text-xs text-[#d4e4fa] whitespace-pre-wrap">
          {jsonString}
        </pre>
      );
    }
  };

  const statusClass = (
    status: string
  ) => {
    if (
      status === 'VALID' ||
      status === 'SYNCED' ||
      status === 'REPAIRED'
    ) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }

    if (
      status === 'NOT_RUN' ||
      status === 'NOT_CHECKED'
    ) {
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }

    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="space-y-8 flex-1 w-full max-w-7xl mx-auto">

      {compileError && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <span className="font-bold">Compilation failed:</span> {compileError}
        </div>
      )}

      {/* ====================================================== */}
      {/* COMPILER INPUT                                         */}
      {/* ====================================================== */}

      <div className="relative group">

        <div className="absolute -inset-1 bg-gradient-to-r from-[#6265f0]/30 to-[#8083ff]/15 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />

        <div className="relative bg-[#071424] rounded-2xl border border-[#1c2b3c] overflow-hidden cyber-panel-glow">

          {/* HEADER */}

          <div className="bg-[#030d19] px-5 py-3 border-b border-[#1c2b3c] flex justify-between items-center">

            <div className="flex items-center gap-2">

              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />

              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />

              <span className="font-label-caps text-[10px] text-[#908fa0] ml-2 tracking-wider">
                SYNAPSE_COMPILE_SHELL
              </span>

            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#6265f0] bg-[#6265f0]/10 border border-[#8083ff]/20 px-2.5 py-0.5 rounded-full">

              <Zap className="w-3 h-3 text-[#c0c1ff]" />

              {isCompiling
                ? 'RUNNING'
                : hasCompilation
                  ? 'COMPLETED'
                  : 'READY'}

            </div>

          </div>

          {/* INPUT */}

          <div className="p-6">

            <div className="flex flex-col md:flex-row gap-6">

              <div className="flex-1 flex flex-col">

                <label className="block font-label-caps text-[10px] text-[#908fa0] mb-3 tracking-widest font-black">
                  INPUT REQUIREMENT
                </label>

                <div className="flex-1 min-h-[160px] bg-[#020b14]/80 rounded-xl border border-[#152538] flex overflow-hidden">

                  <div className="w-10 bg-[#030d19] border-r border-[#152538] flex flex-col items-center pt-4 text-[#465a73] font-mono select-none text-xs leading-6">

                    {[1, 2, 3, 4, 5, 6].map(
                      (n) => (
                        <div key={n}>
                          {n}
                        </div>
                      )
                    )}

                  </div>

                  <textarea
                    className="flex-grow bg-transparent text-sm font-mono text-[#d4e4fa] p-4 resize-none focus:outline-none leading-relaxed placeholder-slate-700 h-40"
                    value={promptInput}
                    onChange={(event) =>
                      setPromptInput(
                        event.target.value
                      )
                    }
                    placeholder="Describe the application you want to compile..."
                    spellCheck={false}
                    disabled={isCompiling}
                  />

                </div>

              </div>

              {/* COMPILE BUTTON */}

              <div className="md:w-60 flex flex-col justify-end shrink-0">

                <button
                  type="button"
                  onClick={onStartCompilation}
                  disabled={
                    isCompiling ||
                    promptInput.trim().length < 10
                  }
                  className={`w-full h-40 rounded-xl font-bold flex flex-col items-center justify-center gap-3 transition-all border ${
                    isCompiling ||
                    promptInput.trim().length < 10
                      ? 'bg-[#030d19] text-[#908fa0] border-[#1c2b3c] cursor-not-allowed'
                      : 'bg-gradient-to-tr from-[#6265f0] to-[#8083ff] text-white border-transparent hover:brightness-110 active:scale-97 shadow-lg shadow-[#8083ff]/20 cursor-pointer'
                  }`}
                >

                  <div className="relative flex items-center justify-center">

                    {isCompiling && (
                      <span className="absolute w-12 h-12 bg-[#c0c1ff]/20 rounded-full animate-ping" />
                    )}

                    <Bolt
                      className={`h-8 w-8 ${
                        isCompiling
                          ? 'animate-spin text-[#c0c1ff]'
                          : 'text-white'
                      }`}
                    />

                  </div>

                  <span className="font-label-caps text-xs tracking-widest font-black">
                    {isCompiling
                      ? 'COMPILING'
                      : 'RUN COMPILER'}
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* TEMPLATE SELECTOR                                      */}
      {/* ====================================================== */}

      <div>

        <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">
          STARTING SPECIFICATION TEMPLATES
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {[
            {
              id: 'crm',
              label: 'CRM',
              description: 'Contacts & Leads',
              icon: Users,
            },
            {
              id: 'lms',
              label: 'LMS',
              description: 'Classroom Engine',
              icon: School,
            },
            {
              id: 'e-commerce',
              label: 'Checkout',
              description: 'E-Commerce Flow',
              icon: ShoppingCart,
            },
            {
              id: 'fintech',
              label: 'Fintech',
              description: 'Wallets & Ledgers',
              icon: Landmark,
            },
          ].map(
            ({
              id,
              label,
              description,
              icon: Icon,
            }) => (

              <button
                key={id}
                type="button"
                onClick={() =>
                  selectTemplate(id)
                }
                className={`relative flex items-center gap-3.5 p-4 bg-[#071424] border rounded-xl hover:bg-[#0c1c2e]/80 hover:border-[#8083ff]/40 transition-all text-left cursor-pointer ${
                  selectedTemplate.id === id
                    ? 'border-[#8083ff] text-white shadow-[#8083ff]/15'
                    : 'border-[#1c2b3c] text-[#c7c4d7]'
                }`}
              >

                <div
                  className={`p-2.5 rounded-lg ${
                    selectedTemplate.id === id
                      ? 'bg-[#6265f0]/20 text-[#c0c1ff]'
                      : 'bg-[#122131] text-[#908fa0]'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="flex flex-col min-w-0">

                  <span className="font-label-caps text-[11px] font-bold tracking-wider">
                    {label}
                  </span>

                  <span className="text-[9px] text-[#908fa0] truncate mt-1">
                    {description}
                  </span>

                </div>

                {selectedTemplate.id === id && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#8083ff] rounded-bl" />
                )}

              </button>

            )
          )}

        </div>

      </div>


      {/* ====================================================== */}
      {/* WORKSPACE TABS                                         */}
      {/* ====================================================== */}

      <div className="flex flex-col gap-5">

        <div className="flex border-b border-[#1c2b3c] overflow-x-auto no-scrollbar">

          <button
            type="button"
            onClick={() =>
              setActiveTab('ir')
            }
            className={`px-5 py-3.5 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all ${
              activeTab === 'ir'
                ? 'border-[#8083ff] text-white bg-[#8083ff]/5'
                : 'border-transparent text-[#908fa0]'
            }`}
          >
            INTERMEDIATE REPRESENTATION
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate('schema')
            }
            className="px-5 py-3.5 border-b-2 border-transparent text-[#908fa0] hover:text-[#8083ff] transition-all font-label-caps text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5"
          >
            SCHEMA WORKBENCH

            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('validation')
            }
            className={`px-5 py-3.5 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all ${
              activeTab === 'validation'
                ? 'border-[#8083ff] text-white bg-[#8083ff]/5'
                : 'border-transparent text-[#908fa0]'
            }`}
          >
            VALIDATION REPORT
          </button>

        </div>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ================================================== */}
          {/* MAIN PANEL                                         */}
          {/* ================================================== */}

          <div className="xl:col-span-2">

            {/* IR TAB */}

            {activeTab === 'ir' && (

              <div className="bg-[#030d19]/90 rounded-2xl border border-[#1c2b3c] overflow-hidden shadow-2xl">

                <div className="bg-[#071424] px-5 py-2.5 flex justify-between items-center border-b border-[#1c2b3c]">

                  <div className="flex items-center gap-2">

                    <span className="font-mono text-xs text-[#c0c1ff]">
                      pipeline_output.json
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
                        !hasCompilation
                          ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          : isValid
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-300 border-red-500/20'
                      }`}
                    >
                      {!hasCompilation
                        ? 'NOT_COMPILED'
                        : isValid
                          ? 'VALID'
                          : 'INVALID'}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!irOutput}
                    className="text-[#908fa0] hover:text-white disabled:opacity-30 transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#122131] border border-[#1c2b3c] text-xs font-bold"
                  >

                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}

                    <span>
                      {copied
                        ? 'Copied!'
                        : 'Copy IR'}
                    </span>

                  </button>

                </div>

                <div className="p-4 overflow-y-auto max-h-[420px] custom-scrollbar bg-[#020b14] select-text">

                  {formatJsonOutput(
                    irOutput
                  )}

                </div>

              </div>

            )}


            {/* VALIDATION TAB */}

            {activeTab === 'validation' && (

              <div className="bg-[#071424] rounded-2xl p-6 border border-[#1e2d3d] space-y-5 shadow-2xl">

                <div className="flex justify-between items-center border-b border-[#1c2b3c] pb-3">

                  <h4 className="font-label-caps text-xs text-[#c0c1ff] font-extrabold tracking-wider">
                    VALIDATION REPORT
                  </h4>

                  {hasCompilation &&
                  validation?.valid ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}

                </div>


                {/* MAIN STATUS */}

                <div
                  className={`p-4 border-l-2 rounded-r-xl ${
                    !hasCompilation
                      ? 'border-slate-500 bg-slate-500/5'
                      : validation?.valid
                        ? 'border-emerald-400 bg-emerald-500/5'
                        : 'border-amber-400 bg-amber-500/5'
                  }`}
                >

                  <p className="font-mono text-xs font-extrabold mb-1.5 tracking-wider uppercase">

                    {!hasCompilation
                      ? 'VALIDATION NOT RUN'
                      : validation?.valid
                        ? 'VALIDATION PASSED'
                        : 'VALIDATION FAILED'}

                  </p>

                  <p className="text-xs text-[#c7c4d7] leading-relaxed mt-2">

                    {!hasCompilation
                      ? 'Run the compiler to generate a real validation report.'
                      : repairLog}

                  </p>

                </div>


                {/* ERRORS */}

                {hasCompilation &&
                  validation &&
                  validation.errors.length > 0 && (

                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">

                      <p className="text-xs text-red-300 font-bold mb-2">
                        ERRORS
                      </p>

                      {validation.errors.map(
                        (error, index) => (
                          <p
                            key={index}
                            className="text-xs text-[#c7c4d7] mb-1"
                          >
                            • {error}
                          </p>
                        )
                      )}

                    </div>

                  )}


                {/* WARNINGS */}

                {hasCompilation &&
                  validation &&
                  validation.warnings.length > 0 && (

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">

                      <p className="text-xs text-amber-300 font-bold mb-2">
                        WARNINGS
                      </p>

                      {validation.warnings.map(
                        (warning, index) => (
                          <p
                            key={index}
                            className="text-xs text-[#c7c4d7] mb-1"
                          >
                            • {warning}
                          </p>
                        )
                      )}

                    </div>

                  )}

              </div>

            )}

          </div>


          {/* ================================================== */}
          {/* RIGHT SIDEBAR                                      */}
          {/* ================================================== */}

          <div className="space-y-5">

            {/* INTEGRITY */}

            <div className="bg-[#071424] rounded-2xl p-5 border border-[#1e2d3d] shadow-xl">

              <div className="flex justify-between items-center mb-4 border-b border-[#1c2b3c] pb-3">

                <h4 className="font-label-caps text-[10px] text-white tracking-wider font-extrabold">
                  INTEGRITY CHECKLIST
                </h4>

                <ShieldCheck className="h-[18px] w-[18px] text-emerald-400" />

              </div>


              <div className="space-y-2.5 font-mono text-xs">

                {/* IR */}

                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">

                  <span className="text-[#c7c4d7]">
                    IR Structure
                  </span>

                  <span
                    className={`px-2.5 py-0.5 border rounded font-black ${
                      statusClass(
                        hasCompilation
                          ? isValid
                            ? 'VALID'
                            : 'INVALID'
                          : 'NOT_RUN'
                      )
                    }`}
                  >
                    {hasCompilation
                      ? isValid
                        ? 'VALID'
                        : 'INVALID'
                      : 'NOT RUN'}
                  </span>

                </div>


                {/* API DB */}

                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">

                  <span className="text-[#c7c4d7]">
                    API ↔ DB
                  </span>

                  <span
                    className={`px-2.5 py-0.5 border rounded font-black ${
                      statusClass(
                        consistencyStatus
                      )
                    }`}
                  >
                    {hasCompilation
                      ? consistencyStatus
                      : 'NOT RUN'}
                  </span>

                </div>


                {/* UI API */}

                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">

                  <span className="text-[#c7c4d7]">
                    UI ↔ API
                  </span>

                  <span
                    className={`px-2.5 py-0.5 border rounded font-black ${
                      statusClass(
                        consistencyStatus
                      )
                    }`}
                  >
                    {hasCompilation
                      ? consistencyStatus
                      : 'NOT RUN'}
                  </span>

                </div>


                {/* TYPESCRIPT */}

                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">

                  <span className="text-[#c7c4d7]">
                    TypeScript
                  </span>

                  <span
                    className={`px-2.5 py-0.5 border rounded font-black ${
                      statusClass(
                        compilationResult?.typeSafetyChecked
                          ? 'VALID'
                          : 'NOT_CHECKED'
                      )
                    }`}
                  >
                    {compilationResult?.typeSafetyChecked
                      ? 'CHECKED'
                      : 'NOT CHECKED'}
                  </span>

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* REAL METRICS                                      */}
            {/* ================================================= */}

            <div className="bg-[#071424] rounded-2xl p-5 border border-[#1e2d3d] shadow-xl">

              <div className="flex justify-between items-center mb-4">

                <h4 className="font-label-caps text-[10px] text-[#908fa0] tracking-wider font-bold">
                  COMPILATION METRICS
                </h4>

                {hasCompilation && (
                  <span className="text-[9px] font-mono text-emerald-400">
                    LIVE RUN
                  </span>
                )}

              </div>


              <div className="grid grid-cols-2 gap-4">

                {/* TIME */}

                <div className="bg-[#030d19] p-3 rounded-xl border border-[#1c2b3c]">

                  <Clock className="w-4 h-4 text-[#c0c1ff] mb-2" />

                  <p className="font-display-md text-2xl text-[#c0c1ff] font-extrabold tracking-tight">

                    {inferenceTime}

                  </p>

                  <p className="font-label-caps text-[9px] text-[#908fa0] tracking-wider mt-1">
                    REQUEST TIME
                  </p>

                </div>


                {/* TOKENS */}

                <div className="bg-[#030d19] p-3 rounded-xl border border-[#1c2b3c]">

                  <Database className="w-4 h-4 text-[#c0c1ff] mb-2" />

                  <p className="font-display-md text-2xl text-[#d4e4fa] font-extrabold tracking-tight">

                    {tokensUsed !== null
                      ? tokensUsed.toLocaleString()
                      : '—'}

                  </p>

                  <p className="font-label-caps text-[9px] text-[#908fa0] tracking-wider mt-1">
                    TOKENS
                  </p>

                </div>

              </div>


              {/* EXTRA METRICS */}

              {compilationResult && (

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <div className="text-xs text-[#908fa0]">

                    <span className="text-white font-semibold">
                      LLM calls:
                    </span>{' '}

                    {compilationResult.metrics.llmCalls}

                  </div>


                  <div className="text-xs text-[#908fa0]">

                    <span className="text-white font-semibold">
                      Total:
                    </span>{' '}

                    {compilationResult.metrics.durationMs}ms

                  </div>

                </div>

              )}

            </div>


            {/* ================================================= */}
            {/* PIPELINE TIMINGS                                  */}
            {/* ================================================= */}

            {compilationResult && (

              <div className="bg-[#071424] rounded-2xl p-5 border border-[#1e2d3d] shadow-xl">

                <div className="flex justify-between items-center mb-4">

                  <h4 className="font-label-caps text-[10px] text-[#908fa0] tracking-wider font-bold">
                    PIPELINE TIMINGS
                  </h4>

                  <span className="text-[9px] font-mono text-[#465a73]">
                    GEMINI 3.5 FLASH
                  </span>

                </div>


                <div className="space-y-3">

                  <div className="flex justify-between text-xs">

                    <span className="text-[#908fa0]">
                      Intent extraction
                    </span>

                    <span className="text-[#c0c1ff] font-mono">
                      {compilationResult.stageTimings.intentExtraction.durationMs}ms
                    </span>

                  </div>


                  <div className="flex justify-between text-xs">

                    <span className="text-[#908fa0]">
                      System design
                    </span>

                    <span className="text-[#c0c1ff] font-mono">
                      {compilationResult.stageTimings.systemDesign.durationMs}ms
                    </span>

                  </div>


                  <div className="flex justify-between text-xs">

                    <span className="text-[#908fa0]">
                      Artifact emission
                    </span>

                    <span className="text-[#c0c1ff] font-mono">
                      {compilationResult.stageTimings.codeEmission.durationMs}ms
                    </span>

                  </div>


                  <div className="flex justify-between text-xs">

                    <span className="text-[#908fa0]">
                      Validation
                    </span>

                    <span className="text-[#c0c1ff] font-mono">
                      {compilationResult.stageTimings.validation.durationMs}ms
                    </span>

                  </div>

                </div>

              </div>

            )}


            {/* ================================================= */}
            {/* RUN INFORMATION                                   */}
            {/* ================================================= */}

            <div className="bg-[#071424] rounded-2xl p-5 border border-[#1e2d3d] shadow-xl">

              <h4 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-wider font-bold">
                RUN INFORMATION
              </h4>

              <div className="space-y-3">

                <div className="flex justify-between items-center">

                  <span className="text-xs text-[#908fa0]">
                    Compiler
                  </span>

                  <span className="text-xs font-mono text-[#d4e4fa]">
                    SYNAPSE
                  </span>

                </div>


                <div className="flex justify-between items-center">

                  <span className="text-xs text-[#908fa0]">
                    Model
                  </span>

                  <span className="text-xs font-mono text-[#c0c1ff]">
                    {hasCompilation
                      ? 'gemini-3.5-flash'
                      : '—'}
                  </span>

                </div>


                <div className="flex justify-between items-center">

                  <span className="text-xs text-[#908fa0]">
                    Run ID
                  </span>

                  <span className="text-xs font-mono text-[#c0c1ff]">
                    {compilationResult?.id || '—'}
                  </span>

                </div>


                <div className="flex justify-between items-center">

                  <span className="text-xs text-[#908fa0]">
                    Architecture
                  </span>

                  <span className="text-xs font-mono text-[#d4e4fa]">
                    {compilationResult?.architectureVersion || '—'}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
