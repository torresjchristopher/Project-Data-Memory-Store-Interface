import { useMemo } from 'react';
import { User, ShieldCheck } from 'lucide-react';
import type { MemoryTree } from '../../types';

interface PeopleTabProps {
  tree: MemoryTree;
}

export default function PeopleTab({ tree }: PeopleTabProps) {
  const peopleWithCounts = useMemo(() => {
    return tree.people.map(person => ({
      ...person,
      artifactCount: tree.memories.filter(m =>
        m.tags.personIds.includes(person.id)
      ).length
    })).sort((a, b) => b.artifactCount - a.artifactCount);
  }, [tree]);

  return (
    <div className="container mx-auto px-10 py-16 text-slate-200">
      <div className="mb-20 space-y-4">
        <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.5em] italic">Subject Registry</span>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase">
          Sovereign <span className="underline decoration-white/5 underline-offset-8">LINEAGE.</span>
        </h1>
        <p className="text-xl text-slate-400 font-medium italic leading-relaxed max-w-2xl pt-4">
          The verified roster of subjects within the {tree.familyName} collection. Each profile is cryptographically linked to their respective artifacts.
        </p>
      </div>

      {tree.people.length === 0 ? (
        <div className="py-32 text-center">
          <div className="text-6xl mb-6 opacity-20">👥</div>
          <h3 className="text-2xl font-black text-slate-700 italic uppercase">Registry Empty.</h3>
          <p className="text-slate-600 font-medium italic mt-2">Initialize subjects via the Artifact CLI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {peopleWithCounts.map(person => (
            <div
              key={person.id}
              className="group glass p-10 rounded-[3rem] border-white/5 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
              
              <div className="relative space-y-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-500/20 transition-colors">
                  <User className="w-8 h-8 text-blue-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">{person.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                    <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
                    Verified Subject
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Artifacts</div>
                    <div className="text-xl font-black text-white italic">{person.artifactCount}</div>
                  </div>
                  {person.birthDate && (
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Birth Era</div>
                      <div className="text-xl font-black text-white italic">{new Date(person.birthDate).getFullYear()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}