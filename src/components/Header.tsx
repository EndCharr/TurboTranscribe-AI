import React from 'react';
import { Sparkles, History, HelpCircle, AudioWaveform, Zap, CheckCircle2, Crown } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenSnapSave?: () => void;
  onOpenCommunity?: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenHelp,
  onOpenSnapSave,
  onOpenCommunity,
  historyCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <AudioWaveform className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                Turbo<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Transcribe</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </span>
              <button
                onClick={onOpenCommunity}
                className="hidden xl:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                title="Ver detalles de INFLUENCER FACTORY IA™"
              >
                INFLUENCER FACTORY IA™
              </button>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Desarrollado por <span className="text-indigo-300 font-medium">Academia Endcharr</span> · Comunidad <button onClick={onOpenCommunity} className="text-cyan-300 font-semibold hover:underline">INFLUENCER FACTORY IA™</button>
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenCommunity}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
            title="Conoce el programa oficial"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold">INFLUENCER FACTORY IA™</span>
          </button>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-medium">99.8% Exactitud Verbatim</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Link to Program Sales Page */}
          <a
            href="https://academia.endcharr.com/influencer-factory-ia/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-300 hover:from-amber-300 hover:to-cyan-200 rounded-lg shadow-lg shadow-amber-500/20 transform hover:scale-105 active:scale-95 transition-all"
            title="Conoce el programa oficial INFLUENCER FACTORY IA™"
          >
            <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span className="hidden sm:inline">🔥 Conoce el Programa ↗</span>
            <span className="sm:hidden">🔥 Programa ↗</span>
          </a>

          {onOpenCommunity && (
            <button
              onClick={onOpenCommunity}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 rounded-lg transition-colors"
              title="Programa Oficial INFLUENCER FACTORY IA™"
            >
              <span>Ver Programa</span>
            </button>
          )}

          {onOpenSnapSave && (
            <button
              onClick={onOpenSnapSave}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 rounded-lg transition-all shadow-md shadow-indigo-600/20"
              title="Extraer con motor SnapSave en la App"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">SnapSave App</span>
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Cómo copiar links y consejos"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Guía & Enlaces</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Historial</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
