import React, { useState } from 'react';
import { X, Trash2, Clock, Search, ArrowRight, Video, FileText } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.transcription.title?.toLowerCase().includes(q) ||
      item.mediaInfo.author?.toLowerCase().includes(q) ||
      item.transcription.cleanScript?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Historial de Transcripciones</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Clear Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en historial..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-medium"
              title="Borrar todo el historial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No hay transcripciones guardadas aún.</p>
              <p className="mt-1">Pega un enlace o sube un video para comenzar.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl transition-all cursor-pointer relative"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                        {item.mediaInfo.sourcePlatform}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                      {item.transcription.title || 'Video transcrito'}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {item.transcription.summary || item.transcription.cleanScript}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar de historial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono mt-2">
                      {item.transcription.wordCount} pal.
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
