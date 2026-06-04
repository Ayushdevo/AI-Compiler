import React, { useState } from 'react';
import { 
  Check, 
  Copy,
  Info, 
  Rocket, 
  Download, 
  Settings, 
  Lock, 
  UserCheck, 
  Code2, 
  Plus,
  Terminal,
  Play,
  Activity,
  CheckCircle2,
  FileCode2,
  AlertCircle
} from 'lucide-react';
import { TemplateData, PermissionRow } from '../types';

interface SchemaScreenProps {
  selectedTemplate: TemplateData;
  setTemplate: (t: TemplateData) => void;
}

export default function SchemaScreen({ selectedTemplate, setTemplate }: SchemaScreenProps) {
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ui' | 'api' | 'db' | 'auth'>('ui');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'guest'>('admin');
  const [repairToast, setRepairToast] = useState(false);
  const [copiedCodeFlag, setCopiedCodeFlag] = useState(false);
  const [copiedConfigFlag, setCopiedConfigFlag] = useState(false);

  // Secure local runtime execution simulator
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    "// CORE RUNTIME READY: NO_ERRORS_DETECTION",
    "// Select an operation below to mount & execute compiled structures."
  ]);
  const [isSandboxTesting, setIsSandboxTesting] = useState(false);

  const runSandboxTest = (action: 'db' | 'api' | 'auth' | 'stripe') => {
    if (isSandboxTesting) return;
    setIsSandboxTesting(true);
    setSandboxLogs(prev => [...prev, `\n> RUNNING VIRTUALIZED SANDBOX PAYLOAD: ${action.toUpperCase()}_TEST...`]);

    setTimeout(() => {
      let runSteps: string[] = [];
      const timestamp = new Date().toLocaleTimeString();
      const entityLabel = selectedTemplate.name || "AppEntity";

      if (action === 'db') {
        runSteps = [
          `[${timestamp}] [SYS-COMPILER] Analyzing emitted DDL tables...`,
          `[${timestamp}] [PostgresL3] Validated model fields mapping matching API structures`,
          `[${timestamp}] [SQL_LOG] Executing: CREATE TABLE IF NOT EXISTS ${entityLabel.toLowerCase()} (`,
          `   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`,
          `   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),`,
          `   status VARCHAR(50) DEFAULT 'draft'`,
          `);`,
          `[${timestamp}] [SQL_LOG] Applied foreign key bindings smoothly. Constraint verification: 15ms.`,
          `[${timestamp}] [STATUS] SCHEMA INTEGRITY VERIFICATION SUCCEEDED.`
        ];
      } else if (action === 'api') {
        runSteps = [
          `[${timestamp}] [SYS-COMPILER] Parsing FastAPI router definitions...`,
          `[${timestamp}] [FastAPI] Mounting dynamic parameters endpoint POST /api/v1/${entityLabel.toLowerCase()}`,
          `[${timestamp}] [TEST-INITIATED] Sending test mock record payload matching model fields...`,
          `[${timestamp}] [PAYLOAD] { "status": "active", "created_by": "admin-01" }`,
          `[${timestamp}] [FastAPI] Responded with Status Code: 200 OK.`,
          `[${timestamp}] [STATUS] CLIENT ROUTING INTERFACE INTEGRATION SECURE.`
        ];
      } else if (action === 'auth') {
        runSteps = [
          `[${timestamp}] [SYS-COMPILER] Parsing active security policy parameters...`,
          `[${timestamp}] [YAML_GATE] Initializing interceptor check...`,
          `[${timestamp}] [AUTH_LOG] Routing request to: GET /api/v1/${entityLabel.toLowerCase()}`,
          `[${timestamp}] [AUTH_LOG] Target credentials matches role "${selectedRole.toUpperCase()}"`,
          `[${timestamp}] [AUTH_LOG] Gating validation policy matched strictly!`,
          `[${timestamp}] [YAML_GATE] Decision -> ${selectedRole === 'guest' ? 'RESTRICTED (READ-ONLY)' : 'AUTHORIZED (CRUD)'}`,
          `[${timestamp}] [STATUS] TENANT SHIELD VALIDATION VERIFIED.`
        ];
      } else if (action === 'stripe') {
        runSteps = [
          `[${timestamp}] [SYS-COMPILER] Scoped Stripe checkout hooks...`,
          `[${timestamp}] [BILLING] Injecting verified cents parameters (USD 99.00)`,
          `[${timestamp}] [STRIPE_SIGN] Generating transient verification fingerprint token...`,
          `[${timestamp}] [STRIPE_DEV] Webhook event received: "checkout.session.completed"`,
          `[${timestamp}] [STATUS] Stripe workflow simulation compiled with zero memory leak.`
        ];
      }

      setSandboxLogs(prev => [...prev, ...runSteps]);
      setIsSandboxTesting(false);
    }, 1000);
  };

  // Read code content depending on selected tab
  const getActiveCode = () => {
    switch (activeSchemaTab) {
      case 'ui': return selectedTemplate.uiSchemaCode;
      case 'api': return selectedTemplate.apiSchemaCode;
      case 'db': return selectedTemplate.dbSchemaCode;
      default: return selectedTemplate.uiSchemaCode;
    }
  };

  const getCodeFilename = () => {
    switch (activeSchemaTab) {
      case 'ui': return 'DashboardView.tsx';
      case 'api': return 'main.py';
      case 'db': return 'schema.sql';
      default: return 'DashboardView.tsx';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedCodeFlag(true);
    setTimeout(() => setCopiedCodeFlag(false), 2000);
  };

  const handlePushToRuntime = () => {
    setRepairToast(true);
    setTimeout(() => setRepairToast(false), 3000);
  };

  const handleDownloadConfig = () => {
    try {
      const dataStr = JSON.stringify(selectedTemplate, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const filename = `${selectedTemplate.id || 'compiler-template'}-config.json`;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export configuration:', e);
    }
  };

  const handleCopyConfig = () => {
    try {
      const dataStr = JSON.stringify(selectedTemplate, null, 2);
      navigator.clipboard.writeText(dataStr);
      setCopiedConfigFlag(true);
      setTimeout(() => setCopiedConfigFlag(false), 2000);
    } catch (e) {
      console.error('Failed to copy configuration to clipboard:', e);
    }
  };

  const handlePermissionToggle = (entityIndex: number, field: 'read' | 'write' | 'update' | 'delete') => {
    const updatedPermissions = { ...selectedTemplate.permissions };
    const rows = [...updatedPermissions[selectedRole]];
    
    rows[entityIndex] = {
      ...rows[entityIndex],
      [field]: !rows[entityIndex][field]
    };
    
    updatedPermissions[selectedRole] = rows;
    setTemplate({
      ...selectedTemplate,
      permissions: updatedPermissions
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#020b14] animate-fade-in h-[calc(100vh-64px)] overflow-hidden">
      {/* Toast alert on compilation push */}
      {repairToast && (
        <div className="fixed top-18 right-6 z-[100] bg-[#071526]/95 border-2 border-emerald-500 rounded-2xl p-4.5 shadow-[0_10px_35px_rgba(16,185,129,0.25)] backdrop-blur-md animate-bounce flex items-center gap-4 max-w-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm tracking-tight leading-none">Deployment Success</p>
            <p className="text-[11px] text-[#c7c4d7] mt-1.5 leading-relaxed">Emitted AST properties for {selectedTemplate.name} successfully pushed to the dynamic server sandbox.</p>
          </div>
        </div>
      )}

      {/* Breadcrumbs Context Bar */}
      <div className="h-12 flex items-center px-6 border-b border-[#152538] justify-between bg-[#030d19]/80 backdrop-blur-sm select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#6265f0] tracking-wider font-semibold">SYN-882</span>
          <span className="text-slate-700 text-xs">/</span>
          <span className="font-label-caps text-[10px] text-white font-black tracking-widest">OUTPUT WORKSPACE</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-label-caps text-[9px] text-[#908fa0] flex items-center gap-2 font-bold select-none">
            VER STATUS:
            <select className="bg-[#051424] border border-[#1e2d3d] rounded px-2.5 py-1 text-[#c0c1ff] font-sans font-extrabold text-[9px] cursor-pointer focus:outline-none focus:border-[#8083ff]/40">
              <option className="bg-[#051424]">REPAIRED_INTEGRITY_v1.0</option>
              <option className="bg-[#051424]">RAW_PRE_VALID_STAGE</option>
            </select>
          </label>
        </div>
      </div>

      {/* Editor Header Tabs */}
      <div className="bg-[#030d19]/60 border-b border-[#111f2e] flex overflow-x-auto no-scrollbar shrink-0 select-none">
        <button 
          onClick={() => setActiveSchemaTab('ui')}
          className={`px-6 py-4 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSchemaTab === 'ui' 
              ? 'border-[#8083ff] text-white bg-[#8083ff]/5 font-black' 
              : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa] hover:bg-[#122131]/20'
          }`}
        >
          UI VIEW_COMP (NEXT.JS)
        </button>
        <button 
          onClick={() => setActiveSchemaTab('api')}
          className={`px-6 py-4 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSchemaTab === 'api' 
              ? 'border-[#8083ff] text-white bg-[#8083ff]/5 font-black' 
              : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa] hover:bg-[#122131]/20'
          }`}
        >
          API ROUTER (FASTAPI)
        </button>
        <button 
          onClick={() => setActiveSchemaTab('db')}
          className={`px-6 py-4 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSchemaTab === 'db' 
              ? 'border-[#8083ff] text-white bg-[#8083ff]/5 font-black' 
              : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa] hover:bg-[#122131]/20'
          }`}
        >
          DATA TABLES (POSTGRESQL)
        </button>
        <button 
          onClick={() => setActiveSchemaTab('auth')}
          className={`px-6 py-4 border-b-2 font-label-caps text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSchemaTab === 'auth' 
              ? 'border-[#8083ff] text-white bg-[#8083ff]/5 font-black' 
              : 'border-transparent text-[#908fa0] hover:text-[#d4e4fa] hover:bg-[#122131]/20'
          }`}
        >
          ACCESS POLICIES (YAML)
        </button>
      </div>

      {/* Two Pane Workbench */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden relative">
        {/* Left Side: Active Workspace Code block */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 bg-[#020b14]/40">
          {activeSchemaTab !== 'auth' ? (
            <div className="flex-1 flex flex-col bg-[#030d19]/90 backdrop-blur-md rounded-2xl border border-[#1c2b3c] overflow-hidden shadow-2xl">
              {/* Fake IDE Header Bar */}
              <div className="bg-[#071321] px-5 py-2.5 flex justify-between items-center border-b border-[#1c2b3c] select-none">
                <span className="font-mono text-xs text-[#c0c1ff]">{getCodeFilename()}</span>
                <button 
                  onClick={handleCopyCode}
                  className="font-sans text-xs text-[#908fa0] hover:text-white flex items-center gap-1.5 px-3 py-1 bg-[#122131] border border-[#1e2d3d] hover:border-[#8083ff]/30 rounded-lg transition-all cursor-pointer"
                >
                  {copiedCodeFlag ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 animate-scale-up" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedCodeFlag ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              {/* High-Fidelity Styled view pane */}
              <div className="flex-1 p-4 md:p-6 font-mono text-[12.5px] text-[#d4e4fa] overflow-auto select-text leading-relaxed bg-[#020b14]">
                <table className="w-full">
                  <tbody>
                    {getActiveCode().split('\n').map((line, index) => {
                      // Custom AST syntax highlighters for aesthetics
                      let highlightedStr = line
                        .replace(/import|from|export|default|function|return|class|def|async|CREATE TABLE|PRIMARY KEY|FOREIGN KEY|REFERENCES|CHECK|IF NOT EXISTS/g, (match) => `<span class="text-[#c0c1ff] font-bold">${match}</span>`)
                        .replace(/'[^']*'|"[^"]*"/g, (match) => `<span class="text-emerald-400 font-medium">${match}</span>`)
                        .replace(/\/\/.*|#.*/g, (match) => `<span class="text-[#465a73] italic">${match}</span>`);

                      return (
                        <tr key={index} className="hover:bg-[#122131]/30 font-mono">
                          <td className="text-right text-[#34485f] select-none pr-5 w-8 font-mono text-[11px] border-r border-[#152538]">
                            {index + 1}
                          </td>
                          <td className="pl-5 font-mono whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedStr }} />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Auth Tab Content View - Interactive Matrix Tracker */
            <div className="space-y-6 flex-1 animate-fade-in pb-4">
              {/* Role Selector bar */}
              <section className="bg-[#030d19]/80 p-1.5 rounded-2xl border border-[#1c2b3c] flex gap-2 w-full select-none shadow">
                <button 
                  onClick={() => setSelectedRole('admin')}
                  className={`flex-1 py-3 px-4 rounded-xl font-label-caps text-[10px] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    selectedRole === 'admin' 
                      ? 'bg-[#6265f0] text-white font-extrabold shadow-[0_0_12px_rgba(98,101,240,0.3)]' 
                      : 'hover:bg-[#122131]/60 text-[#c7c4d7]'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" /> ADMIN ROLE
                </button>
                <button 
                  onClick={() => setSelectedRole('member')}
                  className={`flex-1 py-3 px-4 rounded-xl font-label-caps text-[10px] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    selectedRole === 'member' 
                      ? 'bg-[#6265f0] text-white font-extrabold shadow-[0_0_12px_rgba(98,101,240,0.3)]' 
                      : 'hover:bg-[#122131]/60 text-[#c7c4d7]'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" /> MEMBER ROLE
                </button>
                <button 
                  onClick={() => setSelectedRole('guest')}
                  className={`flex-1 py-3 px-4 rounded-xl font-label-caps text-[10px] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    selectedRole === 'guest' 
                      ? 'bg-[#6265f0] text-white font-extrabold shadow-[0_0_12px_rgba(98,101,240,0.3)]' 
                      : 'hover:bg-[#122131]/60 text-[#c7c4d7]'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" /> GUEST ROLE
                </button>
                <button className="w-12 flex items-center justify-center rounded-xl border border-dashed border-slate-700 hover:border-[#8083ff]/40 hover:bg-[#122131]/20 transition-all cursor-pointer">
                  <Plus className="h-4 w-4 text-slate-500 hover:text-white" />
                </button>
              </section>

              {/* Permissions Checkbox Grid layout */}
              <section className="bg-[#071424] p-6 rounded-2xl border border-[#1e2d3d] shadow-2xl">
                <div className="flex items-center justify-between mb-5 select-none pb-3 border-b border-[#1c2b3c]">
                  <div className="flex flex-col">
                    <h2 className="font-display-md text-base font-extrabold text-white">Grid Policy Controls</h2>
                    <p className="text-[11px] text-[#908fa0] mt-0.5">Toggle row-level capabilities emitted onto JWT tokens.</p>
                  </div>
                  <span className="font-label-caps text-[9px] font-black bg-[#6265f0]/15 text-[#c0c1ff] px-3 py-1 rounded-full border border-[#8083ff]/25 uppercase tracking-wider">
                    ROLE: {selectedRole}
                  </span>
                </div>
                
                <div className="overflow-x-auto select-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1c2b3c] text-[#908fa0]">
                        <th className="pb-3 font-label-caps text-[10px] tracking-wider pr-6">Database Model/Entity</th>
                        <th className="pb-3 font-label-caps text-[10px] tracking-wider text-center w-24">Read</th>
                        <th className="pb-3 font-label-caps text-[10px] tracking-wider text-center w-24">Write</th>
                        <th className="pb-3 font-label-caps text-[10px] tracking-wider text-center w-24">Update</th>
                        <th className="pb-3 font-label-caps text-[10px] tracking-wider text-center w-24">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#152538]/50">
                      {(selectedTemplate.permissions[selectedRole] || []).map((row, i) => (
                        <tr key={i} className="hover:bg-[#122131]/20 transition-colors">
                          <td className="py-4 pr-6 tracking-wide text-xs text-white">
                            <span className="font-mono bg-[#030d19] border border-[#1e2d3d] px-2.5 py-1 rounded-md text-[#c0c1ff] font-semibold">{row.entity}</span>
                          </td>
                          <td className="py-4 text-center">
                            <input
                              type="checkbox"
                              checked={row.read}
                              onChange={() => handlePermissionToggle(i, 'read')}
                              className="w-4 h-4 text-[#6265f0] bg-[#020b14] rounded border-slate-700 focus:ring-[#8083ff]/40 cursor-pointer accent-[#6265f0]"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input
                              type="checkbox"
                              checked={row.write}
                              onChange={() => handlePermissionToggle(i, 'write')}
                              className="w-4 h-4 text-[#6265f0] bg-[#020b14] rounded border-slate-700 focus:ring-[#8083ff]/40 cursor-pointer accent-[#6265f0]"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input
                              type="checkbox"
                              checked={row.update}
                              onChange={() => handlePermissionToggle(i, 'update')}
                              className="w-4 h-4 text-[#6265f0] bg-[#020b14] rounded border-slate-700 focus:ring-[#8083ff]/40 cursor-pointer accent-[#6265f0]"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input
                              type="checkbox"
                              checked={row.delete}
                              onChange={() => handlePermissionToggle(i, 'delete')}
                              className="w-4 h-4 text-[#6265f0] bg-[#020b14] rounded border-slate-700 focus:ring-[#8083ff]/40 cursor-pointer accent-[#6265f0]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Logic Policies YAML section */}
              <section className="bg-[#030d19] rounded-2xl border border-[#1e2d3d] flex flex-col overflow-hidden shadow-2xl">
                <div className="bg-[#071321] px-5 py-3 flex items-center justify-between border-b border-[#1c2b3c] select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#c0c1ff] font-bold">{selectedRole.toUpperCase()}_RULES.YAML</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePushToRuntime}
                      className="text-[10px] bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white hover:brightness-110 cursor-pointer font-label-caps py-1.5 px-3 rounded-lg shadow font-bold"
                    >
                      PATCH_RULES
                    </button>
                    <Info className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
                <div className="p-5 font-mono text-xs md:text-[13px] leading-relaxed text-[#d4e4fa] select-text bg-[#020b14]">
                  {(selectedTemplate.authSchemaYaml || '').split('\n').map((line, index) => {
                    let coloredLine = line
                      .replace(/policy|action|condition|if|match|with|grant/g, match => `<span class="text-[#c0c1ff] font-bold">${match}</span>`)
                      .replace(/"[^"]*"/g, match => `<span class="text-emerald-400">${match}</span>`);
                    return (
                      <div key={index} className="flex hover:bg-[#122131]/20 py-0.5">
                        <span className="text-[#3c4e62] w-8 shrink-0 select-none font-mono text-[10px] border-r border-[#152538] pr-2.5 text-right">{index + 1}</span>
                        <div className="pl-4.5 font-mono" dangerouslySetInnerHTML={{ __html: coloredLine }} />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Status block row info */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
                <div className="bg-[#071424] p-4.5 rounded-2xl border border-[#1e2d3d] flex flex-col items-center justify-center text-center shadow">
                  <span className="font-label-caps text-[9px] text-[#908fa0] mb-1.5">INTEGRITY REPORT</span>
                  <span className="text-sm text-emerald-400 font-extrabold flex items-center gap-1">100% SECURE</span>
                  <div className="w-full h-1 bg-[#152538] rounded-full mt-3 overflow-hidden">
                    <div className="w-full h-full bg-emerald-500" />
                  </div>
                </div>

                <div className="bg-[#071424] p-4.5 rounded-2xl border border-[#1e2d3d] flex flex-col items-center justify-center text-center shadow">
                  <span className="font-label-caps text-[9px] text-[#908fa0] mb-1.5">API REST COHESION</span>
                  <span className="text-sm text-emerald-400 font-extrabold">COMPLIANT</span>
                  <div className="w-full h-1 bg-[#152538] rounded-full mt-3 overflow-hidden">
                    <div className="w-full h-full bg-emerald-400" />
                  </div>
                </div>

                <div className="bg-[#071424] p-4.5 rounded-2xl border border-[#1e2d3d] flex flex-col items-center justify-center text-center shadow">
                  <span className="font-label-caps text-[9px] text-[#908fa0] mb-1.5">POSTGRES DDL SYNC</span>
                  <span className="text-sm text-amber-500 font-extrabold">EMITTED</span>
                  <div className="w-full h-1 bg-[#152538] rounded-full mt-3 overflow-hidden">
                    <div className="w-4/5 h-full bg-amber-500" />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Panel: Schema Sandbox Simulator section */}
        <div className="hidden xl:flex flex-col w-96 border-l border-[#152538] bg-[#030d19]/90 backdrop-blur-md shrink-0 p-5 space-y-5 overflow-y-auto custom-scrollbar select-none">
          <div className="border-b border-[#1c2b3c] pb-3.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-white tracking-widest font-black">LOCAL HYPERTHREAD SANDBOX</span>
            <Terminal className="h-4 w-4 text-[#8083ff]" />
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="bg-[#071424] p-4.5 rounded-2xl border border-[#1e2d3d] space-y-3 shadow shadow-black/10">
                <h4 className="font-label-caps text-[9px] text-emerald-400 flex items-center gap-1.5 font-black">
                  <Activity className="h-3.5 w-3.5" />
                  RUN REPL SIMULATORS
                </h4>
                <p className="text-[11px] text-[#908fa0] leading-relaxed">
                  Interactively mock database, routers, check permissions levels, and Stripe cent hooks against our live server memory context.
                </p>
                
                {/* Simulator Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button
                    onClick={() => runSandboxTest('db')}
                    disabled={isSandboxTesting}
                    className="bg-[#030d19] border border-[#1e2d3d] text-[10px] text-[#c7c4d7] py-2 px-1 rounded-xl font-label-caps font-bold hover:border-[#8083ff]/50 hover:text-white hover:bg-[#122131]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Play className="h-2 w-2 fill-current" />
                    INIT_DB
                  </button>
                  <button
                    onClick={() => runSandboxTest('api')}
                    disabled={isSandboxTesting}
                    className="bg-[#030d19] border border-[#1e2d3d] text-[10px] text-[#c7c4d7] py-2 px-1 rounded-xl font-label-caps font-bold hover:border-[#8083ff]/50 hover:text-white hover:bg-[#122131]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Play className="h-2 w-2 fill-current" />
                    ROUTE_TEST
                  </button>
                  <button
                    onClick={() => runSandboxTest('auth')}
                    disabled={isSandboxTesting}
                    className="bg-[#030d19] border border-[#1e2d3d] text-[10px] text-[#c7c4d7] py-2 px-1 rounded-xl font-label-caps font-bold hover:border-[#8083ff]/50 hover:text-white hover:bg-[#122131]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Play className="h-2 w-2 fill-current" />
                    AUTH_GATE
                  </button>
                  <button
                    onClick={() => runSandboxTest('stripe')}
                    disabled={isSandboxTesting}
                    className="bg-[#030d19] border border-[#1e2d3d] text-[10px] text-[#c7c4d7] py-2 px-1 rounded-xl font-label-caps font-bold hover:border-[#8083ff]/50 hover:text-white hover:bg-[#122131]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Play className="h-2 w-2 fill-current" />
                    STRIPE_CHECK
                  </button>
                </div>
              </div>

              {/* Terminal Frame */}
              <div className="flex-1 flex flex-col bg-black border border-[#1c2b3c] rounded-2xl overflow-hidden font-mono text-[10px] shadow-lg">
                <div className="bg-[#090b11] border-b border-[#1c2b3c] px-3.5 py-2 flex justify-between items-center text-[#465a73] font-bold tracking-wider font-mono select-none">
                  <span>SYSTEM_REPL.sh</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-sans">LIVE</span>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 text-emerald-400 select-text leading-relaxed font-mono bg-black">
                  {sandboxLogs.map((log, lIdx) => (
                    <div key={lIdx} className="whitespace-pre-wrap font-mono text-[11px]">
                      {log.startsWith('>') ? (
                        <span className="text-white font-black">{log}</span>
                      ) : log.includes('[STATUS]') ? (
                        <span className="text-emerald-300 font-bold leading-relaxed">{log}</span>
                      ) : log.includes('Executing:') ? (
                        <span className="text-amber-400 font-medium">{log}</span>
                      ) : (
                        <span className="text-emerald-500/80">{log}</span>
                      )}
                    </div>
                  ))}
                  {isSandboxTesting && (
                    <div className="text-amber-400 animate-pulse font-mono font-bold text-[11px]">
                      [SYS_LOAD] Executing REPL instruction...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#1c2b3c] pt-4.5 space-y-3">
              <button 
                onClick={handlePushToRuntime}
                className="w-full bg-gradient-to-r from-[#6265f0] to-[#8083ff] text-white font-label-caps text-xs py-3.5 rounded-xl hover:brightness-110 active:scale-97 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#8083ff]/15 cursor-pointer font-black"
              >
                <Rocket className="h-4 w-4 animate-bounce" />
                PUSH ACTIVE CONFIG TO RUNTIME
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleDownloadConfig}
                  className="bg-transparent border border-[#1e2d3d] hover:border-[#8083ff]/40 text-[#c7c4d7] hover:text-white font-label-caps text-[9px] font-bold tracking-wider py-2.5 rounded-xl hover:bg-[#122131]/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-[#8083ff]" />
                  DOWNLOAD
                </button>
                <button 
                  onClick={handleCopyConfig}
                  className="bg-transparent border border-[#1e2d3d] hover:border-[#8083ff]/40 text-[#c7c4d7] hover:text-white font-label-caps text-[9px] font-bold tracking-wider py-2.5 rounded-xl hover:bg-[#122131]/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedConfigFlag ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#8083ff]" />
                      COPY CONFIG
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
