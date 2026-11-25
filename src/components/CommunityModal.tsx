import React from 'react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Crown,
  ExternalLink,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
  Video,
  Users,
} from 'lucide-react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const salesPageUrl = 'https://academia.endcharr.com/influencer-factory-ia/';
  const checkoutUrl = 'https://pay.hotmart.com/A105884231Q?checkoutMode=10&bid=1792967606344';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto relative">
        {/* Glow decorative gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white flex-shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30">
                  Academia Endcharr Presenta
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                INFLUENCER FACTORY IA™
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-xs shadow-md shadow-cyan-500/20 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Únete Ahora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Hook */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 relative z-10 space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-200">
            ¿Quieres dejar de perder horas creando videos y montar una factoría automatizada de contenido viral?
          </p>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            Esta herramienta de transcripción es solo el <strong>5% del arsenal</strong>. En el programa oficial te enseñamos a clonar tu presencia, automatizar la creación y monetizar tu marca con IA de última generación.
          </p>
          <div className="pt-1">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-md transition-all transform hover:scale-105"
            >
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>Únete Ahora al Programa</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 4 Pillars of the program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Video className="w-4 h-4 text-cyan-400" />
              <span>Avatares & Clonación de Voz</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Crea clones digitales hiperrealistas que graben videos profesionales por ti sin que tengas que ponerte frente a la cámara.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-colors space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Guiones Virales & Ganchos</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Aprende las fórmulas exactas para retener a la audiencia en los primeros 3 segundos y viralizar en TikTok, Instagram y Shorts.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Producción 10x Acelerada</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Flujos automáticos de trabajo para convertir 1 sola idea en 30 videos mensuales listos para publicar y programar.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Comunidad VIP & Monetización</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Accede a la red de creadores de Academia Endcharr, plantillas exclusivas y estrategias para convertir seguidores en clientes.
            </p>
          </div>
        </div>

        {/* Security & guarantee note */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            Garantía de Satisfacción 100%
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Users className="w-4 h-4 text-indigo-400" />
            Comunidad Privada de Creadores
          </span>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2 pt-2 border-t border-slate-800 relative z-10">
          {/* Primary "Únete Ahora" Checkout Button */}
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-center group cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
            <span>ÚNETE AHORA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Secondary Sales Page Link */}
          <a
            href={salesPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-center"
          >
            <span>Ver Toda la Información, Temario y Beneficios en la Web</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
