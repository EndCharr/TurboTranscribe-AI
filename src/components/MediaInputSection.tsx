import React, { useState, useRef } from 'react';
import {
  Link2,
  Upload,
  Sparkles,
  Clipboard,
  X,
  Play,
  Settings2,
  Languages,
  Users,
  FileCheck2,
  AlertCircle,
  Video,
  Music,
  Check,
  ExternalLink,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { SampleVideo } from '../types';

interface MediaInputSectionProps {
  onTranscribeUrl: (
    url: string,
    options: { cleanScript: boolean; speakerDiarization: boolean; language: string }
  ) => Promise<void>;
  onTranscribeFile: (
    file: File,
    options: { cleanScript: boolean; speakerDiarization: boolean; language: string }
  ) => Promise<void>;
  isLoading: boolean;
  loadingStep: string;
  samples: SampleVideo[];
  onOpenCommunity?: () => void;
}

export const MediaInputSection: React.FC<MediaInputSectionProps> = ({
  onTranscribeUrl,
  onTranscribeFile,
  isLoading,
  loadingStep,
  samples,
  onOpenCommunity,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'snapsave' | 'file' | 'samples'>('url');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // SnapSave in-tab extraction state
  const [snapUrl, setSnapUrl] = useState('');
  const [isSnapLoading, setIsSnapLoading] = useState(false);
  const [snapError, setSnapError] = useState('');
  const [snapData, setSnapData] = useState<{
    description?: string;
    preview?: string;
    media: { url: string; type: string; resolution?: string; thumbnail?: string }[];
  } | null>(null);

  // Options
  const [cleanScript, setCleanScript] = useState(false);
  const [speakerDiarization, setSpeakerDiarization] = useState(true);
  const [language, setLanguage] = useState('Automático');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Platform detector
  const getDetectedPlatform = (inputUrl: string) => {
    const val = inputUrl.toLowerCase();
    if (val.includes('tiktok.com')) return 'tiktok';
    if (val.includes('instagram.com')) return 'instagram';
    if (val.includes('facebook.com') || val.includes('fb.watch')) return 'facebook';
    if (val.includes('youtube.com') || val.includes('youtu.be')) return 'youtube';
    if (val.match(/\.(mp4|webm|mov|mp3|wav|m4a)/)) return 'direct';
    return null;
  };

  const detectedPlatform = getDetectedPlatform(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // In some iframe environments clipboard.readText requires permission
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onTranscribeUrl(url.trim(), { cleanScript, speakerDiarization, language });
  };

  const handleSnapExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!snapUrl.trim() || isSnapLoading) return;
    try {
      setIsSnapLoading(true);
      setSnapError('');
      setSnapData(null);

      const res = await fetch('/api/snapsave-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: snapUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo extraer mediante el motor SnapSave');
      }

      setSnapData(data.data);
    } catch (err: any) {
      setSnapError(
        err.message ||
          'SnapSave no pudo extraer el video automáticamente en la nube. Prueba subiendo el archivo en la pestaña "Subir Video / Audio".'
      );
    } finally {
      setIsSnapLoading(false);
    }
  };

  const handleFileSubmit = () => {
    if (!selectedFile || isLoading) return;
    onTranscribeFile(selectedFile, { cleanScript, speakerDiarization, language });
  };

  const handleSampleClick = (sample: SampleVideo) => {
    setUrl(sample.url);
    setActiveTab('url');
    onTranscribeUrl(sample.url, { cleanScript, speakerDiarization, language });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Intro hero banner */}
      <div className="text-center pt-8 pb-6">
        <button
          type="button"
          onClick={onOpenCommunity}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 border border-indigo-500/40 text-xs font-semibold mb-4 shadow-lg shadow-indigo-500/15 backdrop-blur-md cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
          title="Haz clic para ver el programa oficial"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="text-indigo-200">Desarrollado por Academia Endcharr</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300 font-extrabold tracking-wide">
            INFLUENCER FACTORY IA™ ↗
          </span>
        </button>
        <p className="text-xs text-indigo-300/80 font-medium tracking-wide uppercase mb-2">
          Herramienta Exclusiva para la Comunidad de INFLUENCER FACTORY IA™
        </p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <a
            href="https://academia.endcharr.com/influencer-factory-ia/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-md transform hover:scale-105 active:scale-95"
          >
            <span>🔥 Conoce el Programa ↗</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Transcribe Videos de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">
            TikTok, Instagram & Facebook
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          Pega el enlace de cualquier reel, post o video para obtener el guión exacto palabra por palabra, con marcas de tiempo, oradores y opción para descargar el video.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 pb-3 mb-5 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'url'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Enlace Social</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('snapsave');
              if (url && !snapUrl) setSnapUrl(url);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'snapsave'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/40'
                : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>SnapSave Integrado</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'file'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Video / Audio</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'samples'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ejemplos Populares</span>
          </button>
        </div>

        {/* TAB 1: URL INPUT */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1.5 shadow-inner">
                {/* Platform Badge Indicator */}
                <div className="pl-3 pr-2 flex items-center">
                  {detectedPlatform === 'tiktok' && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-neutral-900 text-cyan-400 border border-cyan-500/40">
                      TikTok
                    </span>
                  )}
                  {detectedPlatform === 'instagram' && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white">
                      Instagram Reel
                    </span>
                  )}
                  {detectedPlatform === 'facebook' && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white">
                      Facebook
                    </span>
                  )}
                  {detectedPlatform === 'youtube' && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-red-600 text-white">
                      YouTube
                    </span>
                  )}
                  {detectedPlatform === 'direct' && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white">
                      Video Directo
                    </span>
                  )}
                  {!detectedPlatform && (
                    <Link2 className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Pega el link aquí (tiktok.com/..., instagram.com/reel/..., fb.watch/... o .mp4)"
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm sm:text-base px-2 py-2 focus:outline-none focus:ring-0"
                />

                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors mr-1"
                  title="Pegar del portapapeles"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pegar</span>
                </button>
              </div>

              {/* Supported Platforms Tag Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 px-1 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Soporta:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">TikTok</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">Instagram Reels</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">Facebook Watch</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">MP4 / Audio</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>{isOptionsOpen ? 'Ocultar ajustes' : 'Ajustes avanzados'}</span>
                </button>
              </div>
            </div>

            {/* Advanced Transcription Options */}
            {isOptionsOpen && (
              <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
                {/* Language selection */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-indigo-400" />
                    Idioma
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Automático">Automático (Detectar)</option>
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Portugués">Portugués</option>
                    <option value="Francés">Francés</option>
                    <option value="Alemán">Alemán</option>
                    <option value="Italiano">Italiano</option>
                  </select>
                </div>

                {/* Clean script toggle */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    Modo de Transcripción
                  </label>
                  <div className="flex rounded-lg border border-slate-700 overflow-hidden bg-slate-900 p-0.5">
                    <button
                      type="button"
                      onClick={() => setCleanScript(false)}
                      className={`flex-1 py-1 rounded-md text-center transition-all ${
                        !cleanScript ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Exacta (Verbatim)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCleanScript(true)}
                      className={`flex-1 py-1 rounded-md text-center transition-all ${
                        cleanScript ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Guión Limpio
                    </button>
                  </div>
                </div>

                {/* Speaker diarization */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Diarización de Hablantes
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpeakerDiarization(!speakerDiarization)}
                    className={`w-full py-1.5 px-3 rounded-lg border flex items-center justify-between transition-colors ${
                      speakerDiarization
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-medium'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>{speakerDiarization ? 'Identificar Oradores' : 'Hablante Único'}</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all transform active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingStep || 'Transcribiendo con Turbo AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Transcribir Guión Completo</span>
                </>
              )}
            </button>

            {/* In-app helper notice */}
            <div className="pt-1 text-center">
              <p className="text-[11px] text-slate-400">
                ⚡ Extracción directa con motor SnapSave en la App. También puedes usar la pestaña{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('snapsave');
                    if (url) setSnapUrl(url);
                  }}
                  className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2"
                >
                  "SnapSave Integrado"
                </button>{' '}
                o{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                >
                  "Subir Video / Audio"
                </button>{' '}
                para procesar tu video al 100% en este entorno.
              </p>
            </div>
          </form>
        )}

        {/* TAB: SNAPSAVE STUDIO INTEGRADO */}
        {activeTab === 'snapsave' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  SS
                </div>
                <div>
                  <p className="font-bold text-white">Motor SnapSave™ 100% Integrado en la App</p>
                  <p className="text-[11px] text-slate-400">Extrae el video en alta definición sin salir de TurboTranscribe</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold hidden sm:inline-block">
                Sin publicidad externa
              </span>
            </div>

            <form onSubmit={handleSnapExtract} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={snapUrl}
                  onChange={(e) => setSnapUrl(e.target.value)}
                  placeholder="Pega el enlace de Facebook, Instagram o TikTok aquí..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-32 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={isSnapLoading || !snapUrl.trim()}
                  className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  {isSnapLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Extrayendo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extraer Video</span>
                    </>
                  )}
                </button>
              </div>

              {snapError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p>{snapError}</p>
                </div>
              )}

              {snapData && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {snapData.preview && (
                      <img
                        src={snapData.preview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-700"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white line-clamp-2">
                        {snapData.description || 'Video extraído con éxito por SnapSave'}
                      </p>
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {snapData.media.length} resolución(es) disponible(s)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-300">
                      Opciones disponibles para procesar en este entorno:
                    </p>
                    {snapData.media.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between gap-3 transition-colors"
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
                            type="button"
                            onClick={() => {
                              onTranscribeUrl(item.url, { cleanScript, speakerDiarization, language });
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs rounded-lg font-bold transition-all flex items-center gap-1 shadow-md"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Transcribir en App</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2: FILE UPLOAD */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.m4a"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                {selectedFile ? (
                  selectedFile.type.includes('audio') ? (
                    <Music className="w-6 h-6" />
                  ) : (
                    <Video className="w-6 h-6" />
                  )
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-white font-semibold text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Listo para procesar
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-2 text-xs text-rose-400 hover:underline"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium text-sm">
                    Haz clic para seleccionar o arrastra tu archivo aquí
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Formatos soportados: MP4, MOV, WEBM, MP3, WAV, M4A (hasta 60 MB)
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFileSubmit}
              disabled={isLoading || !selectedFile}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingStep || 'Procesando archivo...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Transcribir Archivo Subido</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: CURATED SAMPLES */}
        {activeTab === 'samples' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              ¿No tienes un enlace a mano? Haz clic en cualquiera de estos ejemplos para probar la transcripción completa de inmediato:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className="group relative bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-md flex flex-col"
                >
                  <div className="relative h-28 bg-slate-800 overflow-hidden">
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-white font-mono">
                      {sample.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                      {sample.platform}
                    </span>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                      {sample.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      {sample.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
