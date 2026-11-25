import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  FileText,
  Languages,
  Wand2,
  Search,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  ExternalLink,
  Sliders,
  ChevronDown,
  Hash,
  Lightbulb,
  CheckCircle2,
  Clock,
  Mic,
  Tv,
} from 'lucide-react';
import { TranscriptionResult, MediaInfo, DialogueSegment } from '../types';
import { CommunityBannerCard } from './CommunityBannerCard';

interface TranscriptionViewProps {
  mediaInfo: MediaInfo;
  transcription: TranscriptionResult;
  onOpenTranslate: () => void;
  onOpenRepurpose: () => void;
  onUpdateTranscription: (updated: TranscriptionResult) => void;
  onOpenCommunity?: () => void;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  mediaInfo,
  transcription,
  onOpenTranslate,
  onOpenRepurpose,
  onUpdateTranscription,
  onOpenCommunity,
}) => {
  const [activeTab, setActiveTab] = useState<'timestamps' | 'clean' | 'creator' | 'srt' | 'analysis'>('timestamps');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse time "MM:SS" or "HH:MM:SS" into seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const jumpToTime = (timeStr: string) => {
    const seconds = parseTimeToSeconds(timeStr);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2500);
    setIsCopyMenuOpen(false);
  };

  // Download media file (.mp4)
  const handleDownloadVideo = () => {
    const safeTitle = (transcription.title || 'video_turbotranscribe')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `${safeTitle}.mp4`;
    const downloadUrl = `/api/proxy-download?url=${encodeURIComponent(
      mediaInfo.directVideoUrl
    )}&filename=${encodeURIComponent(filename)}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export text files
  const handleExportFile = (type: 'txt' | 'srt' | 'vtt' | 'md') => {
    let content = '';
    let mimeType = 'text/plain';
    const safeTitle = (transcription.title || 'transcripcion')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    if (type === 'txt') {
      content = `TITULO: ${transcription.title}\nIDIOMA: ${transcription.detectedLanguage}\n\n=== GUION COMPLETO ===\n\n${transcription.cleanScript || transcription.verbatim}`;
    } else if (type === 'srt') {
      content = transcription.srtContent;
    } else if (type === 'vtt') {
      content = transcription.vttContent;
    } else if (type === 'md') {
      content = `# ${transcription.title}\n\n**Idioma:** ${transcription.detectedLanguage} | **Palabras:** ${transcription.wordCount}\n\n## Resumen\n${transcription.summary}\n\n## Guión\n${transcription.cleanScript}\n\n## Marcas de Tiempo\n${transcription.dialogueSegments
        .map((s) => `- **[${s.start}] ${s.speaker}:** ${s.text}`)
        .join('\n')}`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  // Editable segment text handler
  const handleSegmentEdit = (index: number, newText: string) => {
    const updatedSegments = [...transcription.dialogueSegments];
    updatedSegments[index] = { ...updatedSegments[index], text: newText };
    onUpdateTranscription({
      ...transcription,
      dialogueSegments: updatedSegments,
    });
  };

  // Helper for highlighted search text
  const highlightSearch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-300 text-slate-900 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Count search occurrences
  const searchMatchesCount = searchQuery.trim()
    ? (
        transcription.verbatim.toLowerCase().match(
          new RegExp(searchQuery.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')
        ) || []
      ).length
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top summary banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {mediaInfo.sourcePlatform}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Precisión estimada: {transcription.confidenceScore || 99.6}%
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-xs text-slate-400">
                Idioma: <strong className="text-slate-200">{transcription.detectedLanguage}</strong>
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {transcription.wordCount} palabras
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {transcription.title || 'Guión Transcrito'}
            </h2>
            {mediaInfo.author && (
              <p className="text-xs text-slate-400 font-mono">
                Por: <span className="text-indigo-300">{mediaInfo.author}</span>
              </p>
            )}
          </div>

          {/* Quick Primary Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* COPY BUTTON (Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCopyMenuOpen(!isCopyMenuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95"
              >
                {copiedType ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Guión</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </>
                )}
              </button>

              {isCopyMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() =>
                      handleCopy(transcription.cleanScript || transcription.verbatim, 'Guión')
                    }
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Copiar Guión Limpio</span>
                    <span className="text-[10px] text-slate-500 font-mono">Recomendado</span>
                  </button>
                  <button
                    onClick={() => handleCopy(transcription.verbatim, 'Verbatim')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    Copiar Exacto (Verbatim)
                  </button>
                  <button
                    onClick={() => {
                      const withTimestamps = transcription.dialogueSegments
                        .map((s) => `[${s.start}] ${s.speaker}: ${s.text}`)
                        .join('\n');
                      handleCopy(withTimestamps, 'Con Tiempos');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    Copiar con Tiempos [MM:SS]
                  </button>
                  <button
                    onClick={() => handleCopy(transcription.srtContent, 'SRT')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    Copiar Subtítulos SRT
                  </button>
                </div>
              )}
            </div>

            {/* DOWNLOAD VIDEO BUTTON */}
            <button
              type="button"
              onClick={handleDownloadVideo}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-md"
              title="Descargar archivo de video MP4"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Descargar Video</span>
            </button>

            {/* EXPORT OPTIONS (TXT, SRT, VTT, MD) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Exportar</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleExportFile('txt')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Texto Plano (.txt)</span>
                    <span className="text-[10px] text-slate-500 font-mono">TXT</span>
                  </button>
                  <button
                    onClick={() => handleExportFile('srt')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Subtítulos (.srt)</span>
                    <span className="text-[10px] text-slate-500 font-mono">SRT</span>
                  </button>
                  <button
                    onClick={() => handleExportFile('vtt')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>WebVTT (.vtt)</span>
                    <span className="text-[10px] text-slate-500 font-mono">VTT</span>
                  </button>
                  <button
                    onClick={() => handleExportFile('md')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Markdown Guión (.md)</span>
                    <span className="text-[10px] text-slate-500 font-mono">MD</span>
                  </button>
                </div>
              )}
            </div>

            {/* TRANSLATE WITH AI */}
            <button
              type="button"
              onClick={onOpenTranslate}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Traducir guión a otro idioma con IA"
            >
              <Languages className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Traducir</span>
            </button>

            {/* REPURPOSE WITH AI */}
            <button
              type="button"
              onClick={onOpenRepurpose}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition-all"
              title="Transformar a formato TikTok/Reels, LinkedIn o Twitter"
            >
              <Wand2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Reescribir IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Player on left (or top), Transcript Workspace on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Media Player & Live Sync (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg sticky top-20">
            {/* Video Player */}
            <div className="relative aspect-[9/16] sm:aspect-video lg:aspect-[9/16] max-h-[460px] bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={mediaInfo.directVideoUrl}
                playsInline
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Big overlay play button when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </button>
              )}
            </div>

            {/* Custom Controls Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-white font-semibold">
                  {Math.floor(currentTime / 60)}:
                  {String(Math.floor(currentTime % 60)).padStart(2, '0')}
                </span>
                <span>
                  {Math.floor(duration / 60)}:
                  {String(Math.floor(duration % 60)).padStart(2, '0')}
                </span>
              </div>

              {/* Scrubber progress */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) {
                    videoRef.current.currentTime = val;
                  }
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => changeSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded ${
                        playbackSpeed === spd
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timestamps Click Tip */}
            <div className="p-2.5 bg-indigo-500/10 border-t border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>Haz clic en cualquier marca de tiempo [MM:SS] del guión para saltar el video directamente.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Transcript Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[550px]">
            {/* View navigation tabs & Search bar */}
            <div className="border-b border-slate-800 bg-slate-950/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('timestamps')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'timestamps'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  ⏱️ Guión con Tiempos
                </button>
                <button
                  onClick={() => setActiveTab('clean')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'clean'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  📄 Texto Continuo
                </button>
                <button
                  onClick={() => setActiveTab('creator')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'creator'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  🎬 Modo Reels/Hook
                </button>
                <button
                  onClick={() => setActiveTab('srt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'srt'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  💬 Subtítulos (SRT)
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'analysis'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  💡 Puntos & Ganchos
                </button>
              </div>

              {/* Search input in transcript */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en el guión..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-12 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <span className="absolute right-2 top-2 text-[10px] text-amber-400 font-mono">
                    {searchMatchesCount} hit{searchMatchesCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-h-[600px] space-y-4">
              {/* TAB 1: INTERACTIVE TIMESTAMPS */}
              {activeTab === 'timestamps' && (
                <div className="space-y-3">
                  {transcription.dialogueSegments.map((segment, index) => {
                    const segmentSec = parseTimeToSeconds(segment.start);
                    const isActive =
                      currentTime >= segmentSec &&
                      currentTime <= parseTimeToSeconds(segment.end);

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {/* Timestamp clickable badge */}
                            <button
                              onClick={() => jumpToTime(segment.start)}
                              className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1"
                              title="Reproducir desde este segundo"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{segment.start}</span>
                            </button>

                            {/* Speaker badge */}
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                              <Mic className="w-3 h-3 text-cyan-400" />
                              {segment.speaker}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(segment.text, `Línea ${index + 1}`)}
                            className="text-slate-500 hover:text-slate-300 p-1 rounded"
                            title="Copiar solo esta frase"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Editable transcript text */}
                        <p
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleSegmentEdit(index, e.currentTarget.textContent || '')
                          }
                          className="text-sm text-slate-200 leading-relaxed outline-none focus:bg-slate-900 focus:p-1 focus:rounded cursor-text"
                        >
                          {highlightSearch(segment.text)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: CLEAN TEXT / PARAGRAPHS */}
              {activeTab === 'clean' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">
                      Formato de texto continuo optimizado para artículos, blogs o lectura fluida.
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(transcription.cleanScript || transcription.verbatim, 'Texto')
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Párrafos</span>
                    </button>
                  </div>
                  <div className="text-sm sm:text-base text-slate-200 leading-loose space-y-4 whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                    {highlightSearch(transcription.cleanScript || transcription.verbatim)}
                  </div>
                </div>
              )}

              {/* TAB 3: CREATOR / REELS SCRIPT MODE */}
              {activeTab === 'creator' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Tv className="w-3.5 h-3.5" />
                      Estructura de Guión de Video Corto (Reels / TikTok)
                    </h4>
                    <p className="text-xs text-slate-300">
                      Desglose automático para creadores: Gancho de 3 segundos, desarrollo y cierre.
                    </p>
                  </div>

                  {/* Hook segment */}
                  <div className="bg-slate-950/50 border border-amber-500/40 rounded-xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🔥 Gancho de Entrada (Hook 0-3 segundos)
                    </span>
                    <p className="text-sm text-slate-200 font-medium mt-2">
                      {transcription.viralHooks?.[0] || transcription.dialogueSegments[0]?.text || ''}
                    </p>
                  </div>

                  {/* Body segment */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      💡 Cuerpo y Desarrollo del Contenido
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed mt-2 whitespace-pre-line">
                      {transcription.cleanScript}
                    </p>
                  </div>

                  {/* Suggested CTA */}
                  <div className="bg-slate-950/50 border border-emerald-500/40 rounded-xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🚀 Llamada a la Acción (CTA)
                    </span>
                    <p className="text-sm text-slate-200 mt-2">
                      {transcription.dialogueSegments[transcription.dialogueSegments.length - 1]?.text ||
                        '¡Guarda este video y compártelo con alguien que lo necesite!'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: SUBTITLES (SRT) */}
              {activeTab === 'srt' && (
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                    <p className="text-xs text-slate-400">
                      Formato universal de subtítulos compatible con Premiere Pro, CapCut, DaVinci y Final Cut.
                    </p>
                    <button
                      onClick={() => handleCopy(transcription.srtContent, 'SRT')}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SRT</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {transcription.srtContent}
                  </pre>
                </div>
              )}

              {/* TAB 5: ANALYSIS & VIRAL HOOKS */}
              {activeTab === 'analysis' && (
                <div className="space-y-5">
                  {/* Executive Summary */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Resumen Ejecutivo del Video
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {transcription.summary}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  {transcription.keyTakeaways?.length > 0 && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Puntos Clave y Aprendizajes
                      </h4>
                      <ul className="space-y-2">
                        {transcription.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Viral Hooks */}
                  {transcription.viralHooks?.length > 0 && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        Ganchos Detectados / Sugeridos
                      </h4>
                      <div className="space-y-2">
                        {transcription.viralHooks.map((hook, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 flex items-center justify-between"
                          >
                            <span>"{hook}"</span>
                            <button
                              onClick={() => handleCopy(hook, 'Gancho')}
                              className="text-amber-400 hover:text-white p-1"
                              title="Copiar gancho"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {transcription.suggestedHashtags?.length > 0 && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-cyan-400" />
                          Hashtags Recomendados
                        </h4>
                        <button
                          onClick={() =>
                            handleCopy(transcription.suggestedHashtags.join(' '), 'Hashtags')
                          }
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar todos</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {transcription.suggestedHashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-cyan-300 font-mono"
                          >
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community & Program Official Banner Card */}
      <CommunityBannerCard onOpenModal={onOpenCommunity || (() => {})} />
    </div>
  );
};
