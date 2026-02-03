import { useNavigate } from 'react-router-dom';
import { Archive, ArrowRight } from 'lucide-react';

interface HeroProps {
  totalArtifacts: number;
  totalPeople: number;
  familyName: string;
}

export function Hero({ totalArtifacts, totalPeople, familyName }: HeroProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-slate-950 to-background -z-10" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700/50 bg-foreground/5 backdrop-blur-sm mb-6">
            <Archive className="w-4 h-4" />
            <span className="text-sm text-slate-50/70">Professional Archival</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 gradient-text">
          {familyName}
          <br />
          <span className="text-slate-50/60">Memory Archive</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-50/70 mb-12 max-w-2xl mx-auto font-light">
          Explore {totalArtifacts} precious moments from {totalPeople} cherished family members. A modern, secure archive for your most treasured memories.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
          <div className="glass-morphism p-6 rounded-lg">
            <div className="text-3xl font-bold gradient-text">{totalArtifacts}</div>
            <div className="text-sm text-slate-50/60 mt-2">Artifacts</div>
          </div>
          <div className="glass-morphism p-6 rounded-lg">
            <div className="text-3xl font-bold gradient-text">{totalPeople}</div>
            <div className="text-sm text-slate-50/60 mt-2">People</div>
          </div>
          <div className="glass-morphism p-6 rounded-lg col-span-2 md:col-span-1">
            <div className="text-3xl font-bold gradient-text">100%</div>
            <div className="text-sm text-slate-50/60 mt-2">Private</div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/app')}
          className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-slate-50 font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          Enter Gallery
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
