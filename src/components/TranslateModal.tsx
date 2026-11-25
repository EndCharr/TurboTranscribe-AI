import React, { useState } from 'react';
import { X, Languages, Copy, Check, Sparkles } from 'lucide-react';

interface TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
}

const LANGUAGES = [
  'Inglés (English)',
  'Español',
  'Portugués (Português)',
  'Francés (Français)',
  'Alemán (Deutsch)',
  'Italiano',
  'Japonés (日本語)',
  'Chino Mandarín (中文)',
  'Árabe (العربية)',
  'Ruso (Русский)',
  'Hindi (हिन्दी)',
];

export const TranslateModal: React.FC<TranslateModalProps> = ({
  isOpen,
  onClose,
  originalText,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      setError('');
      const res = await fetch('/api/translate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          targetLanguage: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al traducir');
      }

      setTranslatedText(data.translatedText);
    } catch (err: any) {
      setError(err.message || 'Error en la traducción');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Traducir Guión con IA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap">
            Traducir al idioma:
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full sm:flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            {isTranslating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Traduciendo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Comenzar Traducción</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
            {error}
          </p>
        )}

        {/* Translation Output Box */}
        <div className="flex-1 overflow-y-auto min-h-[250px] p-4 bg-slate-950 border border-slate-800 rounded-xl">
          {translatedText ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-emerald-400">
                  Traducción completada ({selectedLanguage})
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar Traducción'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {translatedText}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
              <Languages className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
              <p>Selecciona un idioma y pulsa "Comenzar Traducción".</p>
              <p className="text-[11px] text-slate-600 mt-1">
                La IA preservará las marcas de tiempo y el tono original del video.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
