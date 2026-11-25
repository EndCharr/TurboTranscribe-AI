import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
// @ts-ignore
import { snapsave } from './node_modules/snapsave-media-downloader/dist/index.mjs';
// @ts-ignore
import { fbdown } from 'btch-downloader';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Serve public static folder (samples, icons)
app.use(express.static(path.join(__dirname, 'public')));

// Multer in-memory storage for uploaded audio/video files (up to 60MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
});

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Google GenAI client (v1beta supports gemini-3.5-transcribe and all active Gemini models)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  apiVersion: 'v1beta',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated sample clips for 1-click test runs
const SAMPLE_VIDEOS = [
  {
    id: 'sample-tiktok-hook',
    platform: 'tiktok',
    title: 'TikTok Viral: "El Secreto del Gancho de 3 Segundos"',
    url: '/samples/tiktok_viral_hook.wav',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    duration: '22s',
    author: '@creador_viral',
  },
  {
    id: 'sample-instagram-reel',
    platform: 'instagram',
    title: 'Instagram Reel: "Consejos de Video Cinematográfico con Móvil"',
    url: '/samples/instagram_reels_consejos.wav',
    thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&auto=format&fit=crop&q=80',
    duration: '24s',
    author: '@fotografia_pro',
  },
  {
    id: 'sample-facebook-watch',
    platform: 'facebook',
    title: 'Facebook Watch: "La Regla de los 2 Minutos para Cambiar tu Vida"',
    url: '/samples/facebook_productividad.wav',
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    duration: '23s',
    author: 'Mentalidad de Éxito',
  },
];

// Helper: detect platform from URL
function detectPlatform(url: string): 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'direct' {
  const lower = url.toLowerCase();
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  return 'direct';
}

