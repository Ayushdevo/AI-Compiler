import React, { useState } from 'react';
import { 
  Terminal, 
  Layers, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  AlertTriangle,
  Play,
  Grid,
  List,
  CheckCircle,
  Copy,
  Check,
  X,
  Workflow,
  Sparkles,
  ShieldCheck,
  Activity,
  Maximize2
} from 'lucide-react';

const STANDARD_TEMPLATES = [
  {
    id: "crm",
    name: "Enterprise CRM",
    complexity: "L2 - Baseline",
    code: "generate enterprise_crm {\n  entities: [Account, Lead, Agent],\n  auth: JWT, \n  db: Postgres\n}",
    scenariosCount: "5 modules",
    desc: "Relational customer lead pipeline with automated geographic distribution guards."
  },
  {
    id: "pos",
    name: "Retail POS Cashier",
    complexity: "L3 - Transactional",
    code: "workflow checkout_flow {\n  inventory: transactional,\n  tax: localized,\n  receipt: dynamic\n}",
    scenariosCount: "6 endpoints",
    desc: "Cashier sales desk routing with integrated tax calculations and Stripe card mocks."
  },
  {
    id: "lms",
    name: "Adaptive LMS",
    complexity: "L4 - State Heavy",
    code: "model lesson_gating {\n  state: [enrolled, locked, complete],\n  triggers: quiz_score >= 80%\n}",
    scenariosCount: "6 roles",
    desc: "Structured classroom curriculum with automatic progress gates and state machines."
  },
  {
    id: "fintech",
    name: "Fintech Ledger",
    complexity: "L3 - Relational",
    code: "generate ledger_core {\n  entities: [Journal, Wallet, Asset],\n  concurrency: optimistic\n}",
    scenariosCount: "4 entities",
    desc: "Optimistic-locking balance ledgers ensuring zero double-spending constraints."
  },
  {
    id: "emr",
    name: "Healthcare EMR Portal",
    complexity: "L4 - High Security",
    code: "generate emr_gating {\n  entities: [Patient, DrAudit],\n  compliance: HIPAA_STD_V2\n}",
    scenariosCount: "4 modules",
    desc: "HIPAA-compliant client records portal with immutable modification logging audits."
  },
  {
    id: "canvas",
    name: "Shared Canva Tool",
    complexity: "L3 - Event Driven",
    code: "generate vector_canvas {\n  streams: dynamic_ws,\n  concurrency: operational_transform\n}",
    scenariosCount: "5 sub-roles",
    desc: "WebSocket-based shared real-time asset canvases with non-blocking undo states."
  },
  {
    id: "saas",
    name: "SaaS Billing Hub",
    complexity: "L2 - Standard",
    code: "generate stripe_gating {\n  saas: premium_tiers,\n  webhooks: auth_verify\n}",
    scenariosCount: "5 endpoints",
    desc: "Multi-tenant business checkouts with instant webhook gating rules."
  },
  {
    id: "iot",
    name: "Smart Fleet IoT Tracker",
    complexity: "L4 - Time Series",
    code: "generate telemetry_pipeline {\n  telemetry: dynamic_buffer,\n  downsample: 1_minute\n}",
    scenariosCount: "8 blocks",
    desc: "Fleet truck telemetry logging with downsampled aggregate tables."
  },
  {
    id: "support",
    name: "Helpdesk Ticket SLA",
    complexity: "L2 - Relational",
    code: "generate ticketing_sla {\n  sla: 4_hours,\n  routing: skill_balanced\n}",
    scenariosCount: "4 workflows",
    desc: "SLA automation routing, priority queue triggers, and client support schemas."
  },
  {
    id: "playground",
    name: "AI Code Sandbox",
    complexity: "L4 - Isolated VM",
    code: "generate transient_sandbox {\n  security: micro_vm,\n  max_ram: 256_mb\n}",
    scenariosCount: "5 limits",
    desc: "Isolated remote code run loops with native limit restrictions and memory guards."
  }
];

