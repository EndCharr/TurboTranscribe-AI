import React, { useState } from 'react';
import { X, Sparkles, Download, Play, CheckCircle2, AlertCircle, ExternalLink, Link2, ArrowRight } from 'lucide-react';

interface SnapSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  onTranscribeDirectUrl: (directUrl: string, title?: string) => void;
}

interface SnapSaveMedia {
  url: string;
  type: string;
  resolution?: string;
  thumbnail?: string;
}

export const SnapSaveModal: React.FC<SnapSaveModalProps> = ({
  isOpen,
  onClose,
  initialUrl = '',
  onTranscribeDirectUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<{
    description?: string;
    preview?: string;
    media: SnapSaveMedia[];
  } | null>(null);

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!inputUrl.trim()) return;
    try {
      setIsLoading(true);
      setError('');
      setExtractedData(null);

      const res = await fetch('/api/snapsave-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo extraer mediante SnapSave');
      }

      setExtractedData(data.data);
    } catch (err: any) {
      setError(
        err.message ||
          'SnapSave no pudo extraer el video automáticamente. Prueba con otro enlace o usa la pestaña de subida directa.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMedia = (mediaItem: SnapSaveMedia) => {
    onTranscribeDirectUrl(mediaItem.url, extractedData?.description);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              SS
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Motor SnapSave™ Integrado en la App
              </h3>
              <p className="text-[11px] text-slate-400">
                Extrae videos de Facebook, Instagram y TikTok directamente en este entorno
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Input Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Pega el link de Facebook, Instagram o TikTok..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleExtract}
              disabled={isLoading || !inputUrl.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extrayendo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extraer Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">{error}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Tip: Si el enlace está protegido por la red social, puedes procesarlo directamente soltando el archivo en la pestaña "Subir Video / Audio".
              </p>
            </div>
          </div>
        )}

        {/* Results section */}
        <div className="flex-1 overflow-y-auto min-h-[220px] p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          {extractedData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {extractedData.preview && (
                  <img
                    src={extractedData.preview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-700"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold text-white line-clamp-2">
                    {extractedData.description || 'Video extraído con éxito por SnapSave'}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {extractedData.media.length} resolución(es) lista(s) para transcribir
                  </p>
                </div>
              </div>

              {/* Media Resolutions List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">
                  Selecciona la calidad para procesar o descargar:
                </p>
                {extractedData.media.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-white">
                        {item.resolution || `Video Calidad ${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                        Formato: {item.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/proxy-download?url=${encodeURIComponent(item.url)}&filename=video_snapsave_${idx + 1}.mp4`}
                        download={`video_snapsave_${idx + 1}.mp4`}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                        title="Descargar directamente este archivo a tu equipo"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Bajar MP4</span>
                      </a>
                      <button
                        onClick={() => handleSelectMedia(item)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-bold transition-all flex items-center gap-1 shadow-md"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Transcribir en App</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8 space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                <Link2 className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-300">
                Pega cualquier enlace de video arriba y haz clic en "Extraer Video"
              </p>
              <p className="text-[11px] text-slate-500 text-center max-w-md">
                El motor SnapSave analizará el enlace internamente para obtener el archivo MP4 y transcribirlo automáticamente dentro de TurboTranscribe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
