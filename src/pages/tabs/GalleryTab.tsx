import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2, 
  Info,
  Calendar,
  User,
  X,
  FileArchive
} from 'lucide-react';
import type { MemoryTree, Memory } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryTabProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function GalleryTab({ tree, onExport }: GalleryTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const memories = tree.memories;
  const currentMemory = memories[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % memories.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);

  if (!currentMemory) return <div className="flex items-center justify-center h-screen text-slate-500">Archive is empty.</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-950 overflow-hidden">
      {/* Main Theatre Area */}
      <div className="flex-1 relative flex items-center justify-center p-12 bg-[#050505]">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-transparent to-transparent"></div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMemory.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-5xl w-full h-full flex items-center justify-center shadow-2xl"
          >
            {currentMemory.photoUrl ? (
              <img
                src={currentMemory.photoUrl}
                alt={currentMemory.name}
                className="max-w-full max-h-full object-contain rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-white/5 italic text-slate-500 gap-4">
                <FileArchive className="w-16 h-16 opacity-20" />
                <span>Document Format Preview N/A</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-0 flex items-center px-6">
          <button onClick={prev} className="p-4 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all">
            <ChevronLeft className="w-12 h-12 stroke-1" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-6">
          <button onClick={next} className="p-4 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all">
            <ChevronRight className="w-12 h-12 stroke-1" />
          </button>
        </div>

        {/* Bottom Filmstrip Preview */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden max-w-[80%]">
          {memories.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((m, i) => (
            <div 
              key={m.id}
              onClick={() => setCurrentIndex(memories.indexOf(m))}
              className={`w-16 h-12 rounded-lg cursor-pointer transition-all border-2 ${
                m.id === currentMemory.id ? 'border-blue-500 scale-110 opacity-100' : 'border-transparent opacity-40 hover:opacity-100'
              } overflow-hidden`}
            >
              <img src={m.photoUrl} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Professional Metadata Sidebar */}
      <div className={`w-[400px] border-l border-white/10 bg-slate-950 flex flex-col transition-all duration-500 ${isSidebarOpen ? 'mr-0' : '-mr-[400px]'}`}>
        <div className="p-10 flex-1 overflow-y-auto space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic">Artifact Identification</span>
            <h2 className="text-4xl font-black text-white tracking-tighter italic leading-tight">{currentMemory.name}</h2>
            <p className="text-slate-400 text-sm font-medium italic leading-relaxed pt-2">
              {currentMemory.description || "Historical data preserved with zero classification loss."}
            </p>
          </div>

          <div className="space-y-8 border-t border-white/5 pt-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Era / Year</span>
              </div>
              <span className="text-white font-bold italic">{new Date(currentMemory.date).getFullYear()}</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500">
                <User className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Linked Subjects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMemory.tags.personIds.map(pid => {
                  const person = tree.people.find(p => p.id === pid);
                  return (
                    <span key={pid} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-tighter italic hover:border-blue-500/50 transition-colors cursor-default">
                      {person?.name || "Archive Subject"}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Global Export / Actions */}
        <div className="p-10 border-t border-white/5 bg-slate-900/20 space-y-4">
          <button 
            onClick={() => onExport('ZIP')}
            className="flex items-center justify-center gap-3 w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            Download Full Archive
          </button>
          <div className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
            MURRAY LEGACY PROTOCOL // 2026
          </div>
        </div>
      </div>
    </div>
  );
}
