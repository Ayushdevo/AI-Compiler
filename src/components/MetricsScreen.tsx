import React, { useState } from 'react';
import { 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle, 
  Timer, 
  Filter, 
  ExternalLink,
  Zap,
  Activity,
  Heart,
  Settings
} from 'lucide-react';
import { RECENT_COMPILATIONS, CompilationJob } from '../types';

export default function MetricsScreen() {
  const [autoRepairActive, setAutoRepairActive] = useState(true);
  const [compilations] = useState<CompilationJob[]>(RECENT_COMPILATIONS);

  return (
    <div className="flex-grow p-6 lg:p-8 space-y-8 max-w-full overflow-x-hidden select-none">
      {/* Title & Description Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c2b3c] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#8083ff] font-bold text-xs font-mono uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            TELEMETRY NODE ACTIVE
          </div>
          <h2 className="font-display-lg text-3xl font-extrabold text-[#d4e4fa] tracking-tight">
            System Performance Dashboard
          </h2>
          <p className="text-body-md text-xs text-[#908fa0] max-w-2xl mt-1 leading-relaxed">
            Aggregate real-time metrics for autonomous compiler agents. Monitoring AST validation accuracy, retries per pipeline, and validation repairs.
          </p>
        </div>
        
        <div className="flex gap-2 items-center text-xs font-mono bg-[#071424] px-4 py-2 rounded-xl border border-[#1e2d3d] h-fit shadow">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#c7c4d7]">PROD_SHARD_01: ONLINE</span>
        </div>
      </header>

      {/* Validation Metrics Grid cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#071424] p-5.5 border border-[#1c2b3c] rounded-2xl hover:border-[#8083ff]/40 transition-all duration-300 shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8083ff]/3 opacity-0 group-hover:opacity-100 rounded-full blur transition-opacity" />
          <div className="flex items-center justify-between mb-4.5">
            <span className="font-label-caps text-[10px] text-[#908fa0] tracking-wider font-bold">SUCCESS ACCURACY</span>
            <div className="p-2 rounded-lg bg-[#6265f0]/10 text-[#c0c1ff] border border-[#8083ff]/15">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-2xl font-black text-white">94.8%</span>
            <span className="font-mono text-xs text-emerald-400 font-bold">+2.1%</span>
          </div>
          <div className="mt-4 h-[1px] bg-[#1a2d3e]" />
          <div className="mt-2.5 font-label-caps text-[9px] text-[#908fa0] tracking-wider font-semibold">Aggressed Across Domains</div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#071424] p-5.5 border border-[#1c2b3c] rounded-2xl hover:border-[#8083ff]/40 transition-all duration-300 shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8083ff]/3 opacity-0 group-hover:opacity-100 rounded-full blur transition-opacity" />
          <div className="flex items-center justify-between mb-4.5">
            <span className="font-label-caps text-[10px] text-[#908fa0] tracking-wider font-bold">RETRIES PER SPEC</span>
            <div className="p-2 rounded-lg bg-[#6265f0]/10 text-[#c0c1ff] border border-[#8083ff]/15">
              <RefreshCw className="h-4.5 w-4.5 group-hover:rotate-180 transition-transform duration-700" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-2xl font-black text-white">1.8</span>
            <span className="font-mono text-[10px] text-[#908fa0] border border-[#1e2d3d] px-1.5 py-0.5 rounded uppercase font-bold">MAX 5</span>
          </div>
          <div className="mt-4 h-[1px] bg-[#1a2d3e]" />
          <div className="mt-2.5 font-label-caps text-[9px] text-[#908fa0] tracking-wider font-semibold">Heuristical Target Limit: &lt; 2.0</div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#071424] p-5.5 border border-[#1c2b3c] rounded-2xl hover:border-red-400/40 transition-all duration-300 shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/3 opacity-0 group-hover:opacity-100 rounded-full blur transition-opacity" />
          <div className="flex items-center justify-between mb-4.5">
            <span className="font-label-caps text-[10px] text-[#908fa0] tracking-wider font-bold">LOGIC PARSE BLOCKS</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/15">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-2xl font-black text-white">18</span>
            <span className="font-mono text-xs text-red-400 font-bold">RESOLVED</span>
          </div>
          <div className="mt-4 h-[1px] bg-[#1a2d3e]" />
          <div className="mt-2.5 font-label-caps text-[9px] text-[#908fa0] tracking-wider font-semibold">AutoRepair Auto-Injected</div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#071424] p-5.5 border border-[#1c2b3c] rounded-2xl hover:border-[#8083ff]/40 transition-all duration-300 shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8083ff]/3 opacity-0 group-hover:opacity-100 rounded-full blur transition-opacity" />
          <div className="flex items-center justify-between mb-4.5">
            <span className="font-label-caps text-[10px] text-[#908fa0] tracking-wider font-bold">P95 LATENCY</span>
            <div className="p-2 rounded-lg bg-[#6265f0]/10 text-[#c0c1ff] border border-[#8083ff]/15">
              <Timer className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-2xl font-black text-white">4.2s</span>
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest text-[9px]">NOMINAL</span>
          </div>
          <div className="mt-4 h-[1px] bg-[#1a2d3e]" />
          <div className="mt-2.5 font-label-caps text-[9px] text-[#908fa0] tracking-wider font-semibold">Under model constraint limits</div>
        </div>
      </section>

      {/* Main Charts & Breakdown row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Success Rates by domain design */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[#071424] p-6 border border-[#1e2d3d] rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-slate-800/5 rounded-full blur" />
          <div className="flex justify-between items-center mb-10 select-none">
            <div>
              <h3 className="font-display-md text-lg font-extrabold text-[#d4e4fa]">Domain Success rates Comparison</h3>
              <p className="text-xs text-[#908fa0] mt-1">Consistency metrics across core compiler dataset structures.</p>
            </div>
            <div className="flex gap-2 bg-[#030d19] border border-[#1e2d3d] p-1 rounded-xl">
              <button type="button" className="px-3 py-1.5 bg-[#122131] border border-[#1e2d3d] font-label-caps text-[9px] text-[#d4e4fa] rounded-lg font-black tracking-wider cursor-pointer shadow-sm">7D</button>
              <button type="button" className="px-3 py-1.5 text-[#908fa0] hover:text-white font-label-caps text-[9px] rounded-lg tracking-wider font-bold cursor-pointer">30D</button>
            </div>
          </div>

          <div className="flex items-end gap-10 h-[240px] px-4 select-none pt-6 bg-[#020911] border border-[#152538] rounded-2xl p-4 shadow-inner relative">
            {/* Background grid indicators */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
              <div className="border-b border-[#1c2b3c] w-full h-px" />
              <div className="border-b border-[#1c2b3c] w-full h-px" />
              <div className="border-b border-[#1c2b3c] w-full h-px" />
              <div className="w-full h-px" />
            </div>

            {/* Bar 1 */}
            <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end relative z-10">
              <div className="w-full bg-[#1b253c] rounded-t-lg h-[95%] relative group/bar hover:bg-[#6265f0]/20 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 border-t-2 border-[#6265f0] shadow-[0_0_10px_rgba(98,101,240,0.5)]" />
                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-mono text-[11px] text-[#c0c1ff] font-bold">95%</span>
              </div>
              <span className="font-mono text-[10px] text-[#908fa0] uppercase tracking-wider text-center font-bold">CRM</span>
            </div>

            {/* Bar 2 */}
            <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end relative z-10">
              <div className="w-full bg-[#1b253c] rounded-t-lg h-[85%] relative group/bar hover:bg-[#6265f0]/20 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 border-t-2 border-[#6265f0] shadow-[0_0_10px_rgba(98,101,240,0.5)]" />
                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-mono text-[11px] text-[#c0c1ff] font-bold">85%</span>
              </div>
              <span className="font-mono text-[10px] text-[#908fa0] uppercase tracking-wider text-center font-bold">LMS</span>
            </div>

            {/* Bar 3 */}
            <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end relative z-10">
              <div className="w-full bg-[#1b253c] rounded-t-lg h-[92%] relative group/bar hover:bg-[#6265f0]/20 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 border-t-2 border-[#6265f0] shadow-[0_0_10px_rgba(98,101,240,0.5)]" />
                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-mono text-[11px] text-[#c0c1ff] font-bold">92%</span>
              </div>
              <span className="font-mono text-[10px] text-[#908fa0] uppercase tracking-wider text-center font-bold">DE_SHOP</span>
            </div>

            {/* Bar 4 */}
            <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end relative z-10">
              <div className="w-full bg-red-500/10 rounded-t-lg h-[62%] relative group/bar hover:bg-red-400/20 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 border-t-2 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-mono text-[11px] text-red-400 font-bold">62%</span>
              </div>
              <span className="font-mono text-[10px] text-red-400/80 uppercase tracking-wider text-center font-bold">COMPLEX</span>
            </div>
          </div>
        </div>

        {/* Failures types breakdown card info */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4">
          <div className="bg-[#071424] p-6 border border-[#1e2d3d] rounded-2xl shadow-2xl flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-display-md text-lg font-extrabold text-[#d4e4fa] mb-5">Grammar Failure Breakdown</h3>
              <div className="space-y-5">
                {/* Failure Option 1 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 select-none">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#d4e4fa] font-bold">Structural Syntax schema</span>
                      <span className="text-[8px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">SCHEMA</span>
                    </div>
                    <span className="font-mono text-xs text-red-400 font-black">42%</span>
                  </div>
                  <div className="h-2 w-full bg-[#030d19] border border-[#1a2d3e] rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                {/* Failure Option 2 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 select-none">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#d4e4fa] font-bold">Nested Type Inferencing</span>
                      <span className="text-[8px] bg-[#6265f0]/10 text-[#c0c1ff] border border-[#8083ff]/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">VALIDATION</span>
                    </div>
                    <span className="font-mono text-xs text-[#c0c1ff] font-black">28%</span>
                  </div>
                  <div className="h-2 w-full bg-[#030d19] border border-[#1a2d3e] rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-gradient-to-r from-[#6265f0] to-[#8083ff] rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                {/* Failure Option 3 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 select-none">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#d4e4fa] font-bold">Logical Flow / Permission Rules</span>
                      <span className="text-[8px] bg-[#bec6e0]/10 text-[#bec6e0] border border-[#bec6e0]/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">COHERENCE</span>
                    </div>
                    <span className="font-mono text-xs text-slate-400 font-black">30%</span>
                  </div>
                  <div className="h-2 w-full bg-[#030d19] border border-[#1a2d3e] rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-gradient-to-r from-slate-600 to-slate-400 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#908fa0] leading-relaxed italic mt-5 block border-t border-[#1a2d3e]/50 pt-3 select-none">
              Most grammatical parse warnings are solved autonomously on first retry.
            </p>
          </div>

          {/* Auto pair mode card */}
          <div className="bg-[#0b1827] p-4.5 border border-[#1e2d3d] rounded-2xl flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6265f0]/10 text-[#c0c1ff] rounded-xl border border-[#8083ff]/15">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-[10px] text-white tracking-wider font-extrabold">Autonomous Auto-Repair</span>
                <span className="text-[10px] text-[#908fa0]">Re-fires the compilation pipeline on fault.</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setAutoRepairActive(!autoRepairActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0 ${autoRepairActive ? 'bg-[#6265f0]' : 'bg-[#152538]'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoRepairActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Compilations Log Table */}
      <section className="bg-[#071424] border border-[#1e2d3d] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#1c2b3c] flex justify-between items-center bg-[#030d19]/80 select-none">
          <div className="flex flex-col">
            <h3 className="font-display-md text-base font-extrabold text-[#d4e4fa]">Historic Telemetry Ledger</h3>
            <p className="text-[11px] text-[#908fa0]">A persistent record of compiler job execution states.</p>
          </div>
          <div className="flex gap-4 items-center select-none font-mono">
            <span className="font-code-sm text-[11px] text-[#908fa0] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REALTIMEFEED
            </span>
            <button className="text-[#908fa0] hover:text-white p-1.5 bg-[#122131] border border-[#1e2d3d] rounded-lg transition-colors cursor-pointer">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="bg-[#030d19] text-[#908fa0] uppercase tracking-wider border-b border-[#1c2b3c] font-sans">
              <tr className="text-[9px] font-black">
                <th className="p-4 font-bold tracking-widest pl-6">Job Status</th>
                <th className="p-4 font-bold tracking-widest">Pipeline Job ID</th>
                <th className="p-4 font-bold tracking-widest">Raw prompt segment</th>
                <th className="p-4 font-bold tracking-widest text-center">Retries count</th>
                <th className="p-4 font-bold tracking-widest">Latency P95</th>
                <th className="p-4 font-bold tracking-widest text-right pr-6 hide-on-mobile">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152538]/50">
              {compilations.map((job, idx) => (
                <tr key={idx} className="hover:bg-[#122131]/20 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        job.status === 'COMPLETED' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                        job.status === 'REPAIRED' ? 'bg-amber-400' :
                        job.status === 'REPAIRING' ? 'bg-amber-400 animate-pulse' :
                        'bg-red-500'
                      }`} />
                      <span className={`font-bold font-mono text-[11px] ${
                        job.status === 'COMPLETED' ? 'text-emerald-400' :
                        job.status === 'REPAIRED' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>{job.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#8083ff] font-mono leading-none">{job.jobId}</td>
                  <td className="p-4 text-[#d4e4fa] max-w-[280px] truncate italic font-sans">{job.promptSegment}</td>
                  <td className="p-4 text-[#c7c4d7] font-mono text-center font-bold">{job.retries}</td>
                  <td className="p-4 text-slate-300 font-mono font-semibold">{job.runtime}</td>
                  <td className="p-4 text-right pr-6 hide-on-mobile">
                    {job.status === 'FAILED' ? (
                      <button className="text-red-400 border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-[9px] rounded-lg tracking-wider font-sans font-bold hover:bg-red-500/15 duration-200 active:scale-95 cursor-pointer">
                        DEBUG LOGS
                      </button>
                    ) : (
                      <span className="text-[#c0c1ff] group-hover:underline flex items-center justify-end gap-1 font-bold text-xs tracking-wide">
                        VIEW OUTPUT
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
