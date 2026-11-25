import React, { useState } from 'react';
import { Crown, Sparkles, ArrowRight, X, Flame } from 'lucide-react';

interface GrowthBarProps {
  onOpenModal: () => void;
}

export const GrowthBar: React.FC<GrowthBarProps> = ({ onOpenModal }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const checkoutUrl = 'https://pay.hotmart.com/A105884231Q?checkoutMode=10&bid=1792967606344';

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-slate-900 border-b border-cyan-500/30 text-white px-3 sm:px-6 py-2 relative z-50 text-xs shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left message */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex-shrink-0 animate-pulse">
            <Crown className="w-3 h-3 text-amber-400" />
          </span>
          <p className="truncate text-slate-200">
            <span className="text-cyan-300 font-bold">INFLUENCER FACTORY IA™</span>
            <span className="text-slate-400 hidden md:inline">
              {' '}— El programa definitivo de Academia Endcharr para viralizar y monetizar con IA.
            </span>
          </p>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenModal}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white underline underline-offset-2 font-medium"
          >
            Saber más
          </button>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <Flame className="w-3 h-3 fill-slate-950" />
            <span>Únete Ahora</span>
            <ArrowRight className="w-3 h-3" />
          </a>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors ml-1"
            title="Ocultar barra"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
