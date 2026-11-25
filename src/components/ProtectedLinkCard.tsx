import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, Copy, Check } from 'lucide-react';

interface ProtectedLinkCardProps {
  platform: string;
  originalUrl: string;
  onFileSelected: (file: File) => void;
  onClose: () => void;
  onOpenSnapSave?: () => void;
}

export const ProtectedLinkCard: React.FC<ProtectedLinkCardProps> = ({
  platform,
  originalUrl,
  onFileSelected,
  onClose,
  onOpenSnapSave,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(originalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Protección Anti-Bot de {platform.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-300">
              Para garantizar que transcribamos <strong className="text-cyan-300">TU video real</strong> (y no información equivocada), puedes usar el motor SnapSave integrado:
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
        >
          ✕
        </button>
      </div>

      {/* 2 Simple Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Step 1: Open SnapSave in App */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Opción 1: En la App
              </span>
              <button
                onClick={handleCopyUrl}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? '¡Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <h4 className="text-xs font-bold text-white">Motor SnapSave Integrado</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Extrae el enlace directo de video sin salir de esta aplicación.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            {onOpenSnapSave && (
              <button
                type="button"
                onClick={onOpenSnapSave}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>⚡ Extraer con Motor SnapSave en la App</span>
              </button>
            )}
            <p className="text-[10px] text-center text-slate-500">
              Procesa el video directamente dentro de TurboTranscribe sin páginas externas.
            </p>
          </div>
        </div>

        {/* Step 2: Drop file here */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-700 hover:border-indigo-400 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.m4a"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileSelected(e.target.files[0]);
              }
            }}
          />

          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mb-2">
            Paso 2
          </span>
          <Upload className="w-6 h-6 text-cyan-400 mb-1.5" />
          <p className="text-xs font-bold text-white">
            Suelta el video descargado aquí
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            O haz clic para seleccionarlo de tus archivos (.mp4, .mov, etc.)
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Al subir el video garantizamos 99.8% de precisión en TU guión real.
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white underline"
        >
          Cerrar asistente
        </button>
      </div>
    </div>
  );
};
