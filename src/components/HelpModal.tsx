import React from 'react';
import { X, HelpCircle, CheckCircle2, AlertCircle, Share2, Download, Copy, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-slate-300 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Guía de Uso & Consejos</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: How to copy links */}
        <div className="space-y-3">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
            <Share2 className="w-4 h-4 text-cyan-400" />
            ¿Cómo copiar el enlace en cada red social?
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block font-semibold text-xs">📱 TikTok</strong>
              <p className="text-xs text-slate-400">
                En la app o web, pulsa el botón de <strong>Compartir</strong> (flecha) y luego <strong>"Copiar enlace"</strong>. Pégalo directamente en la barra de búsqueda.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block font-semibold text-xs">📸 Instagram (Reels y Posts)</strong>
              <p className="text-xs text-slate-400">
                Abre el Reel, toca el icono de <strong>Compartir</strong> (el avioncito de papel) o los tres puntos <strong>(···)</strong> y selecciona <strong>"Copiar enlace"</strong>.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block font-semibold text-xs">👥 Facebook (Watch y Reels)</strong>
              <p className="text-xs text-slate-400">
                Toca en <strong>Compartir</strong> y luego en <strong>"Copiar enlace"</strong> (o copia la URL de la barra del navegador si estás en PC).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Download & Export features */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
            <Download className="w-4 h-4 text-emerald-400" />
            Descarga de Video y Exportación
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Descargar Video:</strong> El botón superior descarga el video en formato MP4 directamente a tu dispositivo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Subtítulos SRT / VTT:</strong> Puedes exportar el archivo listo para importar en CapCut, Adobe Premiere o DaVinci Resolve.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Subida Directa de Archivos:</strong> Si el enlace requiere login privado, puedes subir el video o nota de voz (.mp4, .mp3, .wav) en la pestaña "Subir Video / Audio".
              </span>
            </li>
          </ul>
        </div>

        {/* Section 3: AI tips */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-xl space-y-2">
          <h5 className="font-semibold text-xs text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Academia Endcharr · INFLUENCER FACTORY IA™
          </h5>
          <p className="text-xs text-slate-300">
            Esta herramienta está diseñada con tecnología multimodal de inteligencia artificial para creadores de la comunidad de INFLUENCER FACTORY IA™, permitiendo extraer guiones exactos, ganchos virales y subtítulos listos para monetizar.
          </p>
          <div className="pt-1">
            <a
              href="https://academia.endcharr.com/influencer-factory-ia/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 text-xs font-black transition-all shadow-md transform hover:scale-105 active:scale-95"
            >
              <span>🔥 Conoce el Programa ↗</span>
            </a>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
