/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MediaInputSection } from './components/MediaInputSection';
import { TranscriptionView } from './components/TranscriptionView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TranslateModal } from './components/TranslateModal';
import { AiRepurposeModal } from './components/AiRepurposeModal';
import { HelpModal } from './components/HelpModal';
import { ProtectedLinkCard } from './components/ProtectedLinkCard';
import { SnapSaveModal } from './components/SnapSaveModal';
import { CommunityModal } from './components/CommunityModal';
import { GrowthBar } from './components/GrowthBar';
import { MediaInfo, TranscriptionResult, HistoryItem, SampleVideo } from './types';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [samples, setSamples] = useState<SampleVideo[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [protectedLinkData, setProtectedLinkData] = useState<{ platform: string; originalUrl: string } | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isRepurposeOpen, setIsRepurposeOpen] = useState(false);
  const [isSnapSaveOpen, setIsSnapSaveOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [snapSaveUrl, setSnapSaveUrl] = useState('');

  // Load history from localStorage and fetch samples on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('turbotranscribe_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // ignore parsing error
    }

    // Fetch sample videos from backend
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.samples) {
          setSamples(data.samples);
        }
      })
      .catch(() => {
        // Fallback default samples if server is cold starting
        setSamples([
          {
            id: 'sample-1',
            platform: 'tiktok',
            title: 'TikTok Viral: "3 Secretos de Productividad que Nadie te Dice"',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail:
              'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
            duration: '15s',
            author: '@creador_viral',
          },
          {
            id: 'sample-2',
            platform: 'instagram',
            title: 'Instagram Reel: "Cómo Grabar Videos Cinematográficos"',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            thumbnail:
              'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&auto=format&fit=crop&q=80',
            duration: '15s',
            author: '@fotografia_pro',
          },
        ]);
      });
  }, []);

  // Save history to localStorage
  const saveToHistory = (newMedia: MediaInfo, newTrans: TranscriptionResult) => {
    const newItem: HistoryItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      mediaInfo: newMedia,
      transcription: newTrans,
    };
    const updated = [newItem, ...history.slice(0, 19)];
    setHistory(updated);
    try {
      localStorage.setItem('turbotranscribe_history', JSON.stringify(updated));
    } catch {
      // storage limit handle
    }
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('turbotranscribe_history', JSON.stringify(updated));
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('turbotranscribe_history');
  };

  // Handle URL transcription
  const handleTranscribeUrl = async (
    url: string,
    options: { cleanScript: boolean; speakerDiarization: boolean; language: string }
  ) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setLoadingStep('1. Conectando con el enlace del video...');

      // Dynamic step interval for nice user feedback
      const timer1 = setTimeout(() => {
        setLoadingStep('2. Extrayendo pista de audio y video...');
      }, 1800);
      const timer2 = setTimeout(() => {
        setLoadingStep('3. Analizando con IA (transcripción verbatim y marcas de tiempo)...');
      }, 4200);

      const response = await fetch('/api/transcribe-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          cleanScript: options.cleanScript,
          speakerDiarization: options.speakerDiarization,
          language: options.language,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isProtected) {
          setProtectedLinkData({
            platform: data.platform || 'video',
            originalUrl: url,
          });
          return;
        }
        throw new Error(data.message || data.error || 'No se pudo transcribir el enlace proporcionado.');
      }

      setProtectedLinkData(null);
      setMediaInfo(data.mediaInfo);
      setTranscription(data.transcription);
      saveToHistory(data.mediaInfo, data.transcription);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(
        err.message ||
          'Ocurrió un error al procesar el enlace. Si la publicación es privada, prueba descargándola y subiendo el archivo directamente en la pestaña "Subir Video".'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Handle File transcription
  const handleTranscribeFile = async (
    file: File,
    options: { cleanScript: boolean; speakerDiarization: boolean; language: string }
  ) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setLoadingStep('1. Subiendo y preparando archivo multimedia...');

      const formData = new FormData();
      formData.append('mediaFile', file);
      formData.append('cleanScript', String(options.cleanScript));
      formData.append('speakerDiarization', String(options.speakerDiarization));
      formData.append('language', options.language);

      const timer = setTimeout(() => {
        setLoadingStep('2. Transcribiendo minuciosamente con IA (Gemini 3.8 Flash)...');
      }, 2500);

      const response = await fetch('/api/transcribe-file', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(timer);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar el archivo');
      }

      setMediaInfo(data.mediaInfo);
      setTranscription(data.transcription);
      saveToHistory(data.mediaInfo, data.transcription);
    } catch (err: any) {
      console.error('File transcription error:', err);
      setErrorMessage(err.message || 'Error al transcribir el archivo.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Growth & Community Bar */}
      <GrowthBar onOpenModal={() => setIsCommunityOpen(true)} />

      {/* Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onOpenSnapSave={() => {
          setSnapSaveUrl('');
          setIsSnapSaveOpen(true);
        }}
        historyCount={history.length}
      />

      <main className="flex-1 pb-16">
        {/* Error message alert */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Aviso del Sistema</p>
                <p className="mt-0.5 text-rose-300/90 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-white p-1"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Protected link assistant card */}
        {protectedLinkData && (
          <div className="max-w-4xl mx-auto px-4">
            <ProtectedLinkCard
              platform={protectedLinkData.platform}
              originalUrl={protectedLinkData.originalUrl}
              onFileSelected={(file) => {
                setProtectedLinkData(null);
                handleTranscribeFile(file, { cleanScript: false, speakerDiarization: true, language: 'Automático' });
              }}
              onOpenSnapSave={() => {
                setSnapSaveUrl(protectedLinkData.originalUrl);
                setIsSnapSaveOpen(true);
              }}
              onClose={() => setProtectedLinkData(null)}
            />
          </div>
        )}

        {/* Input section (always visible, or simplified when results are shown) */}
        <div className="pt-2">
          <MediaInputSection
            onTranscribeUrl={handleTranscribeUrl}
            onTranscribeFile={handleTranscribeFile}
            isLoading={isLoading}
            loadingStep={loadingStep}
            samples={samples}
            onOpenCommunity={() => setIsCommunityOpen(true)}
          />
        </div>

        {/* Results Workspace */}
        {transcription && mediaInfo && (
          <div className="mt-8">
            <TranscriptionView
              mediaInfo={mediaInfo}
              transcription={transcription}
              onOpenTranslate={() => setIsTranslateOpen(true)}
              onOpenRepurpose={() => setIsRepurposeOpen(true)}
              onOpenCommunity={() => setIsCommunityOpen(true)}
              onUpdateTranscription={(updated) => setTranscription(updated)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300 text-sm">
            TurboTranscribe AI · Desarrollado por{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-bold">
              Academia Endcharr
            </span>
          </p>
          <p className="text-cyan-400 font-medium">
            Creado especialmente para la comunidad de{' '}
            <button
              onClick={() => setIsCommunityOpen(true)}
              className="tracking-wide text-white hover:text-cyan-300 font-bold underline underline-offset-2"
            >
              INFLUENCER FACTORY IA™
            </button>
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://academia.endcharr.com/influencer-factory-ia/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-pink-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-xs transition-all shadow-md shadow-cyan-500/20 transform hover:scale-105 active:scale-95"
            >
              🔥 Conoce el Programa ↗
            </a>
            <button
              onClick={() => setIsCommunityOpen(true)}
              className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
            >
              👑 Ver Beneficios de la Comunidad
            </button>
          </div>
          <p className="text-[11px] text-slate-600 pt-1">
            Transcriptor de guiones de alta precisión para creadores de contenido de TikTok, Instagram Reels, Facebook y Multimedia.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setMediaInfo(item.mediaInfo);
          setTranscription(item.transcription);
        }}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      <TranslateModal
        isOpen={isTranslateOpen}
        onClose={() => setIsTranslateOpen(false)}
        originalText={transcription?.cleanScript || transcription?.verbatim || ''}
      />

      <AiRepurposeModal
        isOpen={isRepurposeOpen}
        onClose={() => setIsRepurposeOpen(false)}
        originalTranscript={transcription?.cleanScript || transcription?.verbatim || ''}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SnapSaveModal
        isOpen={isSnapSaveOpen}
        onClose={() => setIsSnapSaveOpen(false)}
        initialUrl={snapSaveUrl}
        onTranscribeDirectUrl={(directUrl) => {
          setIsSnapSaveOpen(false);
          setProtectedLinkData(null);
          handleTranscribeUrl(directUrl, { cleanScript: false, speakerDiarization: true, language: 'Automático' });
        }}
      />

      {/* Community & Program Modal */}
      <CommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
    </div>
  );
}
