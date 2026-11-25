import React from 'react';
import { Crown, Sparkles, ArrowRight, ExternalLink, Flame } from 'lucide-react';

interface CommunityBannerCardProps {
  onOpenModal: () => void;
}

export const CommunityBannerCard: React.FC<CommunityBannerCardProps> = ({ onOpenModal }) => {
  const checkoutUrl = 'https://pay.hotmart.com/A105884231Q?checkoutMode=10&bid=1792967606344';
  const salesPageUrl = 'https://academia.endcharr.com/influencer-factory-ia/';

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border border-cyan-500/30 shadow-2xl my-6">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Content */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-500/30">
              <Crown className="w-3 h-3 text-amber-400" />
              Programa Oficial · Academia Endcharr
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">|</span>
            <span className="text-[11px] font-bold text-cyan-300">INFLUENCER FACTORY IA™</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            ¿Te sirvió este guión? Esto es solo el 5% de lo que aprenderás
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Aprende a clonar tu voz, crear <strong>avatares hiperrealistas que graban por ti</strong> y automatizar 30 videos virales al mes para monetizar en TikTok, Instagram y Shorts.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenModal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Ver Beneficios</span>
          </button>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-xs tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
            <span>Únete Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
