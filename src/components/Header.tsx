import React from 'react';
import { Cpu, Radio, Shield, Sparkles } from 'lucide-react';
import { Screen } from '../types';

interface HeaderProps {
  currentScreen: Screen;
  isCompiling: boolean;
  statusText: string;
}

export default function Header({ currentScreen, isCompiling, statusText }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-6 lg:px-8 h-16 bg-[#030d19]/80 backdrop-blur-md border-b border-[#1c2b3c] select-none">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6265f0]/20 to-[#c0c1ff]/10 border border-[#8083ff]/30 shadow-[0_0_15px_rgba(128,131,255,0.15)] overflow-hidden">
          <Cpu className="h-4 w-4 text-[#c0c1ff] animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-display-md text-base font-extrabold tracking-tight text-white mb-0">
              SYNAPSE
            </span>
            <span className="text-[9px] bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] text-[#0d0096] font-extrabold px-1.5 py-0.5 rounded font-sans tracking-widest uppercase">
              IR.V4
            </span>
          </div>
          <span className="text-[10px] text-[#908fa0] uppercase tracking-widest font-sans font-bold -mt-0.5">Autonomous Compiler</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Connection status tag with premium glowing effects */}
        <div className="flex items-center bg-[#071424] px-3.5 py-1.5 rounded-full gap-2.5 border border-[#1e2d3d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)] font-sans">
          <div className="relative flex items-center justify-center">
            <span className={`absolute w-2 h-2 rounded-full ${
              isCompiling ? 'bg-amber-400 opacity-75 animate-ping' : 'bg-emerald-400 opacity-75 animate-ping'
            }`} />
            <span className={`w-1.5 h-1.5 rounded-full ${
              isCompiling ? 'bg-amber-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
            }`} />
          </div>
          <span className="font-label-caps text-[10px] text-[#c7c4d7] tracking-wider leading-none">
            {isCompiling ? 'pipeline_compiling_ast' : statusText.toLowerCase()}
          </span>
        </div>

        {/* Action Button: Radio with radar ping */}
        <button className="relative text-[#c0c1ff] hover:bg-[#122131] border border-[#1c2b3c] hover:border-[#8083ff]/40 p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer">
          <Radio className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
