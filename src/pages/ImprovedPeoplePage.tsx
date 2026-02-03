import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MemoryTree, Person } from '../types';

interface ImprovedPeoplePageProps {
  tree: MemoryTree;
}

export default function ImprovedPeoplePage({ tree }: ImprovedPeoplePageProps) {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const peopleWithCounts = useMemo(() => {
    return tree.people.map(person => ({
      ...person,
      artifactCount: tree.memories.filter(m =>
        m.tags.personIds.includes(person.id)
      ).length
    })).sort((a, b) => b.artifactCount - a.artifactCount);
  }, [tree]);

  const handlePersonClick = (personId: string) => {
    setSelectedPerson(personId);
    navigate(`/gallery?person=${personId}`);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string): string => {
    const colors = [
      'from-blue-600 to-blue-400',
      'from-purple-600 to-purple-400',
      'from-pink-600 to-pink-400',
      'from-emerald-600 to-emerald-400',
      'from-amber-600 to-amber-400',
      'from-rose-600 to-rose-400',
      'from-cyan-600 to-cyan-400',
      'from-indigo-600 to-indigo-400',
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-gray-100">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-gray-100 transition text-sm font-medium flex items-center gap-2"
          >
            ← Back to Archive
          </button>
          <h1 className="text-2xl font-bold text-gray-50">Family Members</h1>
          <div className="w-32"></div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-24 px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* INTRO */}
          <div className="mb-12">
            <p className="text-gray-300 text-lg max-w-2xl">
              Browse artifacts by family member. Click on a card to view their related memories and photos.
            </p>
          </div>

          {/* PEOPLE GRID */}
          {peopleWithCounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {peopleWithCounts.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  artifactCount={person.artifactCount}
                  isSelected={selectedPerson === person.id}
                  onSelect={() => handlePersonClick(person.id)}
                  avatarColor={getAvatarColor(person.id)}
                  initials={getInitials(person.name)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4 text-gray-600">👥</div>
              <p className="text-gray-400 text-lg">No family members added yet</p>
              <p className="text-gray-500 text-sm mt-2">Add family members to organize your archive</p>
            </div>
          )}
        </div>
      </main>

      {/* STATISTICS FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-navy-900/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div>
            <span className="font-semibold text-gray-200">{peopleWithCounts.length}</span> members
          </div>
          <div>
            <span className="font-semibold text-gray-200">{tree.memories.length}</span> total artifacts
          </div>
          <div>
            <span className="font-semibold text-gray-200">
              {Math.round(tree.memories.length / Math.max(peopleWithCounts.length, 1))}
            </span> avg per member
          </div>
        </div>
      </footer>
    </div>
  );
}

interface PersonCardProps {
  person: Person & { artifactCount: number };
  artifactCount: number;
  isSelected: boolean;
  onSelect: () => void;
  avatarColor: string;
  initials: string;
}

function PersonCard({
  person,
  artifactCount,
  isSelected,
  onSelect,
  avatarColor,
  initials,
}: PersonCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`group text-left transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div
        className={`h-full bg-gradient-to-br from-navy-700/50 to-navy-800/50 border rounded-lg p-6 hover:border-white/30 transition-all hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer ${
          isSelected
            ? 'border-blue-500/50 bg-blue-500/10'
            : 'border-white/10'
        }`}
      >
        {/* AVATAR */}
        <div className="mb-4">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center font-bold text-lg text-white shadow-lg`}
          >
            {initials}
          </div>
        </div>

        {/* NAME */}
        <h3 className="text-lg font-semibold text-gray-50 mb-1 group-hover:text-blue-300 transition">
          {person.name}
        </h3>

        {/* BIRTH YEAR */}
        {(person.birthYear || person.birthDate) && (
          <p className="text-xs text-gray-500 mb-3">
            {person.birthYear || new Date(person.birthDate!).getFullYear()}
          </p>
        )}

        {/* BIO */}
        {person.bio && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {person.bio}
          </p>
        )}

        {/* ARTIFACT COUNT */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="text-2xl font-bold text-blue-400">{artifactCount}</p>
            <p className="text-xs text-gray-500">
              {artifactCount === 1 ? 'artifact' : 'artifacts'}
            </p>
          </div>
          <div className="text-2xl text-gray-600 group-hover:text-gray-400 transition">
            →
          </div>
        </div>

        {/* CLICK HINT */}
        <div className="mt-4 text-xs text-gray-500 group-hover:text-gray-400 transition">
          Click to view gallery
        </div>
      </div>
    </button>
  );
}
