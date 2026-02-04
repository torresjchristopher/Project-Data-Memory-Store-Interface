import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import type { MemoryTree } from '../types';
import { motion } from 'framer-motion';

interface LandingPageProps {
  tree: MemoryTree;
}

export default function LandingPage({ tree }: LandingPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-presidential-900 text-presidential-100 font-serif overflow-hidden relative selection:bg-presidential-500/30">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none z-0"></div>
      
      {/* Subtle Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-presidential-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navigation (Minimal) */}
      <nav className="fixed top-0 w-full z-50 px-12 py-8 flex justify-between items-center mix-blend-overlay">
        <div className="text-xs font-sans font-bold tracking-[0.3em] uppercase text-presidential-400 opacity-80">
          Murray Legacy Protocol
        </div>
        <div className="text-xs font-sans font-bold tracking-[0.3em] uppercase text-presidential-100 opacity-60">
          Est. 2026
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        
        {/* Emblem / Seal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="w-24 h-24 rounded-full border border-presidential-500/30 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-presidential-500/10 scale-125"></div>
            <Lock className="w-8 h-8 text-presidential-500 opacity-80" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 text-presidential-50"
        >
          The {tree.familyName || "Murray"} <br/>
          <span className="italic text-presidential-400">Archive</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-2xl text-lg md:text-xl text-presidential-100/60 font-sans font-light leading-relaxed mb-16 tracking-wide"
        >
          A sovereign digital repository preserving {tree.memories.length} artifacts and the lineage of {tree.people.length} subjects.
          Secured by high-caliber encryption.
        </motion.p>

        {/* Access Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button 
            onClick={() => navigate('/app')}
            className="group relative px-12 py-5 bg-transparent border border-presidential-500/30 hover:border-presidential-500 text-presidential-50 font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500"
          >
            <span className="absolute inset-0 bg-presidential-500/0 group-hover:bg-presidential-500/5 transition-all duration-500"></span>
            <span className="flex items-center gap-4">
              Enter The Archive
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 text-presidential-500" />
            </span>
          </button>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-8 flex justify-center text-[10px] font-sans font-medium tracking-[0.2em] text-presidential-700 uppercase">
        Restricted Access • Institutional Use Only
      </footer>
    </div>
  );
}