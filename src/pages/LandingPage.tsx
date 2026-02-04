import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onUnlock: () => void;
}

export default function LandingPage({ onUnlock }: LandingPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (password === 'Jackson_Heights') {
      // Success animation delay
      setTimeout(() => onUnlock(), 800);
    } else if (password.length > 0) {
      setIsTyping(true);
      setError(false);
    } else {
      setIsTyping(false);
    }
  }, [password, onUnlock]);

  return (
    <div className="min-h-screen bg-[#05080f] flex flex-col items-center justify-center relative overflow-hidden selection:bg-[#c5a059]/30">
      
      {/* Background Texture & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* The Seal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="mb-16 relative"
      >
        <div className={`w-20 h-20 rounded-full border border-[#c5a059]/20 flex items-center justify-center transition-all duration-1000 ${isTyping ? 'border-[#c5a059]/60 shadow-[0_0_40px_rgba(197,160,89,0.1)]' : ''}`}>
          <Lock className={`w-6 h-6 text-[#c5a059] transition-opacity duration-500 ${isTyping ? 'opacity-100' : 'opacity-60'}`} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-serif text-white tracking-widest uppercase mb-2">Schnitzelbank</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Restricted Archive Access</p>
      </motion.div>

      {/* Minimal Input */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="w-full max-w-xs relative"
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border-b border-[#c5a059]/20 py-3 text-center text-[#c5a059] text-xl tracking-[0.5em] font-serif focus:outline-none focus:border-[#c5a059]/60 transition-all placeholder:text-[#c5a059]/10"
          placeholder="••••••"
          autoFocus
        />
        
        {/* Error State */}
        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute -bottom-8 left-0 right-0 text-center text-red-900/50 text-[10px] font-sans tracking-widest uppercase"
          >
            Access Denied
          </motion.p>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 text-[#c5a059] text-[9px] uppercase tracking-[0.4em] font-sans"
      >
        Murray Legacy Protocol v4.1
      </motion.div>

    </div>
  );
}
