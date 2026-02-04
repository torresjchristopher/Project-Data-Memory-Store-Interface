import { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  Terminal, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X,
  FileArchive
} from 'lucide-react';
import type { MemoryTree, Memory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ArtifactCliTab from './tabs/ArtifactCliTab';

interface DashboardProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function Dashboard({ tree, onExport }: DashboardProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showCli, setShowCli] = useState(false);
  const [filterPerson, setFilterPerson] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract Years
  const years = useMemo(() => {
    const y = new Set<string>();
    tree.memories.forEach(m => y.add(new Date(m.date).getFullYear().toString()));
    return Array.from(y).sort().reverse();
  }, [tree.memories]);

  // Filter Logic
  const filteredMemories = useMemo(() => {
    return tree.memories.filter(m => {
      const matchPerson = !filterPerson || m.tags.personIds.includes(filterPerson);
      const matchYear = !filterYear || new Date(m.date).getFullYear().toString() === filterYear;
      const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPerson && matchYear && matchSearch;
    });
  }, [tree.memories, filterPerson, filterYear, searchQuery]);

  // Keyboard Nav for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMemory) return;
      const idx = filteredMemories.findIndex(m => m.id === selectedMemory.id);
      if (e.key === 'ArrowLeft' && idx > 0) setSelectedMemory(filteredMemories[idx - 1]);
      if (e.key === 'ArrowRight' && idx < filteredMemories.length - 1) setSelectedMemory(filteredMemories[idx + 1]);
      if (e.key === 'Escape') setSelectedMemory(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemory, filteredMemories]);

  return (
    <div className="min-h-screen bg-[#05080f] text-[#e2e8f0] font-sans selection:bg-[#c5a059]/30">
      
      {/* CLI Modal/Drawer */}
      <AnimatePresence>
        {showCli && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#05080f] overflow-y-auto"
          >
            <div className="p-8">
              <button onClick={() => setShowCli(false)} className="mb-8 flex items-center gap-2 text-[#c5a059] font-bold uppercase tracking-widest text-xs hover:opacity-80">
                <X className="w-4 h-4" /> Close Interface
              </button>
              <ArtifactCliTab />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Control Bar */}
      <header className="sticky top-0 z-40 bg-[#05080f]/90 backdrop-blur-xl border-b border-[#c5a059]/10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
          
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#c5a059] rounded-sm flex items-center justify-center shadow-lg">
              <span className="font-serif font-black text-[#05080f] text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide uppercase">Schnitzelbank</h1>
              <p className="text-[10px] text-[#c5a059] font-bold uppercase tracking-[0.3em]">Archive Dashboard</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-1 max-w-2xl gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search archive..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a1120] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#c5a059]/50 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            
            <select 
              value={filterPerson} 
              onChange={(e) => setFilterPerson(e.target.value)}
              className="bg-[#0a1120] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#c5a059]/50 focus:outline-none appearance-none text-slate-300 font-medium cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="">All Subjects</option>
              {tree.people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-[#0a1120] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#c5a059]/50 focus:outline-none appearance-none text-slate-300 font-medium cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="">All Eras</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setShowCli(true)} className="p-3 bg-[#0a1120] border border-white/5 rounded-xl text-slate-400 hover:text-[#c5a059] hover:border-[#c5a059]/30 transition-all" title="Artifact CLI">
              <Terminal className="w-5 h-5" />
            </button>
            <button onClick={() => onExport('ZIP')} className="flex items-center gap-2 px-6 py-3 bg-[#c5a059] text-[#05080f] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#b48a3e] transition-all shadow-lg hover:shadow-[#c5a059]/20">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredMemories.length} Artifacts Found</span>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredMemories.map((memory, i) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedMemory(memory)}
              className="break-inside-avoid group relative bg-[#0a1120] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-[#c5a059]/40 transition-all duration-500 shadow-xl"
            >
              {memory.photoUrl ? (
                <div className="relative">
                  <img src={memory.photoUrl} alt={memory.name} className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] text-[#c5a059] font-bold uppercase tracking-widest mb-1">{new Date(memory.date).getFullYear()}</p>
                    <h3 className="text-white font-serif italic text-lg leading-tight group-hover:text-[#c5a059] transition-colors">{memory.name}</h3>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] flex flex-col items-center justify-center p-6 text-center">
                  <FileArchive className="w-12 h-12 text-slate-700 mb-4" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Document</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* THEATRE MODE (Lightbox) */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#05080f]/98 backdrop-blur-3xl flex"
          >
            {/* Visual */}
            <div className="flex-1 relative flex items-center justify-center p-12">
              <button onClick={() => setSelectedMemory(null)} className="absolute top-8 left-8 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-50">
                <X className="w-6 h-6" />
              </button>
              
              <img src={selectedMemory.photoUrl} alt={selectedMemory.name} className="max-w-full max-h-full object-contain shadow-2xl rounded-sm border border-white/5" />

              {/* Nav */}
              <button onClick={() => {
                const idx = filteredMemories.findIndex(m => m.id === selectedMemory.id);
                if (idx > 0) setSelectedMemory(filteredMemories[idx - 1]);
              }} className="absolute left-8 top-1/2 -translate-y-1/2 p-6 text-white/20 hover:text-[#c5a059] transition-colors">
                <ChevronLeft className="w-12 h-12" />
              </button>
              <button onClick={() => {
                const idx = filteredMemories.findIndex(m => m.id === selectedMemory.id);
                if (idx < filteredMemories.length - 1) setSelectedMemory(filteredMemories[idx + 1]);
              }} className="absolute right-8 top-1/2 -translate-y-1/2 p-6 text-white/20 hover:text-[#c5a059] transition-colors">
                <ChevronRight className="w-12 h-12" />
              </button>
            </div>

            {/* Sidebar Metadata */}
            <div className="w-96 bg-[#0a1120] border-l border-white/5 p-10 flex flex-col overflow-y-auto">
              <div className="space-y-8 flex-1">
                <div>
                  <span className="text-[9px] font-bold text-[#c5a059] uppercase tracking-[0.3em]">Artifact Detail</span>
                  <h2 className="text-4xl font-serif text-white mt-4 leading-tight italic">{selectedMemory.name}</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</span>
                    <span className="text-white font-serif italic text-lg">{new Date(selectedMemory.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Subjects</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.tags.personIds.map(pid => (
                        <span key={pid} className="px-3 py-1 bg-white/5 rounded-md text-[10px] font-bold text-[#c5a059] uppercase tracking-wider">
                          {tree.people.find(p => p.id === pid)?.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Description</span>
                    <p className="text-sm text-slate-400 leading-relaxed font-light">
                      {selectedMemory.description || "No archival notes available."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <a href={selectedMemory.photoUrl} download className="flex items-center justify-center gap-3 w-full py-4 bg-[#c5a059] text-[#05080f] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b48a3e] transition-all rounded-lg">
                  <Download className="w-4 h-4" /> Download Original
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
