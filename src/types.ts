export interface DialogueSegment {
  start: string;
  end: string;
  speaker: string;
  text: string;
}

export interface TranscriptionResult {
  title: string;
  detectedLanguage: string;
  durationSeconds?: number;
  confidenceScore?: number;
  wordCount: number;
  verbatim: string;
  cleanScript: string;
  summary: string;
  keyTakeaways: string[];
  viralHooks: string[];
  suggestedHashtags: string[];
  dialogueSegments: DialogueSegment[];
  srtContent: string;
  vttContent: string;
}

export interface MediaInfo {
  directVideoUrl: string;
  title: string;
  author: string;
  thumbnail?: string;
  sourcePlatform: 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'direct' | 'upload';
  originalUrl?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mediaInfo: MediaInfo;
  transcription: TranscriptionResult;
}

export interface SampleVideo {
  id: string;
  platform: 'tiktok' | 'instagram' | 'facebook';
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  author: string;
}