const STRESS_CASES = [
  {
    id: "vague",
    name: "The 'Vague Intent' Test",
    failurePoint: "SEMANTIC INFERENCE",
    promptSnippet: "Make me a thing like Uber but for dogs, it needs to handle some stuff and show a map.",
    ruleApplied: "Derived dynamic entities (DogProfile, DogBooking, DriverAgent). Injected lat/long coordinate types.",
    successRate: "93.4%",
    latency: "1.2s"
  },
  {
    id: "conflicting",
    name: "Conflicting Schemas",
    failurePoint: "LOGIC CONTRADICTION",
    promptSnippet: "Database must be local SQLite but also require horizontal scaling across 10 regions.",
    ruleApplied: "Corrected regional replication parameters; forced Litestream consensus replication patterns.",
    successRate: "89.2%",
    latency: "1.4s"
  },
  {
    id: "incomplete",
    name: "Incomplete Key Definition",
    failurePoint: "UNDERSPECIFIED CODES",
    promptSnippet: "Blog posting system, but don't specify any primary attributes on the post entity.",
    ruleApplied: "Synthesized basic metadata schemas (post_id, body_text, author_id, creation_date).",
    successRate: "98.1%",
    latency: "0.9s"
  },
  {
    id: "pii",
    name: "PII Leak Vulnerability",
    failurePoint: "CREDENTIAL PROTECTION",
    promptSnippet: "Construct user logins database. Let guest users export all columns (including raw plain password).",
    ruleApplied: "Interceptor wiped plaintext field export logic; enforced SHA256 hashed crypt formats.",
    successRate: "100.0%",
    latency: "1.1s"
  },
  {
    id: "crossref",
    name: "Stale ID Cross-Reference Aligning",
    failurePoint: "SCHEMA SYNC MISMATCH",
    promptSnippet: "API payload references client_uuid, but SQL table defines integer serial ids.",
    ruleApplied: "Normalized type interfaces across UI API and DB layers to standard validation schemas.",
    successRate: "99.4%",
    latency: "0.8s"
  },
  {
    id: "cyclic",
    name: "Cyclic Lock Risks",
    failurePoint: "TRANSACTION STAGE BLOCKS",
    promptSnippet: "Orders require invoices; Invoices block shipping; Shipping updates orders in continuous locks.",
    ruleApplied: "Applied message queue decoupling design to ensure lock-free execution.",
    successRate: "92.0%",
    latency: "1.5s"
  },
  {
    id: "roles",
    name: "Underspecified Access RBAC",
    failurePoint: "GUEST ACCESS LEAKS",
    promptSnippet: "Users write logs, supervisors check parameters, members edit files, guests bypass checkout.",
    ruleApplied: "Built neat RBAC tree forcing standard Guest, Member, and Moderator scopes securely.",
    successRate: "97.5%",
    latency: "1.0s"
  },
  {
    id: "bloat",
    name: "Unbounded Metadata Bloat",
    failurePoint: "DB STORAGE OVERFLOW",
    promptSnippet: "Store user tags lists of infinite sizes inside text arrays with no character limits.",
    ruleApplied: "Injected Postgres native JSONB array schemas restricted to safe bounds.",
    successRate: "100.0%",
    latency: "0.7s"
  },
  {
    id: "pagination",
    name: "Missing Grid Pagination API",
    failurePoint: "NETWORK INTENSITY EXHAUST",
    promptSnippet: "Return complete Lead rows of 10 million items in one single GET response.",
    ruleApplied: "Automatically injected SQL LIMIT and OFFSET parameters.",
    successRate: "99.8%",
    latency: "0.6s"
  },
  {
    id: "rogue",
    name: "Rogue Payments Gate Check",
    failurePoint: "STRIPE PRIVILEGES BYPASS",
    promptSnippet: "Let third-party clients execute payment subscription checkout routes without authentication.",
    ruleApplied: "Gated subscription hooks with valid JWT bearer token validation rules.",
    successRate: "100.0%",
    latency: "1.2s"
  }
];

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<'templates' | 'stress'>('templates');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Compiler Test Suite Runner Overlay State
  const [selectedCaseToRun, setSelectedCaseToRun] = useState<any | null>(null);
  const [runSteps, setRunSteps] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Gold Standard IR Preview Popup
  const [goldIrTemplate, setGoldIrTemplate] = useState<any | null>(null);
  const [goldCopy, setGoldCopy] = useState(false);

  const startTestCompile = (testCase: any) => {
    setSelectedCaseToRun(testCase);
    setIsRunning(true);
    setRunSteps([
      "// INITIATING COMPILE EXPERIMENT LOOP",
      "// Parsing specification schemas context parameters..."
    ]);

    const logs = [
      "[Stage 1/5] Syntactic token Analysis of prompt attributes...",
      "[Stage 2/5] Structuring entity graphs, tables & relationships...",
      "[Stage 3/5] Evaluating constraints safety & type contradictions...",
      testCase.ruleApplied 
        ? `[Stage 4/5] Boundary Issue Detected! Corrective Action: ${testCase.ruleApplied}` 
        : `[Stage 4/5] Multi-tier synchronization pass complete.`,
      `[Stage 5/5] Emitting pristine IR schemas under 100% security compliance.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setRunSteps(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 400);
  };

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-full overflow-x-hidden select-none">
      {/* Header Panel */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1c2b3c] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#8083ff] font-bold text-xs font-mono uppercase tracking-widest mb-1">
            <Layers className="w-4 h-4" />
            BENCHMARK WORKFLOW SYSTEM
          </div>
          <h2 className="font-display-lg text-3xl font-extrabold text-[#d4e4fa] tracking-tight">Dataset Evaluation Matrix</h2>
          <p className="text-body-md text-xs text-[#908fa0] max-w-2xl mt-1 leading-relaxed">
            Verify system resilience under distinct architectural presets or evaluate semantic repairs against complex edge cases.
          </p>
        </div>
        
        {/* Layout Control */}
        <div className="flex items-center gap-1 bg-[#071424] p-1 rounded-xl border border-[#1e2d3d] h-fit shrink-0">
          <button 
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg font-label-caps text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-[#122131] border border-[#1e2d3d] text-white font-black' 
                : 'text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            <Grid className="h-3.5 w-3.5 text-[#8083ff]" /> GRID
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg font-label-caps text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-[#122131] border border-[#1e2d3d] text-white font-black' 
                : 'text-[#908fa0] hover:text-[#d4e4fa]'
            }`}
          >
            <List className="h-3.5 w-3.5 text-[#8083ff]" /> LIST
          </button>
        </div>
      </header>

      {/* Screen Mode Tabs */}
      <div className="flex border-b border-[#1e2d3d] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 border-b-2 font-label-caps text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'templates' 
              ? 'border-[#8083ff] text-white bg-[#8083ff]/5 font-extrabold' 
              : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
          }`}
        >
          Product Blueprints (10 Presets)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stress')}
          className={`px-5 py-3 border-b-2 font-label-caps text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'stress' 
              ? 'border-[#8083ff] text-white bg-[#8083ff]/5 font-extrabold' 
              : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa]'
          }`}
        >
          Stress Edge-Cases (10 Conditions)
        </button>
      </div>

      {/* Content body */}
      {activeTab === 'templates' ? (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-[#8083ff]" />
            <h3 className="font-display-md text-base font-extrabold text-white">Verified Blueprint Configurations</h3>
            <span className="px-3 py-0.5 rounded-full bg-[#122131] text-[#c0c1ff] font-mono text-[9px] font-bold border border-[#c0c1ff]/15 select-none uppercase tracking-wide">
              STABLE_V4_ALPHA
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STANDARD_TEMPLATES.map((item) => (
                <article key={item.id} className="bg-[#071424] border border-[#1c2b3c] hover:border-[#8083ff]/40 rounded-2xl p-5 transition-all flex flex-col group justify-between shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-[#8083ff]/2 rounded-full blur group-hover:scale-150 transition-all duration-300 pointer-events-none" />
                  <div>
                    <div className="flex justify-between items-start mb-3 select-none pb-2.5 border-b border-[#122131]">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#c0c1ff] transition-colors">{item.name}</h4>
                        <p className="font-mono text-[9px] text-[#8083ff] uppercase tracking-wider mt-0.5 font-bold">{item.complexity}</p>
                      </div>
                      <span className="text-[10px] bg-[#030d19] text-[#908fa0] border border-[#1e2d3d] px-2.5 py-0.5 rounded-md font-mono font-bold uppercase">
                        {item.scenariosCount}
                      </span>
                    </div>
                    <p className="text-xs text-[#c7c4d7] leading-relaxed mb-4 h-12 overflow-hidden text-ellipsis line-clamp-2 md:line-clamp-none">{item.desc}</p>
                    
                    <div className="bg-[#030d19] p-3.5 border border-[#152538] rounded-xl mb-4.5 font-mono text-[11px] h-28 overflow-y-auto index-col custom-scrollbar">
                      <pre className="text-emerald-400/90 whitespace-pre-wrap font-mono select-text leading-relaxed">
                        {item.code}
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mt-auto pt-2 select-none">
                    <button 
                      type="button"
                      onClick={() => setGoldIrTemplate(item)}
                      className="flex-1 px-3 py-2 border border-[#1e2d3d] rounded-xl font-label-caps text-[9px] font-bold text-[#c7c4d7] hover:border-[#8083ff]/40 hover:bg-[#122131]/30 hover:text-white transition-all tracking-wider text-center cursor-pointer"
                    >
                      VIEW GOLD IR
                    </button>
                    <button 
                      type="button"
                      onClick={() => startTestCompile(item)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white rounded-xl font-label-caps text-[9px] font-extrabold hover:brightness-110 transition-all tracking-wider text-center cursor-pointer shadow shadow-[#8083ff]/10"
                    >
                      COMPILE SPEC
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {STANDARD_TEMPLATES.map((item) => (
                <div key={item.id} className="bg-[#071424] border border-[#1c2b3c] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-white pr-2 border-r border-[#152538]">{item.name}</h4>
                      <span className="text-[9px] font-mono text-[#8083ff] font-bold bg-[#122131] px-2 py-0.5 rounded-md uppercase">{item.complexity}</span>
                      <span className="text-[9px] font-mono text-[#908fa0]">{item.scenariosCount}</span>
                    </div>
                    <p className="text-xs text-[#908fa0] mt-1.5 pr-6 line-clamp-1">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 select-none">
                    <button 
                      type="button"
                      onClick={() => setGoldIrTemplate(item)}
                      className="px-4 py-2 border border-[#1e2d3d] rounded-xl font-label-caps text-[9px] font-bold text-[#c7c4d7] hover:border-[#8083ff]/40 hover:text-white hover:bg-[#122131]/30 transition-all cursor-pointer"
                    >
                      VIEW GOLD IR
                    </button>
                    <button 
                      type="button"
                      onClick={() => startTestCompile(item)}
                      className="px-4 py-2 bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white rounded-xl font-label-caps text-[9px] font-extrabold hover:brightness-110 transition-all cursor-pointer"
                    >
                      COMPILE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="font-display-md text-base font-extrabold text-white">Grammar Calibration & Repairs</h3>
            <span className="px-3 py-0.5 rounded-full bg-red-400/10 text-red-300 font-mono text-[9px] font-bold border border-red-500/20 select-none uppercase tracking-wide">
              VERIFIED_FAILURES_10
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STRESS_CASES.map((item) => (
              <article key={item.id} className="bg-[#071424] border border-[#1c2b3c] hover:border-red-400/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-start mb-3 pb-2.5 border-b border-[#122131] select-none">
                    <div>
                      <h4 className="text-sm font-bold text-red-400">{item.name}</h4>
                      <p className="font-mono text-[9px] text-[#908fa0] mt-0.5 uppercase tracking-wider font-semibold">PATTERN: {item.failurePoint}</p>
                    </div>
                    <span className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-2.5 py-0.5 rounded-md font-mono font-bold whitespace-nowrap">
                      ACCURACY: {item.successRate}
                    </span>
                  </div>

                  <div className="bg-[#030d19] p-3.5 border-l-2 border-red-500/80 rounded-r-xl mb-4 text-xs font-mono">
                    <span className="text-[#908fa0] block mb-1.5 font-mono text-[10px] tracking-wide font-bold">// Raw Input Prompt Snippet:</span>
                    <p className="text-[#bec6e0] italic font-mono leading-relaxed">"{item.promptSnippet}"</p>
                  </div>

                  <div className="bg-[#030d19] p-3 px-3.5 rounded-xl border border-[#152538] mb-4.5 text-xs text-[#c7c4d7] leading-relaxed">
                    <span className="text-emerald-400 font-bold block font-mono text-[10px] mb-1 tracking-wide uppercase">REPAIR INJECTOR ACTION:</span>
                    {item.ruleApplied}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-2.5 pt-3.5 border-t border-[#122131] select-none">
                  <span className="text-[10px] font-mono text-[#908fa0]">Latency (P95): <b className="text-[#c0c1ff]">{item.latency}</b></span>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleCopySnippet(item.id, item.promptSnippet)}
                      className="px-3 py-1.5 border border-[#1e2d3d] hover:border-[#8083ff]/40 rounded-lg font-label-caps text-[9px] text-[#c7c4d7] hover:text-white hover:bg-[#122131]/30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-[#8083ff]" />}
                      {copiedPromptId === item.id ? "COPIED" : "COPY PROMPT"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => startTestCompile(item)}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 rounded-lg font-label-caps text-[9px] font-black transition-all cursor-pointer"
                    >
                      STAGE_TEST
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Numerical Metrics Summary panel */}
      <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#1e2d3d] select-none">
        <div className="bg-[#071424] border border-[#1c2b3c] p-4.5 rounded-2xl shadow">
          <p className="font-label-caps text-[9px] text-[#908fa0] mb-1 font-extrabold tracking-wider">STABILITY INDEX</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-xl font-black text-emerald-400">98.4%</span>
            <span className="text-[10px] text-emerald-500 font-mono font-bold">+1.2%</span>
          </div>
        </div>

        <div className="bg-[#071424] border border-[#1c2b3c] p-4.5 rounded-2xl shadow">
          <p className="font-label-caps text-[9px] text-[#908fa0] mb-1 font-extrabold tracking-wider">TOTAL TRIAL CASES</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-xl font-black text-white">20 Matrices</span>
          </div>
        </div>

        <div className="bg-[#071424] border border-[#1c2b3c] p-4.5 rounded-2xl shadow">
          <p className="font-label-caps text-[9px] text-[#908fa0] mb-1 font-extrabold tracking-wider">P90 RESOLVED RATE</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-xl font-black text-emerald-400">940ms</span>
          </div>
        </div>

        <div className="bg-[#071424] border border-[#1c2b3c] p-4.5 rounded-2xl shadow">
          <p className="font-label-caps text-[9px] text-[#908fa0] mb-1 font-extrabold tracking-wider">REPAIR INTERVENTIONS</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display-md text-xl font-black text-[#c0c1ff]">14,281 PASS</span>
          </div>
        </div>
      </footer>

      {/* Gold Standard IR Modal Popups */}
      {goldIrTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-xl bg-[#071424] border border-[#1e2d3d] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#1c2b3c]">
              <div className="flex items-center gap-2.5">
                <Workflow className="h-5 w-5 text-[#8083ff]" />
                <h3 className="font-display-md text-sm font-extrabold text-white">Emitted Intermediate Representation</h3>
              </div>
              <button 
                type="button"
                onClick={() => setGoldIrTemplate(null)}
                className="text-[#908fa0] hover:text-white p-1 rounded-full hover:bg-[#122131]/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-5 bg-[#030d19] custom-scrollbar text-xs">
              <pre className="font-mono text-emerald-400/95 leading-relaxed select-text">
{`{
  "template": "${goldIrTemplate.id}",
  "architecture_rating": "Enterprise Balanced",
  "build_pipeline": "IR_EMITTER_v4.2",
  "generated_outputs": {
    "db_layer": "schema.sql",
    "router": "main.py",
    "interface": "DashboardView.tsx"
  },
  "emitted_rules": [
    { "engine": "AST_VALIDATION", "status": "APPROVED" }
  ]
}`}
              </pre>
            </div>

            <div className="px-6 py-4.5 bg-[#071424] border-t border-[#1c2b3c] flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => handleCopySnippet(goldIrTemplate.id, goldIrTemplate.code)}
                className="px-4 py-2 border border-[#1e2d3d] text-xs font-semibold text-[#c7c4d7] hover:border-[#8083ff]/40 hover:text-white rounded-xl hover:bg-[#122131]/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5 text-[#8083ff]" /> COPY CODECODE
              </button>
              <button 
                type="button"
                onClick={() => setGoldIrTemplate(null)}
                className="px-5 py-2 bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Mock Test Compile Runner Overlay */}
      {selectedCaseToRun && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-lg bg-[#071424] border border-[#1e2d3d] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
            <div className="bg-[#030d19] border-b border-[#1c2b3c] px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#8083ff]" />
                <span className="font-mono text-xs tracking-wide">COMPILER_BENCHMARK_STAGING.js</span>
              </div>
              {!isRunning && (
                <button 
                  type="button"
                  onClick={() => setSelectedCaseToRun(null)}
                  className="text-[#908fa0] hover:text-white p-1 rounded-full hover:bg-[#122131]/60 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#030d19] p-3 rounded-xl border border-[#152538] text-xs">
                <span className="text-[#908fa0] font-mono text-[10px] block mb-0.5">CURRENT EXPERIMENT PRESENCE:</span>
                <span className="text-[#c0c1ff] font-sans font-bold">{selectedCaseToRun.name} ({selectedCaseToRun.id})</span>
              </div>

              {/* Steps Console Box */}
              <div className="bg-[#020b14] p-4.5 rounded-xl h-48 overflow-y-auto custom-scrollbar font-mono text-[11px] text-emerald-400 space-y-2 border border-[#152538]">
                {runSteps.map((step, idx) => (
                  <div key={idx} className="whitespace-pre-wrap font-mono leading-relaxed">{step}</div>
                ))}
                {isRunning && (
                  <div className="text-amber-400 animate-pulse font-mono flex items-center gap-2 text-xs">
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    Analyzing semantic token rules passes...
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#030d19] border-t border-[#1c2b3c] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCaseToRun(null)}
                disabled={isRunning}
                className="px-5 py-2.5 bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 cursor-pointer"
              >
                {isRunning ? "PROCESSING..." : "CLOSE TEST"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
