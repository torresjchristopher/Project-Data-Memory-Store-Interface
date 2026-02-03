import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';

interface HeaderProps {
  familyName: string;
}

export function Header({ familyName }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Archive className="w-6 h-6" />
            <span className="font-bold text-lg hidden sm:inline">{familyName}</span>
          </button>
          
          <nav className="flex items-center gap-8 text-sm">
            <a href="#docs" className="text-slate-50/60 hover:text-slate-50 transition-colors">
              Documentation
            </a>
            <a href="#github" className="text-slate-50/60 hover:text-slate-50 transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
