import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';

interface HeaderProps {
  familyName: string;
}

export function Header({ familyName }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center">
      <div className="container mx-auto px-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-4 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-all duration-500">
            <Archive className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-black text-white tracking-tighter uppercase italic">{familyName}</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] -mt-1">Sovereign Archive</span>
          </div>
        </button>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="https://github.com/torresjchristopher/artifact-cli" target="_blank" className="hover:text-blue-400 transition-colors italic">CLI Documentation</a>
          <a href="https://github.com/torresjchristopher/Schnitzelbank-U.I." target="_blank" class="hover:text-blue-400 transition-colors italic">GitHub</a>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="text-slate-700 italic">MURRAY PROTOCOL v4.1</div>
        </div>
      </div>
    </div>
  );
}