import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu } from 'lucide-react';
import type { CompilationResult } from './CompilerScreen';

interface MetricsScreenProps { compilationResult: CompilationResult | null; }
const formatMs = (value: number) => `${value.toLocaleString()}ms`;

export default function MetricsScreen({ compilationResult }: MetricsScreenProps) {
  if (!compilationResult) return <div className="flex-grow p-6 lg:p-8"><div className="rounded-2xl border border-[#1c2b3c] bg-[#071424] p-8 text-center"><Activity className="mx-auto mb-3 h-8 w-8 text-[#8083ff]" /><h2 className="font-display-lg text-2xl font-extrabold text-white">No compilation data</h2><p className="mt-2 text-sm text-[#908fa0]">Run the compiler to view measured metrics and deterministic validation results.</p></div></div>;

  const { metrics, stageTimings, validation } = compilationResult;
  const cards = [
    ['Model', compilationResult.model || '—', Cpu], ['Duration', metrics.inferenceTime || '—', Clock],
    ['Tokens', metrics.tokensUsed.toLocaleString(), Activity], ['LLM calls', String(metrics.llmCalls), Activity],
    ['Validation', validation.valid ? 'PASS' : 'FAILED', validation.valid ? CheckCircle : AlertTriangle], ['Consistency', compilationResult.consistencyStatus, Activity],
    ['Type safety', compilationResult.typeSafetyChecked ? 'PASS' : 'NOT RUN', Activity], ['Errors / warnings', `${validation.errors.length} / ${validation.warnings.length}`, AlertTriangle],
  ] as const;
  return <div className="flex-grow p-6 lg:p-8 space-y-6 max-w-6xl">
    <header className="border-b border-[#1c2b3c] pb-5"><p className="font-mono text-xs font-bold tracking-widest text-[#8083ff]">LATEST COMPILATION</p><h2 className="font-display-lg text-3xl font-extrabold text-white">Measured compiler results</h2><p className="mt-1 text-xs text-[#908fa0]">Run ID: {compilationResult.id}</p></header>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <article key={label} className="rounded-2xl border border-[#1c2b3c] bg-[#071424] p-4"><div className="mb-3 flex items-center justify-between text-[#908fa0]"><span className="font-label-caps text-[10px] font-bold">{label}</span><Icon className="h-4 w-4" /></div><p className="font-display-md text-xl font-extrabold text-white break-words">{value}</p></article>)}</section>
    <section className="rounded-2xl border border-[#1c2b3c] bg-[#071424] p-5"><h3 className="font-display-md font-bold text-white">Stage timings</h3><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{[['Stage 1: intent', stageTimings.intentExtraction.durationMs], ['Stage 2: design', stageTimings.systemDesign.durationMs], ['Stage 3: emission', stageTimings.codeEmission.durationMs], ['Stage 4: validation', stageTimings.validation.durationMs]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-[#030d19] p-3"><p className="text-[10px] text-[#908fa0]">{label}</p><p className="mt-1 font-mono font-bold text-[#c0c1ff]">{formatMs(Number(value))}</p></div>)}</div></section>
    <section className="rounded-2xl border border-[#1c2b3c] bg-[#071424] p-5"><h3 className="font-display-md font-bold text-white">Validation details</h3>{validation.errors.length === 0 && validation.warnings.length === 0 ? <p className="mt-3 text-sm text-[#908fa0]">No validation errors or warnings.</p> : <ul className="mt-3 space-y-2 text-sm">{validation.errors.map((item) => <li key={`e-${item}`} className="text-red-300">Error: {item}</li>)}{validation.warnings.map((item) => <li key={`w-${item}`} className="text-amber-300">Warning: {item}</li>)}</ul>}</section>
  </div>;
}
