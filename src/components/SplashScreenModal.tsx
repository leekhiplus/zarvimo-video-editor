import React, { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenModalProps {
  onDismiss: () => void;
}

export const SplashScreenModal: React.FC<SplashScreenModalProps> = ({ onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B11] p-4 select-none animate-fadeIn">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Pulsing Neon Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-[#0F1422] border-2 border-[#00E5FF] flex items-center justify-center shadow-[0_0_35px_rgba(0,229,255,0.4)] animate-pulse">
            <span className="text-5xl font-black text-[#00E5FF] tracking-wider">Z</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF007F] shadow-[0_0_10px_#FF007F]" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-[#7C3AED] shadow-[0_0_10px_#7C3AED]" />
        </div>

        <h1 className="text-3xl font-black tracking-widest text-white mb-1">
          ZARVIMO
        </h1>
        <p className="text-xs font-bold tracking-widest text-[#00E5FF] uppercase mb-4">
          Next-Gen Video Studio
        </p>

        <p className="text-xs text-slate-400 font-mono mb-8">
          Phase 1 Engine · Media3 Transformer
        </p>

        <button
          onClick={onDismiss}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#141A29] hover:bg-[#1E2638] border border-[#232B3E] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#00E5FF]" />
        </button>
      </div>
    </div>
  );
};
