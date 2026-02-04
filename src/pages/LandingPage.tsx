import { useState, useEffect } from 'react';
import { Lock, CloudOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onUnlock: () => void;
  itemCount?: number;
  error?: string | null;
}

export default function LandingPage({ onUnlock, itemCount = 0, error = null }: LandingPageProps) {
  const [password, setPassword] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (password === 'Jackson_Heights') {
      setTimeout(() => onUnlock(), 800);
    } else if (password.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [password, onUnlock]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/20">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none z-0"></div>
      
      {/* Center Focused Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* The Seal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="mb-20 relative"
      >
        <div className={`w-24 h-24 rounded-full border border-white/5 flex items-center justify-center transition-all duration-1000 ${isTyping ? 'border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.03)]' : ''}`}>
          <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center">
            <Lock className={`w-4 h-4 text-white transition-opacity duration-1000 ${isTyping ? 'opacity-100' : 'opacity-10'}`} />
          </div>
        </div>
      </motion.div>

      {/* Elusive Minimal Input */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="w-full max-w-sm px-12 relative z-10"
      >
        <div className="relative group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-none py-4 text-center text-white text-3xl tracking-[0.8em] font-serif focus:ring-0 focus:outline-none placeholder:text-white/5 transition-all duration-700"
            placeholder="••••••"
            autoFocus
          />
          {/* Subtle underline that grows from center */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-white/20 transition-all duration-1000 ${isTyping ? 'w-full opacity-40' : 'w-0 opacity-0'}`}></div>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-12 flex flex-col items-center gap-4 text-white text-[9px] uppercase tracking-[0.5em] font-sans font-black text-center"
      >
        <div className="flex items-center gap-3">
          {error ? (
            <div className="flex items-center gap-2 text-red-500/60 font-bold">
              <CloudOff className="w-2 h-2" />
              {error}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500/60">
              <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
              Synchronized // {itemCount} Fragments Loaded
            </div>
          )}
        </div>
        <div className="text-white/20">Murray Legacy Protocol // Obsidian Edition</div>
      </motion.div>

    </div>
  );
}