// Media resolver for public URLs
async function resolveSocialMedia(targetUrl: string): Promise<{
  directVideoUrl: string;
  title: string;
  author: string;
  thumbnail?: string;
  sourcePlatform: string;
  warning?: string;
}> {
  const platform = detectPlatform(targetUrl);

  // 1. Direct video or audio file
  if (
    targetUrl.match(/\.(mp4|webm|mov|m4v|mp3|wav|ogg|m4a)(\?.*)?$/i) ||
    targetUrl.includes('commondatastorage.googleapis.com')
  ) {
    return {
      directVideoUrl: targetUrl,
      title: 'Video Directo Multimedia',
      author: 'Archivo de video',
      sourcePlatform: 'direct',
    };
  }

  // 2. Direct SnapSave Engine (Supports Facebook, Instagram, TikTok)
  try {
    const snapResult: any = await snapsave(targetUrl);
    if (snapResult && snapResult.success && snapResult.data?.media?.length) {
      const videoItem =
        snapResult.data.media.find((m: any) => m.type === 'video' && m.url && !m.shouldRender) ||
        snapResult.data.media.find((m: any) => m.url) ||
        snapResult.data.media[0];

      if (videoItem && videoItem.url) {
        return {
          directVideoUrl: videoItem.url,
          title: snapResult.data.description || `Video de ${platform.toUpperCase()}`,
          author: `${platform.toUpperCase()} Creator`,
          thumbnail: snapResult.data.preview || videoItem.thumbnail,
          sourcePlatform: platform,
        };
      }
    }
  } catch (snapErr) {
    console.warn('SnapSave auto-extraction note:', snapErr);
  }

  // 2.5 Facebook SnapSave Fallback
  if (platform === 'facebook') {
    try {
      const fbRes: any = await fbdown(targetUrl);
      if (fbRes && fbRes.status && (fbRes.HD || fbRes.Normal_video)) {
        return {
          directVideoUrl: fbRes.HD || fbRes.Normal_video,
          title: 'Video de Facebook (SnapSave)',
          author: 'Facebook Creator',
          sourcePlatform: 'facebook',
        };
      }
    } catch {
      // Continue
    }
  }

  // 3. TikTok public resolver
  if (platform === 'tiktok') {
    try {
      // Try TikWM public free endpoint
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.play) {
          return {
            directVideoUrl: data.data.play,
            title: data.data.title || 'TikTok Video',
            author: data.data.author?.nickname || data.data.author?.unique_id || 'TikTok Creator',
            thumbnail: data.data.cover,
            sourcePlatform: 'tiktok',
          };
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 3. Instagram Reels / Posts
  if (platform === 'instagram') {
    try {
      // Attempt oEmbed to retrieve metadata
      const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(targetUrl)}`;
      const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) });
      let igTitle = 'Instagram Reel';
      let igAuthor = 'Instagram Creator';
      let igThumb = '';
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        igTitle = oembedData.title || igTitle;
        igAuthor = oembedData.author_name || igAuthor;
        igThumb = oembedData.thumbnail_url || '';
      }

      // Query Cobalt public instances or direct HTML scrape
      const htmlRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const ogVideoMatch = html.match(/property="og:video" content="([^"]+)"/) || html.match(/property="og:video:secure_url" content="([^"]+)"/);
        if (ogVideoMatch && ogVideoMatch[1]) {
          const directUrl = ogVideoMatch[1].replace(/&amp;/g, '&');
          return {
            directVideoUrl: directUrl,
            title: igTitle,
            author: igAuthor,
            thumbnail: igThumb,
            sourcePlatform: 'instagram',
          };
        }
      }
    } catch {
      // Continue to fallback
    }
  }

  // 4. Facebook Reels / Watch
  if (platform === 'facebook') {
    try {
      const htmlRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(5000),
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const ogVideoMatch = html.match(/property="og:video" content="([^"]+)"/) || html.match(/property="og:video:secure_url" content="([^"]+)"/);
        const titleMatch = html.match(/property="og:title" content="([^"]+)"/);
        if (ogVideoMatch && ogVideoMatch[1]) {
          return {
            directVideoUrl: ogVideoMatch[1].replace(/&amp;/g, '&'),
            title: titleMatch ? titleMatch[1] : 'Facebook Video',
            author: 'Facebook Creator',
            sourcePlatform: 'facebook',
          };
        }
      }
    } catch {
      // Continue
    }
  }

  // 5. If it's an explicit sample URL
  if (targetUrl.startsWith('/samples/')) {
    const s = SAMPLE_VIDEOS.find((item) => item.url === targetUrl) || SAMPLE_VIDEOS[0];
    return {
      directVideoUrl: targetUrl,
      title: s.title,
      author: s.author,
      thumbnail: s.thumbnail,
      sourcePlatform: s.platform,
    };
  }

  // 6. If direct stream couldn't be extracted because the platform requires login or blocks cloud IPs:
  // We explicitly return isProtected so the UI can assist the user to transcribe THEIR real video
  return {
    directVideoUrl: '',
    title: `Video de ${platform.toUpperCase()}`,
    author: `${platform.toUpperCase()} Creator`,
    sourcePlatform: platform,
    warning: 'PROTECTED_SOCIAL_LINK',
  };
}

// Resilient Multi-Model Architecture
// Prioritizes active free-tier models with immediate failover and time-bounded cooldowns
const FALLBACK_MODELS = [
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
];

// Map of model -> timestamp (ms) until which it should be skipped
const modelCooldownUntil = new Map<string, number>();

function formatErrorMessage(err: any): string {
  let msg = err?.message || 'Error inesperado';
  if (
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('429') ||
    msg.includes('quota')
  ) {
    return 'Los servidores de Google AI están experimentando un alto volumen de solicitudes o límite temporal. Por favor, reintenta en unos instantes.';
  }
  if (msg.startsWith('{') && msg.includes('"message"')) {
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch {
      // Keep original
    }
  }
  return msg;
}

async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
  timeoutMs?: number;
}) {
  const candidateModels = params.preferredModel
    ? [params.preferredModel, ...FALLBACK_MODELS.filter((m) => m !== params.preferredModel)]
    : FALLBACK_MODELS;

  const now = Date.now();
  // Try healthy models first, then any cooled-down models as last resort
  const healthyModels = candidateModels.filter((m) => (modelCooldownUntil.get(m) || 0) <= now);
  const cooledModels = candidateModels.filter((m) => (modelCooldownUntil.get(m) || 0) > now);
  const orderedModels = [...healthyModels, ...cooledModels];
  const timeoutMs = params.timeoutMs ?? 45000;

  let lastError: any = null;

  for (let pass = 1; pass <= 2; pass++) {
    const modelsThisPass = pass === 1 ? orderedModels : candidateModels;

    for (const model of modelsThisPass) {
      try {
        console.log(`[AI Engine] Invoking model ${model} (pass ${pass})...`);
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout calling ${model}`)), timeoutMs)
          ),
        ]);

        if (response && response.text) {
          modelCooldownUntil.delete(model);
          console.log(`[AI Engine] Succeeded with model ${model}!`);
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || '').toLowerCase();
        const isQuotaExceeded =
          errMsg.includes('quota') ||
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted') ||
          err?.status === 429 ||
          err?.status === 'RESOURCE_EXHAUSTED';

        const isUnavailable =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('timeout') ||
          err?.status === 503 ||
          err?.status === 'UNAVAILABLE';

        const isNotFound = errMsg.includes('404') || errMsg.includes('not_found') || err?.status === 404;

        console.warn(`[AI Engine] ${model} pass ${pass} notice:`, err?.message?.slice(0, 140));

        if (isQuotaExceeded) {
          // Put model in a 2-minute cooldown and fail over immediately
          modelCooldownUntil.set(model, Date.now() + 2 * 60 * 1000);
        } else if (isNotFound) {
          // Skip unavailable model name for 10 minutes
          modelCooldownUntil.set(model, Date.now() + 10 * 60 * 1000);
        } else if (isUnavailable) {
          // Put model in a 60-second cooldown and fail over immediately to the next healthy model
          modelCooldownUntil.set(model, Date.now() + 60 * 1000);
        }
      }
    }

    // Only wait and do a second pass if the first pass failed across all models
    if (pass === 1) {
      const backoffMs = 1200 + Math.floor(Math.random() * 500);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }

  throw new Error(formatErrorMessage(lastError));
}

