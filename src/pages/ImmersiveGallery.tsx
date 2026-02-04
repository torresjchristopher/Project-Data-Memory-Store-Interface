import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Download, 
  Terminal, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X,
  FileArchive,
  Grid,
  Maximize2
} from 'lucide-react';
import type { MemoryTree } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ArtifactCliTab from './tabs/ArtifactCliTab';

interface ImmersiveGalleryProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function ImmersiveGallery({ tree, onExport }: ImmersiveGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'theatre' | 'grid'>('theatre');
  const [showUi, setShowUi] = useState(true);
  const [showCli, setShowCli] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filteredMemories = useMemo(() => {
    return tree.memories.filter(m => {
      const matchPerson = !filterPerson || m.tags.personIds.includes(filterPerson);
      const matchSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPerson && matchSearch;
    });
  }, [tree.memories, filterPerson, searchQuery]);

  const currentMemory = filteredMemories[currentIndex];

  // Auto-hide UI logic
  useEffect(() => {
    const resetTimer = () => {
      setShowUi(true);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
      if (viewMode === 'theatre') {
        uiTimeoutRef.current = setTimeout(() => setShowUi(false), 3000);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [viewMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCli(false);
        setFilterPerson('');
        setSearchQuery('');
      }
      if (showCli) return;

      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + filteredMemories.length) % filteredMemories.length);
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % filteredMemories.length);
      }
      if (e.key === 'g') {
        setViewMode(prev => prev === 'theatre' ? 'grid' : 'theatre');
      }
      if (e.key === 's') {
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMemories.length, showCli]);

  if (!currentMemory && filteredMemories.length === 0) {
    return (
      <div className="min-h-screen bg-[#05080f] flex items-center justify-center text-slate-500 font-serif italic">
        Archive empty or no results found.
        <button onClick={() => { setSearchQuery(''); setFilterPerson(''); }} className="ml-4 underline text-[#c5a059]">Reset Filters</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-[#e2e8f0] font-sans overflow-hidden relative selection:bg-[#c5a059]/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-black pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vh] h-[120vh] bg-blue-900/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Artifact CLI Modal */}
      <AnimatePresence>
        {showCli && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-[#05080f]/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="p-8 md:p-12">
              <button onClick={() => setShowCli(false)} className="fixed top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                <X className="w-6 h-6 text-white" />
              </button>
              <ArtifactCliTab />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layer */}
      <div className="relative z-10 w-full h-screen flex flex-col">
        
        {/* Top Control Bar (Auto-Hides in Theatre) */}
        <motion.header 
          animate={{ y: showUi ? 0 : -100, opacity: showUi ? 1 : 0 }}
          className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-4">
            <div className="w-10 h-10 bg-[#c5a059] rounded-sm flex items-center justify-center shadow-lg">
              <span className="font-serif font-black text-[#05080f] text-xl">S</span>
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-white tracking-wide uppercase">Schnitzelbank</h1>
              <p className="text-[10px] text-[#c5a059] font-bold uppercase tracking-[0.3em]">Archive</p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                id="search-input"
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-slate-600 pl-10"
              />
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <select 
              value={filterPerson} 
              onChange={(e) => setFilterPerson(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer"
            >
              <option value="" className="bg-[#05080f]">All People</option>
              {tree.people.map(p => <option key={p.id} value={p.id} className="bg-[#05080f]">{p.name}</option>)}
            </select>
          </div>

          <div className="pointer-events-auto flex gap-3">
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'theatre' : 'grid')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all" title="Toggle View">
              {viewMode === 'grid' ? <Maximize2 className="w-5 h-5 text-white" /> : <Grid className="w-5 h-5 text-white" />}
            </button>
            <button onClick={() => setShowCli(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all" title="Artifact CLI">
              <Terminal className="w-5 h-5 text-[#c5a059]" />
            </button>
            <button onClick={() => onExport('ZIP')} className="p-3 bg-[#c5a059] hover:bg-[#b48a3e] rounded-xl transition-all text-[#05080f]" title="Export ZIP">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {/* View Mode: Theatre (Default) */}
        {viewMode === 'theatre' && currentMemory && (
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMemory.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-20"
              >
                {currentMemory.photoUrl ? (
                  <img
                    src={currentMemory.photoUrl}
                    alt={currentMemory.name}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm border border-white/5"
                  />
                ) : (
                  <div className="text-slate-600 flex flex-col items-center">
                    <FileArchive className="w-24 h-24 mb-4 opacity-50" />
                    <span>Preview Unavailable</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button 
              onClick={() => setCurrentIndex(prev => (prev - 1 + filteredMemories.length) % filteredMemories.length)}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white transition-opacity duration-500 ${showUi ? 'opacity-100' : 'opacity-0'}`}
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => (prev + 1) % filteredMemories.length)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white transition-opacity duration-500 ${showUi ? 'opacity-100' : 'opacity-0'}`}
            >
              <ChevronRight className="w-12 h-12" />
            </button>

            {/* Bottom Metadata Overlay */}
            <motion.div 
              animate={{ y: showUi ? 0 : 100, opacity: showUi ? 1 : 0 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-8"
            >
              <div>
                <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">{new Date(currentMemory.date).getFullYear()}</div>
                <div className="text-white font-serif italic text-lg">{currentMemory.name}</div>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex -space-x-2">
                {currentMemory.tags.personIds.slice(0, 3).map(pid => (
                  <div key={pid} className="w-8 h-8 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                    {tree.people.find(p => p.id === pid)?.name.charAt(0)}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* View Mode: Grid (Top-Down) */}
        {viewMode === 'grid' && (
          <div className="flex-1 overflow-y-auto p-8 pt-32">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {filteredMemories.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => { setCurrentIndex(idx); setViewMode('theatre'); }}
                  className="aspect-square bg-white/5 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#c5a059] transition-all relative group"
                >
                  <img src={m.photoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="absolute bottom-3 left-3 text-white text-xs font-bold truncate w-full pr-6">{m.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
