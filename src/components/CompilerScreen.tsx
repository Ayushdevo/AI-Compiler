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
  Cpu,
  Zap,
  ChevronRight
} from 'lucide-react';
import { GOLD_TEMPLATES, TemplateData } from '../types';

interface CompilerScreenProps {
  promptInput: string;
  setPromptInput: (p: string) => void;
  selectedTemplate: TemplateData;
  setTemplate: (t: TemplateData) => void;
  onNavigate: (s: 'compiler' | 'schema' | 'metrics' | 'library') => void;
  isCompiling: boolean;
  onStartCompilation: () => void;
}

export default function CompilerScreen({
  promptInput,
  setPromptInput,
  selectedTemplate,
  setTemplate,
  onNavigate,
  isCompiling,
  onStartCompilation
}: CompilerScreenProps) {
  const [activeTab, setActiveTab] = useState<'ir' | 'schemas' | 'validation'>('ir');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.pipelineOutputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectTemplate = (key: string) => {
    const gold = GOLD_TEMPLATES[key];
    if (gold) {
      setTemplate(gold);
      setPromptInput(gold.prompt);
    }
  };

  // Safe syntax highlight formatter for raw JSON
  const formatJsonOutput = (jsonStr: string) => {
    try {
      return jsonStr.split('\n').map((line, idx) => {
        let highlighted = line
          // Strings (keys)
          .replace(/"([^"]+)":/g, '<span class="text-[#c0c1ff] font-semibold">"$1"</span>:')
          // Value Strings
          .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
          // Numbers & Booleans
          .replace(/: (true|false|\d+)/g, ': <span class="text-amber-400 font-bold">$1</span>');

        return (
          <div key={idx} className="flex hover:bg-[#122131]/20 font-mono py-0.5">
            <span className="w-10 shrink-0 select-none text-right text-[#465a73] pr-4 text-xs font-mono border-r border-[#152538]">
              {idx + 1}
            </span>
            <span className="pl-4 font-mono text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlighted }} />
          </div>
        );
      });
    } catch {
      return <pre className="font-mono text-xs text-[#d4e4fa]">{jsonStr}</pre>;
    }
  };

  return (
    <div className="space-y-8 flex-1 w-full max-w-7xl mx-auto">
      {/* Hero: Compiler Prompt Console */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#6265f0]/30 to-[#8083ff]/15 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-[#071424] rounded-2xl border border-[#1c2b3c] md:border-[#1e2d3d] overflow-hidden cyber-panel-glow">
          
          <div className="bg-[#030d19] px-5 py-3 border-b border-[#1c2b3c] flex justify-between items-center select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              <span className="font-label-caps text-[10px] text-[#908fa0] ml-2 tracking-wider">CASKET_COMPILE_SHELL_v4.2</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#6265f0] bg-[#6265f0]/10 border border-[#8083ff]/20 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-[#c0c1ff]" />
              OPTIMIZED
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col">
                <label className="block font-label-caps text-[10px] text-[#908fa0] mb-3 tracking-widest font-black">
                  INPUT REQUISITE SPECIFICATION (NATURAL LANGUAGE)
                </label>
                
                <div className="flex-1 min-h-[160px] bg-[#020b14]/80 rounded-xl border border-[#152538] flex overflow-hidden group-focus-within:border-[#8083ff]/40 transition-colors">
                  <div className="w-10 bg-[#030d19] border-r border-[#152538] flex flex-col items-center pt-4 text-[#465a73] font-mono select-none text-xs leading-6">
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
                  </div>
                  <textarea
                    className="flex-grow bg-transparent text-sm font-mono text-[#d4e4fa] p-4 resize-none focus:outline-none focus:ring-0 leading-relaxed placeholder-slate-700 h-40"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Describe app state, user layers, API methods & database structures... e.g., 'Build a CRM with contact leads database, role-based member dashboard, and premium plan gateways...'"
                    spellCheck="false"
                    disabled={isCompiling}
                  />
                </div>
              </div>
              
              <div className="md:w-60 flex flex-col justify-end shrink-0 select-none">
                <button
                  type="button"
                  onClick={onStartCompilation}
                  disabled={isCompiling}
                  className={`w-full h-40 rounded-xl font-bold flex flex-col items-center justify-center gap-3 transition-all cursor-pointer border ${
                    isCompiling 
                      ? 'bg-[#030d19] text-[#908fa0] border-[#1c2b3c] cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-tr from-[#6265f0] to-[#8083ff] text-white border-transparent hover:brightness-110 active:scale-97 shadow-lg shadow-[#8083ff]/20 focus:outline-none'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    {isCompiling && (
                      <span className="absolute w-12 h-12 bg-[#c0c1ff]/20 rounded-full animate-ping" />
                    )}
                    <Bolt className={`h-8 w-8 ${isCompiling ? 'animate-spin text-[#c0c1ff]' : 'text-white'}`} />
                  </div>
                  <span className="font-label-caps text-xs tracking-widest font-black leading-none">
                    {isCompiling ? 'COMPILING_STAGES' : 'INITIATE_COMPILE'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Templates */}
      <div className="select-none">
        <h3 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-widest font-bold">PRE-VERIFIED SPECIFICATION TEMPLATES</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            type="button"
            onClick={() => selectTemplate('crm')}
            className={`flex items-center gap-3.5 p-4.5 bg-[#071424] border rounded-xl hover:bg-[#0c1c2e]/80 hover:border-[#8083ff]/40 transition-all text-left cursor-pointer shadow ${
              selectedTemplate.id === 'crm' 
                ? 'border-[#8083ff] text-white shadow-[#8083ff]/15 relative overflow-hidden' 
                : 'border-[#1c2b3c] text-[#c7c4d7]'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${selectedTemplate.id === 'crm' ? 'bg-[#6265f0]/20 text-[#c0c1ff]' : 'bg-[#122131] text-[#908fa0]'}`}>
              <Users className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[11px] font-bold tracking-wider leading-none">CRM</span>
              <span className="text-[9px] text-[#908fa0] truncate mt-1">Contacts & Leads</span>
            </div>
            {selectedTemplate.id === 'crm' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#8083ff] rounded-bl" />
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => selectTemplate('lms')}
            className={`flex items-center gap-3.5 p-4.5 bg-[#071424] border rounded-xl hover:bg-[#0c1c2e]/80 hover:border-[#8083ff]/40 transition-all text-left cursor-pointer shadow ${
              selectedTemplate.id === 'lms' 
                ? 'border-[#8083ff] text-white shadow-[#8083ff]/15 relative overflow-hidden' 
                : 'border-[#1c2b3c] text-[#c7c4d7]'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${selectedTemplate.id === 'lms' ? 'bg-[#6265f0]/20 text-[#c0c1ff]' : 'bg-[#122131] text-[#908fa0]'}`}>
              <School className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[11px] font-bold tracking-wider leading-none">LMS</span>
              <span className="text-[9px] text-[#908fa0] truncate mt-1">Classroom Engine</span>
            </div>
            {selectedTemplate.id === 'lms' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#8083ff] rounded-bl" />
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => selectTemplate('e-commerce')}
            className={`flex items-center gap-3.5 p-4.5 bg-[#071424] border rounded-xl hover:bg-[#0c1c2e]/80 hover:border-[#8083ff]/40 transition-all text-left cursor-pointer shadow ${
              selectedTemplate.id === 'e-commerce' 
                ? 'border-[#8083ff] text-white shadow-[#8083ff]/15 relative overflow-hidden' 
                : 'border-[#1c2b3c] text-[#c7c4d7]'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${selectedTemplate.id === 'e-commerce' ? 'bg-[#6265f0]/20 text-[#c0c1ff]' : 'bg-[#122131] text-[#908fa0]'}`}>
              <ShoppingCart className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[11px] font-bold tracking-wider leading-none">Checkout</span>
              <span className="text-[9px] text-[#908fa0] truncate mt-1">E-Commerce Flow</span>
            </div>
            {selectedTemplate.id === 'e-commerce' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#8083ff] rounded-bl" />
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => selectTemplate('fintech')}
            className={`flex items-center gap-3.5 p-4.5 bg-[#071424] border rounded-xl hover:bg-[#0c1c2e]/80 hover:border-[#8083ff]/40 transition-all text-left cursor-pointer shadow ${
              selectedTemplate.id === 'fintech' 
                ? 'border-[#8083ff] text-white shadow-[#8083ff]/15 relative overflow-hidden' 
                : 'border-[#1c2b3c] text-[#c7c4d7]'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${selectedTemplate.id === 'fintech' ? 'bg-[#6265f0]/20 text-[#c0c1ff]' : 'bg-[#122131] text-[#908fa0]'}`}>
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[11px] font-bold tracking-wider leading-none">Fintech</span>
              <span className="text-[9px] text-[#908fa0] truncate mt-1">Wallets & ledgers</span>
            </div>
            {selectedTemplate.id === 'fintech' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#8083ff] rounded-bl" />
            )}
          </button>
        </div>
      </div>

      {/* Workspace Tabs & Panels */}
      <div className="flex flex-col gap-5">
        <div className="flex border-b border-[#1c2b3c] overflow-x-auto no-scrollbar select-none">
          <button 
            type="button"
            onClick={() => setActiveTab('ir')}
            className={`px-5 py-3.5 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ir' 
                ? 'border-[#8083ff] text-white bg-[#8083ff]/5' 
                : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            INTERMEDIATE REPRESENTATION (JSON)
          </button>
          
          <button 
            type="button"
            onClick={() => onNavigate('schema')}
            className="px-5 py-3.5 border-b-2 border-transparent text-[#908fa0] hover:text-[#8083ff] hover:border-[#8083ff]/30 transition-all font-label-caps text-[11px] font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            SCHEMA WORKBENCH EXPLORER
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('validation')}
            className={`px-5 py-3.5 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'validation' 
                ? 'border-[#8083ff] text-white bg-[#8083ff]/5' 
                : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            PIPELINE VALIDATION REPORT
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Workspace Frame */}
          <div className="xl:col-span-2">
            {activeTab === 'ir' && (
              <div className="bg-[#030d19]/90 backdrop-blur-md rounded-2xl border border-[#1c2b3c] overflow-hidden shadow-2xl">
                <div className="bg-[#071424] px-5 py-2.5 flex justify-between items-center border-b border-[#1c2b3c] select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#c0c1ff]">pipeline_output.json</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">SYNTACTICALLY_CORRECT</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="text-[#908fa0] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#122131] border border-[#1c2b3c] hover:border-[#8083ff]/30 text-xs font-bold font-sans"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy IR'}</span>
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[420px] custom-scrollbar bg-[#020b14] select-text">
                  <div className="font-mono text-xs md:text-[12.5px] leading-relaxed">
                    {formatJsonOutput(selectedTemplate.pipelineOutputJson)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'validation' && (
              <div className="bg-[#071424] rounded-2xl p-6 border border-[#1e2d3d] space-y-5 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#1c2b3c] pb-3 select-none">
                  <h4 className="font-label-caps text-xs text-[#c0c1ff] font-extrabold tracking-wider">COMPILER HEURISTIC VALIDATION REPAIRS</h4>
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                
                <div className="bg-[#030d19] p-4.5 border-l-2 border-amber-400/80 rounded-r-xl shadow-md">
                  <p className="font-mono text-xs text-amber-300 font-extrabold mb-1.5 tracking-wider uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                    AUTON-REPAIR CONSISTENCY RESOLUTION PASS
                  </p>
                  <p className="text-xs text-[#c7c4d7] leading-relaxed font-sans mt-2">
                    {selectedTemplate.repairLog || 'No Repairs Required. System matches schema rules fully.'}
                  </p>
                </div>
                
                <div className="space-y-3.5 pt-2 select-none">
                  <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-[#030d19] border border-[#1c2b3c] shadow-sm hover:border-[#8083ff]/20 transition-colors">
                    <span className="text-xs text-[#c7c4d7] font-medium">Heuristics Hash ID</span>
                    <span className="text-xs text-[#c0c1ff] font-mono font-bold">SHA256_0x98FF24</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-[#030d19] border border-[#1c2b3c] shadow-sm hover:border-[#8083ff]/20 transition-colors">
                    <span className="text-xs text-[#c7c4d7] font-medium">Model Endpoint Instance</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">gemini-2.5-flash-comp</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Metrics & Image Panel */}
          <div className="space-y-5 select-none">
            <div className="bg-[#071424] rounded-2xl p-5 border border-[#1e2d3d] shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-[#1c2b3c] pb-3">
                <h4 className="font-label-caps text-[10px] text-white tracking-wider font-extrabold">INTEGRITY CHECKLIST</h4>
                <ShieldCheck className="h-[18px] w-[18px] text-emerald-400" />
              </div>
              
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">
                  <span className="text-[#c7c4d7]">JSON Schema</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-code-sm font-black">VALID</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">
                  <span className="text-[#c7c4d7]">API ↔ DB Consistency</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-code-sm font-black">SYNCED</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">
                  <span className="text-[#c7c4d7]">UI ↔ API Consistency</span>
                  <span className={`px-2.5 py-0.5 rounded font-code-sm font-black ${
                    selectedTemplate.id === 'lms' || selectedTemplate.id === 'fintech' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedTemplate.id === 'lms' || selectedTemplate.id === 'fintech' ? 'SYNCED' : 'REPAIRED (0x2a)'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[#030d19] border border-[#1a2d3e]">
                  <span className="text-[#c7c4d7]">Typescript Security</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-code-sm font-black">SECURE</span>
                </div>
              </div>
            </div>

            <div className="bg-[#071424] rounded-2xl p-5 border border-[#1e2d3d] shadow-xl">
              <h4 className="font-label-caps text-[10px] text-[#908fa0] mb-4 tracking-wider font-bold">TUNED PERFORMANCE METRICS</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#030d19] p-3 rounded-xl border border-[#1c2b3c]">
                  <p className="font-display-md text-2xl text-[#c0c1ff] font-extrabold tracking-tight">{selectedTemplate.inferenceTime}</p>
                  <p className="font-label-caps text-[9px] text-[#908fa0] tracking-wider mt-1">Latency P95</p>
                </div>
                <div className="bg-[#030d19] p-3 rounded-xl border border-[#1c2b3c]">
                  <p className="font-display-md text-2xl text-[#d4e4fa] font-extrabold tracking-tight">{selectedTemplate.tokensUsed}</p>
                  <p className="font-label-caps text-[9px] text-[#908fa0] tracking-wider mt-1">Token Vol</p>
                </div>
              </div>
            </div>

            {/* Premium Abstract Interactive Card */}
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-[#1c2b3c] md:border-[#1e2d3d] group/sec shadow-xl">
              <div className="absolute inset-0 bg-[#6265f0]/10 mix-blend-color z-10" />
              <img 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover mix-blend-luminosity brightness-75 group-hover/sec:scale-105 transition-transform duration-700" 
                alt="Visualization representing futuristic code flow and system graph." 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq5qEiBoECKItNP0ltjYrlkGD_W8P8YvkODnp2tcTs5exh7u4r1dOWnhuZvk918N6UoW8WxpbJVgksVbv6qxaDrPyAAQdpCHjQpGqUfdgQifEPx0_I2YZMWuwrk7RtS-czg8jnaNuk_Qha3VYPLbhCovYZabKIFAuklyC-QBfHfnOy82SF_wgqfrE8EfklbLj7WVQuGH0CbLmy3HoZam3vy62unkajqG0HuKaWc29eLNj69T9slfKZQAXBXHDPxDDJZd0h0KNKaYA"
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-[#020b14] via-[#020b14]/50 to-transparent z-20">
                <p className="font-label-caps text-[10px] text-white tracking-widest font-black flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PIPELINE ACCELERATION
                </p>
                <p className="text-[11px] text-[#c7c4d7] leading-relaxed">AST nodes cached & optimized using custom neural paths for {selectedTemplate.name || 'Enterprise Schema'}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
