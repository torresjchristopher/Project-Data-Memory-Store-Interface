import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  User, 
  FileArchive
} from 'lucide-react';
import type { MemoryTree } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryTabProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function GalleryTab({ tree, onExport }: GalleryTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  const memories = tree.memories;
  const currentMemory = memories[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % memories.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Prefetch logic
  useEffect(() => {
    const prefetchIndices = [
      (currentIndex + 1) % memories.length,
      (currentIndex - 1 + memories.length) % memories.length
    ];
    prefetchIndices.forEach(idx => {
      const img = new Image();
      if (memories[idx]?.photoUrl) img.src = memories[idx].photoUrl;
    });
  }, [currentIndex, memories]);

  // Filmstrip auto-scroll
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Home') setCurrentIndex(0);
      else if (e.key === 'End') setCurrentIndex(memories.length - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memories.length]);

  if (!currentMemory) return <div className="flex items-center justify-center h-screen text-presidential-400 font-serif italic text-xl">Archive collection is empty.</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-presidential-950 overflow-hidden font-serif">
      {/* Main Theatre Area */}
      <div className="flex-1 relative flex items-center justify-center p-0 md:p-12 bg-black">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMemory.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            {currentMemory.photoUrl ? (
              <img
                src={currentMemory.photoUrl}
                alt={currentMemory.name}
                loading="eager"
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-presidential-500 gap-6 opacity-50">
                <FileArchive className="w-24 h-24 stroke-1" />
                <span className="text-xl italic tracking-wide">Document Preview Unavailable</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Elegant Controls (Fade in/out) */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-y-0 left-0 flex items-center px-4 md:px-8 pointer-events-auto">
            <button onClick={prev} className="p-4 rounded-full text-white/30 hover:text-presidential-400 hover:bg-white/5 transition-all duration-500">
              <ChevronLeft className="w-12 h-12 stroke-[0.5]" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 md:px-8 pointer-events-auto">
            <button onClick={next} className="p-4 rounded-full text-white/30 hover:text-presidential-400 hover:bg-white/5 transition-all duration-500">
              <ChevronRight className="w-12 h-12 stroke-[0.5]" />
            </button>
          </div>
        </div>

        {/* Bottom Filmstrip (Fade in/out) */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent transition-transform duration-500 ${controlsVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div 
            ref={filmstripRef}
            className="flex gap-4 overflow-x-auto justify-center max-w-4xl mx-auto pb-4 no-scrollbar"
          >
            {memories.map((m, idx) => (
              <div 
                key={m.id}
                ref={idx === currentIndex ? activeThumbRef : null}
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-16 shrink-0 cursor-pointer transition-all duration-500 border border-white/10 ${
                  idx === currentIndex ? 'scale-110 border-presidential-400 opacity-100 z-10' : 'opacity-40 hover:opacity-80 grayscale hover:grayscale-0'
                }`}
              >
                <img src={m.photoUrl} loading="lazy" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata Sidebar (Always Visible - The "Label") */}
      <div className="w-[380px] bg-presidential-900 border-l border-presidential-800 flex flex-col z-20 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-presidential-800 via-presidential-500 to-presidential-800 opacity-50"></div>
        
        <div className="p-10 flex-1 overflow-y-auto space-y-10 text-presidential-100 scrollbar-thin scrollbar-thumb-presidential-700">
          
          <div className="space-y-4">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-presidential-400 opacity-80">Artifact No. {currentIndex + 1}</span>
            <h2 className="text-3xl font-medium leading-tight text-presidential-50">{currentMemory.name}</h2>
            <div className="w-12 h-px bg-presidential-500/30 my-6"></div>
            <p className="text-presidential-100/70 text-sm font-sans font-light leading-relaxed">
              {currentMemory.description || "No archival description available for this item."}
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-presidential-500/60 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest">Date</span>
                </div>
                <div className="text-lg italic">{new Date(currentMemory.date).getFullYear()}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-presidential-500/60 mb-1">
                  <FileArchive className="w-3 h-3" />
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest">Type</span>
                </div>
                <div className="text-lg italic capitalize">{currentMemory.type}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-presidential-500/60">
                <User className="w-3 h-3" />
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest">Subjects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMemory.tags.personIds.map(pid => {
                  const person = tree.people.find(p => p.id === pid);
                  return (
                    <span key={pid} className="px-3 py-1 bg-presidential-800/50 border border-white/5 rounded-sm text-[10px] font-sans font-bold text-presidential-100 uppercase tracking-wider">
                      {person?.name || "Unknown"}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-presidential-950/50 border-t border-presidential-800 space-y-4">
          <button 
            onClick={() => onExport('ZIP')}
            className="group w-full py-4 border border-presidential-500/30 hover:border-presidential-500 text-presidential-400 hover:text-presidential-50 transition-all duration-500 flex items-center justify-center gap-3"
          >
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">Acquire High-Res</span>
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}