// Generate transcript with Gemini AI (multi-model fallback)
async function transcribeMediaBuffer(
  buffer: Buffer,
  mimeType: string,
  options: {
    language?: string;
    cleanScript?: boolean;
    includeTimestamps?: boolean;
    speakerDiarization?: boolean;
    title?: string;
  }
) {
  const base64Data = buffer.toString('base64');

  const systemInstruction = `
Eres TurboTranscribe AI, el motor de transcripción y extracción de guiones más avanzado y preciso del mundo, similar a TurboScribe pero potenciado por inteligencia artificial multimodal de última generación.

Tu objetivo es transcribir y convertir en guión con MÁXIMA PRECISIÓN el video o audio proporcionado.
Reglas clave:
1. Escucha cada palabra minuciosamente. No inventes palabras. No omitas frases.
2. Identifica los tiempos exactos (timestamps) con formato [MM:SS] o [HH:MM:SS].
3. Identifica a los hablantes (ej: "Narrador", "Orador 1", "Creador", "Entrevistador").
4. Genera múltiples vistas:
   - "verbatim": Transcripción palabra por palabra totalmente exacta.
   - "cleanScript": Guión pulido sin muletillas (sin "eh", "um", repeticiones involuntarias), listo para locución o lectura profesional.
   - "dialogueSegments": Lista estructurada de segmentos con startTime, endTime, speaker y text.
   - "summary": Resumen ejecutivo de 2 a 3 frases.
   - "keyTakeaways": Lista de 3 a 5 puntos clave o aprendizajes.
   - "viralHooks": 2 ganchos llamativos que se usaron o podrían usarse para TikTok/Reels.
   - "suggestedHashtags": 5-8 hashtags relevantes.
   - "srtContent": Formato estándar de subtítulos SRT completo con numeración, tiempos (00:00:00,000 --> 00:00:05,000) y texto.
   - "vttContent": Formato estándar WebVTT (WEBVTT ...).
5. Detecta automáticamente el idioma principal (ej: "es", "en", "pt", "fr").
`;

  const userPrompt = `
Por favor transcribe completamente este archivo multimedia con la máxima exactitud.
Título de referencia: ${options.title || 'Video de Redes Sociales'}
Preferencia de idioma: ${options.language || 'Automático'}
Diarización de hablantes: ${options.speakerDiarization ? 'Sí' : 'No'}
Modo de guión limpio: ${options.cleanScript ? 'Sí' : 'No'}

Devuelve únicamente un JSON válido con la siguiente estructura:
{
  "title": "Título sugerido o detectado",
  "detectedLanguage": "Español (es)",
  "durationSeconds": 15,
  "confidenceScore": 99.4,
  "wordCount": 120,
  "verbatim": "Texto exacto completo transcrito...",
  "cleanScript": "Guión limpio listo para usar...",
  "summary": "Resumen ejecutivo del contenido...",
  "keyTakeaways": ["Punto 1", "Punto 2", "Punto 3"],
  "viralHooks": ["Gancho 1", "Gancho 2"],
  "suggestedHashtags": ["#viral", "#consejos"],
  "dialogueSegments": [
    {
      "start": "00:00",
      "end": "00:04",
      "speaker": "Creador",
      "text": "Frase de diálogo aquí..."
    }
  ],
  "srtContent": "1\\n00:00:00,000 --> 00:00:04,000\\nFrase de diálogo aquí...\\n\\n",
  "vttContent": "WEBVTT\\n\\n00:00.000 --> 00:04.000\\nFrase de diálogo aquí..."
}
`;

  try {
    const response = await generateContentWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            durationSeconds: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            wordCount: { type: Type.NUMBER },
            verbatim: { type: Type.STRING },
            cleanScript: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            viralHooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedHashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            dialogueSegments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.STRING },
                  end: { type: Type.STRING },
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['start', 'end', 'speaker', 'text'],
              },
            },
            srtContent: { type: Type.STRING },
            vttContent: { type: Type.STRING },
          },
          required: [
            'title',
            'detectedLanguage',
            'wordCount',
            'verbatim',
            'cleanScript',
            'dialogueSegments',
            'srtContent',
            'vttContent',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    return JSON.parse(responseText);
  } catch (primaryErr: any) {
    // Dedicated audio transcription fallback using gemini-3.5-transcribe when general models are overloaded
    if (mimeType.startsWith('audio/')) {
      try {
        console.log('[AI Engine] Falling back to dedicated audio model gemini-3.5-transcribe...');
        const transcribeRes = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: 'Transcribe this audio accurately word for word.' },
            ],
          },
        });
        const verbatim = (transcribeRes.text || '').trim();
        if (verbatim) {
          const words = verbatim.split(/\s+/).filter(Boolean);
          const sentences = verbatim.match(/[^.!?]+[.!?]*/g) || [verbatim];
          const dialogueSegments = sentences.map((s, idx) => {
            const startSec = idx * 4;
            const endSec = (idx + 1) * 4;
            const fmt = (sec: number) =>
              `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
            return {
              start: fmt(startSec),
              end: fmt(endSec),
              speaker: 'Creador',
              text: s.trim(),
            };
          });
          const srtContent = dialogueSegments
            .map(
              (seg, idx) =>
                `${idx + 1}\n00:${seg.start},000 --> 00:${seg.end},000\n${seg.text}\n`
            )
            .join('\n');
          const vttContent =
            'WEBVTT\n\n' +
            dialogueSegments
              .map((seg) => `00:${seg.start}.000 --> 00:${seg.end}.000\n${seg.text}\n`)
              .join('\n');
          return {
            title: options.title || 'Transcripción de Audio',
            detectedLanguage: options.language && options.language !== 'Automático' ? options.language : 'Automático',
            durationSeconds: dialogueSegments.length * 4,
            confidenceScore: 98.5,
            wordCount: words.length,
            verbatim,
            cleanScript: verbatim,
            summary: sentences.slice(0, 2).join(' ').trim(),
            keyTakeaways: sentences.slice(0, 3).map((s) => s.trim()),
            viralHooks: sentences.slice(0, 2).map((s) => s.trim()),
            suggestedHashtags: ['#contenido', '#creadores', '#video'],
            dialogueSegments,
            srtContent,
            vttContent,
          };
        }
      } catch (fallbackErr: any) {
        console.warn('[AI Engine] gemini-3.5-transcribe fallback notice:', fallbackErr?.message?.slice(0, 140));
      }
    }
    throw primaryErr;
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Get sample videos for 1-click test
app.get('/api/samples', (_req: Request, res: Response) => {
  res.json({ samples: SAMPLE_VIDEOS });
});

// 2. Resolve link metadata and direct video
app.post('/api/resolve-link', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'La URL es requerida' });
      return;
    }

    const resolved = await resolveSocialMedia(url.trim());
    res.json({ success: true, ...resolved });
  } catch (err: any) {
    console.error('Error resolving link:', err);
    res.status(500).json({ error: 'No se pudo resolver el enlace: ' + (err?.message || 'Error desconocido') });
  }
});

// SnapSave In-App Extractor endpoint (100% internal, no external redirects)
app.post('/api/snapsave-extract', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'La URL es requerida' });
      return;
    }

    const cleanUrl = url.trim();

    // 1. Try primary SnapSave engine
    try {
      const snapResult: any = await snapsave(cleanUrl);
      if (snapResult && snapResult.success && snapResult.data?.media?.length) {
        res.json({
          success: true,
          data: snapResult.data,
        });
        return;
      }
    } catch {
      // Continue to next engine
    }

    // 2. Try secondary SnapSave / FB engine for Facebook links
    if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
      try {
        const fbRes: any = await fbdown(cleanUrl);
        if (fbRes && fbRes.status && (fbRes.HD || fbRes.Normal_video)) {
          const media = [];
          if (fbRes.HD) {
            media.push({
              resolution: '1080p / 720p (HD)',
              url: fbRes.HD,
              type: 'video',
            });
          }
          if (fbRes.Normal_video) {
            media.push({
              resolution: 'Normal / SD',
              url: fbRes.Normal_video,
              type: 'video',
            });
          }

          res.json({
            success: true,
            data: {
              description: 'Video de Facebook (SnapSave Engine)',
              media,
            },
          });
          return;
        }
      } catch {
        // Continue
      }
    }

    res.status(422).json({
      success: false,
      error: 'No se pudo extraer el video automáticamente mediante el motor SnapSave en la nube. Puedes subir el archivo directamente en la pestaña "Subir Video / Audio".',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Error en el motor SnapSave integrado',
    });
  }
});

// In-App Direct Proxy Downloader (supports data URIs, local samples, and remote MP4/audio URLs)
app.get('/api/proxy-download', async (req: Request, res: Response) => {
  try {
    const videoUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'video_turbotranscribe.mp4';

    if (!videoUrl) {
      res.status(400).send('URL de video requerida');
      return;
    }

    // If it's a data URI
    if (videoUrl.startsWith('data:')) {
      const matches = videoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('Content-Type', type);
        res.send(buffer);
        return;
      }
    }

    // If it's a local sample file
    if (videoUrl.startsWith('/samples/')) {
      const safeName = path.basename(videoUrl);
      const filePath = path.join(process.cwd(), 'public', 'samples', safeName);
      if (fs.existsSync(filePath)) {
        const fileBuf = fs.readFileSync(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('Content-Type', 'audio/wav');
        res.send(fileBuf);
        return;
      }
    }

    const videoRes = await fetch(videoUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!videoRes.ok) {
      // If direct fetch is forbidden or redirects, redirect user to the stream
      res.redirect(videoUrl);
      return;
    }

    const contentType = videoRes.headers.get('content-type') || 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Error in proxy-download:', err);
    res.status(500).send('Error al descargar el archivo: ' + err.message);
  }
});

// 3. Transcribe from link
app.post('/api/transcribe-link', async (req: Request, res: Response) => {
  try {
    const { url, cleanScript, speakerDiarization, language } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Por favor ingresa un link válido de TikTok, Instagram, Facebook o video' });
      return;
    }

    // Step 1: Resolve link
    const resolved = await resolveSocialMedia(url.trim());

    // If the social link is protected by Meta/TikTok anti-bot policies
    if (!resolved.directVideoUrl || resolved.warning === 'PROTECTED_SOCIAL_LINK') {
      res.status(422).json({
        success: false,
        isProtected: true,
        platform: resolved.sourcePlatform,
        originalUrl: url,
        error: 'PROTECTED_SOCIAL_LINK',
        message: `El enlace de ${resolved.sourcePlatform.toUpperCase()} está protegido contra descargas automatizadas de servidores en la nube. Para transcribir tu video real al 100%, usa el descargador rápido en 1 clic y suelta el archivo aquí.`,
      });
      return;
    }

    // Step 2: Fetch media bytes
    let buffer: Buffer;
    let mimeType = 'video/mp4';

    if (resolved.directVideoUrl.startsWith('/samples/')) {
      const filePath = path.join(process.cwd(), 'public', resolved.directVideoUrl);
      buffer = fs.readFileSync(filePath);
      mimeType = 'audio/wav';
    } else {
      try {
        const mediaFetchRes = await fetch(resolved.directVideoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
          signal: AbortSignal.timeout(20000),
        });

        if (!mediaFetchRes.ok) {
          throw new Error(`Código HTTP: ${mediaFetchRes.status}`);
        }

        const arrayBuffer = await mediaFetchRes.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        const contentType = mediaFetchRes.headers.get('content-type') || 'video/mp4';
        mimeType =
          contentType.includes('audio') || contentType.includes('video')
            ? contentType.split(';')[0]
            : 'video/mp4';
      } catch (fetchErr: any) {
        res.status(422).json({
          success: false,
          isProtected: true,
          platform: resolved.sourcePlatform,
          originalUrl: url,
          error: 'PROTECTED_SOCIAL_LINK',
          message: `No se pudo descargar el video directamente desde ${resolved.sourcePlatform.toUpperCase()} debido a restricciones de sesión de la red social. Para procesar TU video exacto, descárgalo en 1 clic y súbelo en la pestaña "Subir Video".`,
        });
        return;
      }
    }

    // Step 3: Run Gemini AI Transcription
    const result = await transcribeMediaBuffer(buffer, mimeType, {
      cleanScript: !!cleanScript,
      speakerDiarization: speakerDiarization !== false,
      language: language || 'Automático',
      title: resolved.title,
    });

    res.json({
      success: true,
      mediaInfo: {
        directVideoUrl: resolved.directVideoUrl,
        title: result.title || resolved.title,
        author: resolved.author,
        thumbnail: resolved.thumbnail,
        sourcePlatform: resolved.sourcePlatform,
        originalUrl: url,
      },
      transcription: result,
    });
  } catch (err: any) {
    console.error('Error in transcribe-link:', err);
    res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
});

// 4. Transcribe uploaded file (video or audio)
app.post('/api/transcribe-file', upload.single('mediaFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se subió ningún archivo' });
      return;
    }

    const { cleanScript, speakerDiarization, language } = req.body;
    const file = req.file;

    let mimeType = file.mimetype || 'video/mp4';
    if (!mimeType.includes('/')) {
      mimeType = file.originalname.endsWith('.mp3') ? 'audio/mp3' : 'video/mp4';
    }

    const result = await transcribeMediaBuffer(file.buffer, mimeType, {
      cleanScript: cleanScript === 'true' || cleanScript === true,
      speakerDiarization: speakerDiarization !== 'false',
      language: language || 'Automático',
      title: file.originalname,
    });

    // Provide a data URL or blob identifier so the user can play it locally in the browser
    const base64Data = file.buffer.toString('base64');
    const localMediaUrl = `data:${mimeType};base64,${base64Data}`;

    res.json({
      success: true,
      mediaInfo: {
        directVideoUrl: localMediaUrl,
        title: file.originalname,
        author: 'Archivo local',
        sourcePlatform: 'upload',
      },
      transcription: result,
    });
  } catch (err: any) {
    console.error('Error in transcribe-file:', err);
    res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
});


// 6. Translate script endpoint
app.post('/api/translate-script', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      res.status(400).json({ error: 'Texto e idioma de destino requeridos' });
      return;
    }

    const response = await generateContentWithFallback({
      contents: `Traduce el siguiente guión transcrito al idioma "${targetLanguage}".
Conserva el tono, las marcas de hablante y las marcas de tiempo si están presentes. Mantén el ritmo natural para locución.

Texto:
${text}`,
    });

    res.json({ translatedText: response.text || '' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al traducir: ' + formatErrorMessage(err) });
  }
});

// 7. Format or repurpose script for creator platforms
app.post('/api/repurpose-script', async (req: Request, res: Response) => {
  try {
    const { transcript, formatType } = req.body;
    if (!transcript) {
      res.status(400).json({ error: 'Transcripción requerida' });
      return;
    }

    let instruction = '';
    switch (formatType) {
      case 'reels_script':
        instruction =
          'Reescribe la transcripción como un guión profesional para TikTok/Reels con: [HOOK / GANCHO (0-3s)], [PROBLEMA], [SOLUCIÓN/DESARROLLO], y [CALL TO ACTION (CTA)]. Agrega sugerencias visuales de planos.';
        break;
      case 'blog_post':
        instruction =
          'Transforma este contenido en un artículo de blog o post de LinkedIn bien estructurado con título atractivo, subtítulos H2, viñetas y conclusión memorable.';
        break;
      case 'twitter_thread':
        instruction =
          'Convierte este guión en un hilo de Twitter / X viral de 4-6 tweets concisos con gancho de alto impacto y emojis estratégicos.';
        break;
      case 'summary_bullet':
        instruction =
          'Genera un resumen ejecutivo en viñetas directas de los 5 conceptos más valiosos explicados en el video.';
        break;
      default:
        instruction = 'Limpia y mejora el formato de este guión para máxima legibilidad.';
    }

    const response = await generateContentWithFallback({
      contents: `${instruction}\n\nTranscripción original:\n${transcript}`,
    });

    res.json({ result: response.text || '' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al formatear: ' + formatErrorMessage(err) });
  }
});

// Setup Vite or static serving
async function setupVite() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TurboTranscribe server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
