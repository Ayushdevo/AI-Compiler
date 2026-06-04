import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CompilerScreen from './components/CompilerScreen';
import SchemaScreen from './components/SchemaScreen';
import MetricsScreen from './components/MetricsScreen';
import LibraryScreen from './components/LibraryScreen';
import { GOLD_TEMPLATES, Screen, TemplateData } from './types';
import { Cpu, Terminal, Activity, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('compiler');
  const [template, setTemplate] = useState<TemplateData>(GOLD_TEMPLATES.crm);
  const [promptInput, setPromptInput] = useState<string>(GOLD_TEMPLATES.crm.prompt);
  
  // Compilation states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState(4); // default 4 means compiled completed

  const startCompilation = async () => {
    if (isCompiling) return;
    
    setIsCompiling(true);
    setCompileStep(1);

    // Step 1 Lexical Analysis simulation (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));
    setCompileStep(2);

    // Step 2 Schema Generation (350ms)
    await new Promise((resolve) => setTimeout(resolve, 350));
    setCompileStep(3);

    // Step 3 Validation (350ms)
    await new Promise((resolve) => setTimeout(resolve, 350));
    setCompileStep(4);

    // Post to Express backend server
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptInput })
      });
      const json = await res.json();
      if (json && json.data) {
        setTemplate(json.data);
      }
    } catch (err) {
      console.error('Inference server failed. Preserving local mock pipeline values.', err);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b14] text-[#d4e4fa] flex flex-col font-sans select-none antialiased cyber-grid-bg">
      {/* Shared Header bar */}
      <Header 
        currentScreen={currentScreen} 
        isCompiling={isCompiling} 
        statusText={currentScreen === 'schema' ? 'RUNTIME STABLE' : 'ENGINE ONLINE'} 
      />

      {/* Main Screen Frame Layout */}
      <div className="flex-1 flex pt-16 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Responsive Desktop Side Navigation Rail */}
        <nav className="hidden sm:flex flex-col w-18 bg-[#030d19]/95 border-r border-[#152538] items-center py-6 gap-6 select-none relative z-25 shrink-0">
          <button
            onClick={() => setCurrentScreen('compiler')}
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

          <button
            onClick={() => setCurrentScreen('schema')}
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

          <button
            onClick={() => setCurrentScreen('metrics')}
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

          <button
            onClick={() => setCurrentScreen('library')}
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

        {/* Adaptive Secondary Sidebar */}
        <Sidebar 
          currentScreen={currentScreen} 
          isCompiling={isCompiling} 
          compileStep={compileStep}
          template={template}
          onNavigate={(s) => setCurrentScreen(s)}
        />

        {/* Content Body Pane Grid */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#020b14]/70 relative custom-scrollbar pb-16 md:pb-0 animate-fade-in">
          {currentScreen === 'compiler' && (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
              <CompilerScreen 
                promptInput={promptInput}
                setPromptInput={setPromptInput}
                selectedTemplate={template}
                setTemplate={setTemplate}
                onNavigate={(screen) => setCurrentScreen(screen)}
                isCompiling={isCompiling}
                onStartCompilation={startCompilation}
              />
            </div>
          )}

          {currentScreen === 'schema' && (
            <SchemaScreen 
              selectedTemplate={template}
              setTemplate={setTemplate}
            />
          )}

          {currentScreen === 'metrics' && (
            <MetricsScreen />
          )}

          {currentScreen === 'library' && (
            <LibraryScreen />
          )}
        </main>
      </div>

      {/* Reactive Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#030d19] border-t border-[#464554] flex items-center justify-around z-50 px-2 select-none">
        <button
          onClick={() => setCurrentScreen('compiler')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-16 py-1 ${
            currentScreen === 'compiler' ? 'text-[#c0c1ff]' : 'text-[#908fa0]'
          }`}
        >
          <Cpu className="h-[18px] w-[18px]" />
          <span className="text-[10px] font-label-caps font-bold">Compiler</span>
        </button>

        <button
          onClick={() => setCurrentScreen('schema')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-18 py-1 ${
            currentScreen === 'schema' ? 'text-[#c0c1ff]' : 'text-[#908fa0]'
          }`}
        >
          <Layers className="h-[18px] w-[18px]" />
          <span className="text-[10px] font-label-caps font-bold">Schema</span>
        </button>

        <button
          onClick={() => setCurrentScreen('metrics')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-16 py-1 ${
            currentScreen === 'metrics' ? 'text-[#c0c1ff]' : 'text-[#908fa0]'
          }`}
        >
          <Activity className="h-[18px] w-[18px]" />
          <span className="text-[10px] font-label-caps font-bold">Metrics</span>
        </button>

        <button
          onClick={() => setCurrentScreen('library')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-16 py-1 ${
            currentScreen === 'library' ? 'text-[#c0c1ff]' : 'text-[#908fa0]'
          }`}
        >
          <BookOpen className="h-[18px] w-[18px]" />
          <span className="text-[10px] font-label-caps font-bold">Library</span>
        </button>
      </nav>
    </div>
  );
}
