import React, { useState } from 'react';
import { X, Wand2, Copy, Check, Sparkles, Smartphone, Linkedin, Twitter, ListChecks } from 'lucide-react';

interface AiRepurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTranscript: string;
}

const TEMPLATES = [
  {
    id: 'reels_script',
    title: 'Guión para Reels / TikTok',
    desc: 'Formato de grabación con ganchos (Hooks), desarrollo y llamada a la acción.',
    icon: Smartphone,
  },
  {
    id: 'blog_post',
    title: 'Artículo para Blog / LinkedIn',
    desc: 'Post profesional con título atractivo, subtítulos H2 y aprendizajes clave.',
    icon: Linkedin,
  },
  {
    id: 'twitter_thread',
    title: 'Hilo Viral para X (Twitter)',
    desc: 'Secuencia de tweets concisos optimizados para retención y viralidad.',
    icon: Twitter,
  },
  {
    id: 'summary_bullet',
    title: 'Resumen Ejecutivo en Viñetas',
    desc: 'Los 5 conceptos más valiosos explicados de forma ultra concisa.',
    icon: ListChecks,
  },
];

export const AiRepurposeModal: React.FC<AiRepurposeModalProps> = ({
  isOpen,
  onClose,
  originalTranscript,
}) => {
  const [selectedFormat, setSelectedFormat] = useState(TEMPLATES[0].id);
  const [resultText, setResultText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTransform = async () => {
    try {
      setIsProcessing(true);
      setError('');
      const res = await fetch('/api/repurpose-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: originalTranscript,
          formatType: selectedFormat,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al transformar el guión');
      }

      setResultText(data.result);
    } catch (err: any) {
      setError(err.message || 'Error en la transformación');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Reescribir & Reutilizar Guión con IA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template choices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedFormat === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedFormat(tmpl.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight line-clamp-1">{tmpl.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleTransform}
            disabled={isProcessing}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generando versión...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transformar Contenido</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
            {error}
          </p>
        )}

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto min-h-[260px] p-4 bg-slate-950 border border-slate-800 rounded-xl">
          {resultText ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-emerald-400">
                  Formato generado listo para publicar
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {resultText}
              </p>

              {/* Creator Growth Callout */}
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-amber-300">👑</span>
                    ¿Quieres automatizar 30 guiones y videos virales al mes?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Aprende a clonar tu voz y crear avatares en <strong>INFLUENCER FACTORY IA™</strong> (Academia Endcharr).
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <a
                    href="https://academia.endcharr.com/influencer-factory-ia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[11px]"
                  >
                    Ver Temario
                  </a>
                  <a
                    href="https://pay.hotmart.com/A105884231Q?checkoutMode=10&bid=1792967606344"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-black text-xs whitespace-nowrap shadow-md"
                  >
                    Únete Ahora ↗
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
              <Wand2 className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
              <p>Elige un formato y haz clic en "Transformar Contenido".</p>
              <p className="text-[11px] text-slate-600 mt-1">
                La IA adaptará el lenguaje para el formato seleccionado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
