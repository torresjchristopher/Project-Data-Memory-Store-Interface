import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (password === 'Jackson_Heights') {
      setTimeout(() => onUnlock(), 500); // Subtle delay for effect
    } else if (password.length > 0) {
      setIsTyping(true);
      setError(false);
    } else {
      setIsTyping(false);
    }
  }, [password, onUnlock]);

  return (
    <div className="min-h-screen bg-[#05080f] flex flex-col items-center justify-center relative overflow-hidden selection:bg-gold-500/30">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none"></div>

      {/* The Seal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="mb-12 relative"
      >
        <div className={`w-16 h-16 rounded-full border border-[#c5a059]/20 flex items-center justify-center transition-all duration-700 ${isTyping ? 'border-[#c5a059]/60 shadow-[0_0_30px_rgba(197,160,89,0.15)]' : ''}`}>
          <Lock className={`w-5 h-5 text-[#c5a059] transition-opacity duration-500 ${isTyping ? 'opacity-100' : 'opacity-60'}`} />
        </div>
      </motion.div>

      {/* Minimal Input */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
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
            Access Restricted
          </motion.p>
        )}
      </motion.div>

      {/* Footer / Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 text-[#c5a059]/30 text-[9px] uppercase tracking-[0.4em] font-sans"
      >
        Schnitzelbank Archive
      </motion.div>

    </div>
  );
}