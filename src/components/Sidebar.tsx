import React from 'react';
import { 
  Check, 
  Loader2, 
  Play, 
  Plus,
  Activity,
  Sparkles,
  Command,
  Zap,
  Target
} from 'lucide-react';
import { Screen, TemplateData } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  isCompiling: boolean;
  compileStep: number;
  template: TemplateData;
  onNavigate: (screen: Screen) => void;
}

export default function Sidebar({ currentScreen, isCompiling, compileStep, template, onNavigate }: SidebarProps) {
  if (currentScreen === 'compiler') {
    return (
      <aside className="hidden lg:flex w-[282px] flex-col border-r border-[#152538] bg-[#030d19]/90 backdrop-blur-md sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-6 shrink-0 select-none custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        <div>
          <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-6 tracking-widest font-bold">PIPELINE STATUS</h3>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4 relative">
              <div className={`z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompiling && compileStep === 1 
                  ? 'bg-[#6265f0]/20 border-[#c0c1ff] shadow-[0_0_8px_rgba(128,131,255,0.4)] animate-pulse'
                  : compileStep >= 1 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                    : 'bg-[#122131] border-[#1e2d3d]'
              }`}>
                {compileStep >= 1 && !isCompiling ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : isCompiling && compileStep === 1 ? (
                  <Loader2 className="h-3 w-3 text-[#c0c1ff] animate-spin" />
                ) : (
                  <span className="text-[10px] text-[#908fa0] font-mono">1</span>
                )}
              </div>
              <div className={`absolute left-3 top-6 w-[1px] h-6 transition-colors ${compileStep > 1 ? 'bg-emerald-500/40' : 'bg-[#152538]'}`} />
              <div>
                <p className={`font-label-caps text-[11px] font-bold ${compileStep >= 1 ? 'text-[#d4e4fa]' : 'text-[#908fa0]'}`}>
                  Lexical Analysis
                </p>
                <p className="text-[10px] text-[#908fa0] font-mono">
                  {compileStep >= 1 && !isCompiling ? 'Complete • 14ms' : isCompiling && compileStep === 1 ? 'Analyzing token stream...' : 'Waiting'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 relative">
              <div className={`z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompiling && compileStep === 2
                  ? 'bg-[#6265f0]/20 border-[#c0c1ff] shadow-[0_0_8px_rgba(128,131,255,0.4)] animate-pulse'
                  : compileStep >= 2
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                    : 'bg-[#122131] border-[#1e2d3d]'
              }`}>
                {compileStep >= 2 && !isCompiling ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : isCompiling && compileStep === 2 ? (
                  <Loader2 className="h-3 w-3 text-[#c0c1ff] animate-spin" />
                ) : (
                  <span className="text-[10px] text-[#908fa0] font-mono">2</span>
                )}
              </div>
              <div className={`absolute left-3 top-6 w-[1px] h-6 transition-colors ${compileStep > 2 ? 'bg-emerald-500/40' : 'bg-[#152538]'}`} />
              <div>
                <p className={`font-label-caps text-[11px] font-bold ${compileStep >= 2 ? 'text-[#c0c1ff]' : 'text-[#908fa0]'}`}>
                  Schema Generation
                </p>
                <p className="text-[10px] text-[#908fa0] font-mono">
                  {compileStep >= 2 && !isCompiling ? 'Ready' : isCompiling && compileStep === 2 ? 'Generating Schemas...' : 'Waiting'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 relative">
              <div className={`z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompiling && compileStep === 3
                  ? 'bg-[#6265f0]/20 border-[#c0c1ff] shadow-[0_0_8px_rgba(128,131,255,0.4)] animate-pulse'
                  : compileStep >= 3
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                    : 'bg-[#122131] border-[#1e2d3d]'
              }`}>
                {compileStep >= 3 && !isCompiling ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : isCompiling && compileStep === 3 ? (
                  <Loader2 className="h-3 w-3 text-[#c0c1ff] animate-spin" />
                ) : (
                  <span className="text-[10px] text-[#908fa0] font-mono">3</span>
                )}
              </div>
              <div className={`absolute left-3 top-6 w-[1px] h-6 transition-colors ${compileStep > 3 ? 'bg-emerald-500/40' : 'bg-[#152538]'}`} />
              <div>
                <p className={`font-label-caps text-[11px] font-bold ${compileStep >= 3 ? 'text-[#d4e4fa]' : 'text-[#908fa0]'}`}>
                  Validation Layer
                </p>
                <p className="text-[10px] text-[#908fa0] font-mono">
                  {compileStep >= 3 && !isCompiling ? 'Complete' : isCompiling && compileStep === 3 ? 'Validating integrity...' : 'Waiting'}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className={`z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompiling && compileStep === 4
                  ? 'bg-[#6265f0]/20 border-[#c0c1ff] shadow-[0_0_8px_rgba(128,131,255,0.4)] animate-pulse'
                  : compileStep >= 4
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                    : 'bg-[#122131] border-[#1e2d3d]'
              }`}>
                {compileStep >= 4 && !isCompiling ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : isCompiling && compileStep === 4 ? (
                  <Loader2 className="h-3 w-3 text-[#c0c1ff] animate-spin" />
                ) : (
                  <span className="text-[10px] text-[#908fa0] font-mono">4</span>
                )}
              </div>
              <div>
                <p className={`font-label-caps text-[11px] font-bold ${compileStep >= 4 ? 'text-[#d4e4fa]' : 'text-[#908fa0]'}`}>
                  Code Emission
                </p>
                <p className="text-[10px] text-[#908fa0] font-mono">
                  {compileStep >= 4 && !isCompiling ? 'Finished' : isCompiling && compileStep === 4 ? 'Emitting codebases...' : 'Waiting'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-[#1a2d3e] pt-6">
          <div className="bg-[#0b1827] rounded-xl p-4 border border-[#1e2d3d] shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <Sparkles className="h-10 w-10 text-[#c0c1ff]" />
            </div>
            <div className="flex items-center gap-2 mb-2 text-[#c0c1ff] font-bold">
              <Sparkles className="h-4 w-4 animate-spin-slow text-[#c0c1ff]" />
              <span className="font-label-caps text-[10px] tracking-wider font-extrabold">AUTO-REPAIR ON</span>
            </div>
            <p className="text-xs text-[#c7c4d7] leading-relaxed">
              2 logical inconsistencies resolved in {template?.name || 'CRM Schema'} metadata automatically.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  if (currentScreen === 'schema') {
    return (
      <aside className="hidden md:flex flex-col w-[282px] border-r border-[#152538] bg-[#030d19]/90 backdrop-blur-md shrink-0 p-6 overscroll-y-auto custom-scrollbar sticky top-16 h-[calc(100vh-64px)] shadow-[4px_0_24px_rgba(0,0,0,0.3)] select-none">
        <div className="space-y-8 flex-grow">
          <div>
            <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">COMPILER PIPELINE</h3>
            <div className="space-y-4 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#152538]" />
              
              <div className="flex items-center gap-3 relative cursor-pointer group" onClick={() => onNavigate('compiler')}>
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 group-hover:border-emerald-400 flex items-center justify-center z-10 transition-colors">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="font-label-caps text-[11px] text-[#c7c4d7] group-hover:text-white transition-colors">Analysis</span>
              </div>
              
              <div className="flex items-center gap-3 relative cursor-pointer group" onClick={() => onNavigate('compiler')}>
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 group-hover:border-emerald-400 flex items-center justify-center z-10 transition-colors">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="font-label-caps text-[11px] text-[#c7c4d7] group-hover:text-white transition-colors">Inference</span>
              </div>
              
              <div className="flex items-center gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-[#6265f0] border border-[#8083ff] flex items-center justify-center z-10 shadow-[0_0_10px_rgba(98,101,240,0.5)]">
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                </div>
                <span className="font-label-caps text-[11px] text-white font-bold cyber-text-glow">Output Explorer</span>
              </div>
            </div>
          </div>

          <div className="bg-[#071424] p-4.5 border border-[#1e2d3d] rounded-xl shadow-lg shadow-black/20">
            <h4 className="font-label-caps text-[10px] text-[#c0c1ff] mb-3 font-bold tracking-wider">EXECUTION READY</h4>
            <p className="text-[11px] text-[#908fa0] leading-relaxed mb-4">Emitted schemas are bound and ready to mount on the sandboxed isolated hyper-engine.</p>
            <button className="w-full bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white hover:brightness-110 active:scale-95 transition-all text-xs font-label-caps font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#8083ff]/15">
              <Play className="h-3.5 w-3.5 fill-current" />
              EXPORT RUNTIME
            </button>
          </div>

          <div>
            <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">METRICS</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-[#071424] p-4 rounded-xl border border-[#1a2d3e] hover:border-[#1e324c] transition-colors shadow">
                <div className="font-display-md text-xl text-[#c0c1ff] font-extrabold tracking-tight">{template?.inferenceTime || '1.2s'}</div>
                <div className="font-label-caps text-[9px] text-[#908fa0] tracking-wider mt-1">INFERENCE LATENCY</div>
              </div>
              <div className="bg-[#071424] p-4 rounded-xl border border-[#1a2d3e] hover:border-[#1e324c] transition-colors shadow">
                <div className="font-display-md text-xl text-[#d4e4fa] font-extrabold tracking-tight">{template?.tokensUsed || '842'}</div>
                <div className="font-label-caps text-[9px] text-[#908fa0] tracking-wider mt-1">TOKENS EMITTED</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (currentScreen === 'metrics') {
    return (
      <aside className="hidden md:flex flex-col w-[282px] border-r border-[#152538] bg-[#030d19]/90 backdrop-blur-md shrink-0 p-6 overscroll-y-auto custom-scrollbar sticky top-16 h-[calc(100vh-64px)] shadow-[4px_0_24px_rgba(0,0,0,0.3)] select-none">
        <div className="mb-8">
          <h2 className="font-label-caps text-[10px] text-[#908fa0] mb-5 tracking-widest font-bold">TELEMETRY SOURCES</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-[#071424] p-3 rounded-xl border border-[#1a2d3e] shadow">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff] shadow-[0_0_8px_rgba(192,193,255,0.6)] animate-pulse" />
              <span className="font-mono text-xs text-[#c0c1ff]">System Health</span>
              <span className="ml-auto font-mono text-xs text-[#d4e4fa] font-black">98.2%</span>
            </div>
            <div className="flex items-center gap-3 bg-[#071424] p-3 rounded-xl border border-[#1a2d3e] shadow">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff] animate-pulse" />
              <span className="font-mono text-xs text-[#c7c4d7]">Queue Latency</span>
              <span className="ml-auto font-mono text-xs text-[#d4e4fa] font-bold">14ms</span>
            </div>
            <div className="flex items-center gap-3 bg-[#071424] p-3 rounded-xl border border-[#1a2d3e] shadow">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-[#c7c4d7]">Shard_Live_L4</span>
              <span className="ml-auto font-mono text-xs text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-[#1a2d3e] pt-6">
          <h2 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">PERFORMANCE RATIO</h2>
          <div className="bg-[#071424] p-4 rounded-xl border border-[#1e2d3d] shadow">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#d4e4fa] font-medium">Model Efficiency</span>
              <span className="text-xs text-[#c0c1ff] font-bold">72%</span>
            </div>
            <div className="h-1.5 w-full bg-[#122131] overflow-hidden rounded-full p-[1px]">
              <div className="h-full bg-gradient-to-r from-[#6265f0] to-[#8083ff] rounded-full shadow-[0_0_8px_rgba(128,131,255,0.5)]" style={{ width: '72%' }} />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (currentScreen === 'library') {
    return (
      <aside className="hidden lg:flex flex-col w-[282px] border-r border-[#152538] bg-[#030d19]/90 backdrop-blur-md shrink-0 p-6 overscroll-y-auto custom-scrollbar sticky top-16 h-[calc(100vh-64px)] shadow-[4px_0_24px_rgba(0,0,0,0.3)] select-none">
        <div className="space-y-8 flex-grow">
          <div>
            <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">DATASET WORKBENCH</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#071424] p-3.5 rounded-xl border border-[#1a2d3e] shadow relative">
                <div className="pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                </div>
                <div>
                  <p className="font-code-sm text-xs text-[#d4e4fa] font-bold">Verified Presets</p>
                  <p className="text-[10px] text-[#908fa0] font-label-caps uppercase mt-0.5">12 COMPLETE</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#071424] p-3.5 rounded-xl border border-[#1a2d3e] shadow relative">
                <div className="pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c0c1ff] animate-pulse shadow-[0_0_8px_rgba(192,193,255,0.5)]" />
                </div>
                <div>
                  <p className="font-code-sm text-xs text-[#d4e4fa] font-bold">Stress Tuning</p>
                  <p className="text-[10px] text-[#908fa0] font-label-caps uppercase mt-0.5">ACTIVE BIAS CHECK</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#071424] p-3.5 rounded-xl border border-[#1a2d3e] shadow relative opacity-50">
                <div className="pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#253344]" />
                </div>
                <div>
                  <p className="font-code-sm text-xs text-[#d4e4fa] font-bold">User Repositories</p>
                  <p className="text-[10px] text-[#908fa0] font-label-caps uppercase mt-0.5">GATED</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#1a2d3e]">
            <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">SUITE CONTROLS</h3>
            
            <button className="w-full text-left px-4 py-3 rounded-xl bg-[#071424] border border-[#1e2d3d] flex items-center justify-between group hover:border-[#8083ff]/40 transition-colors cursor-pointer shadow">
              <span className="font-mono text-xs text-[#d4e4fa] font-bold transition-colors group-hover:text-white">Scaffold Factory</span>
              <Plus className="h-4 w-4 text-[#908fa0] group-hover:text-[#c0c1ff] transition-colors" />
            </button>
            
            <button className="w-full text-left px-4 py-3 rounded-xl bg-[#071424] border border-[#1e2d3d] flex items-center justify-between group hover:border-[#8083ff]/40 transition-colors cursor-pointer shadow">
              <span className="font-mono text-xs text-[#d4e4fa] font-bold transition-colors group-hover:text-white">Batch Bench Test</span>
              <Play className="h-3.5 w-3.5 text-[#908fa0] group-hover:text-[#c0c1ff] transition-colors fill-current" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
