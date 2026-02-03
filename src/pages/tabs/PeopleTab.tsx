import { useMemo } from 'react';
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

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (id: string): string => {
    const gradients = [
      'from-blue-600 to-blue-400',
      'from-purple-600 to-purple-400',
      'from-pink-600 to-pink-400',
      'from-emerald-600 to-emerald-400',
      'from-amber-600 to-amber-400',
      'from-rose-600 to-rose-400',
      'from-cyan-600 to-cyan-400',
      'from-indigo-600 to-indigo-400',
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-1">People</h1>
        <p className="text-slate-50/60">{tree.people.length} family members</p>
      </div>

      {tree.people.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-50/60">No people in your archive yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {peopleWithCounts.map(person => (
            <div
              key={person.id}
              className="group p-6 rounded-lg border border-slate-700 bg-slate-900 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(person.id)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl font-bold text-white">{getInitials(person.name)}</span>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-slate-50 text-lg mb-2">{person.name}</h3>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-50/60">Artifacts:</span>
                  <span className="text-lg font-semibold text-blue-400">{person.artifactCount}</span>
                </div>
                
                {person.birthDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-50/60">Born:</span>
                    <span className="text-sm">{new Date(person.birthDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
