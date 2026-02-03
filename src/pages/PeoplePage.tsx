import { useNavigate } from 'react-router-dom';
import type { MemoryTree } from '../types';

export default function PeoplePage({ tree }: { tree: MemoryTree }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy-900 text-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 border-b border-white/20 px-6 py-4">
        <button onClick={() => navigate('/')} className="text-gray-300">← Back</button>
      </nav>
      <main className="pt-20 px-6">
        <div className="max-w-6xl mx-auto py-16">
          <h1 className="text-5xl font-black mb-12 text-gray-50">People</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tree.people.map((p) => (
              <div key={p.id} onClick={() => navigate('/gallery')} className="border border-white/10 bg-white/5 hover:bg-white/10 p-6 rounded-lg cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-100">{p.name}</h3>
                <p className="text-gray-400 text-sm">{tree.memories.filter(m => m.tags.personIds.includes(p.id)).length} items</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
