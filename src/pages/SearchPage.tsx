import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import type { MemoryTree } from '../types';

export default function SearchPage({ tree }: { tree: MemoryTree }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.toLowerCase();
    if(!q) return [];
    return tree.memories.filter(m => m.content.toLowerCase().includes(q)).slice(0, 50);
  }, [tree.memories, query]);

  return (
    <div className="min-h-screen bg-navy-900 text-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 border-b border-white/20 px-6 py-4">
        <button onClick={() => navigate('/')} className="text-gray-300">← Back</button>
      </nav>
      <main className="pt-20 px-6">
        <div className="max-w-4xl mx-auto py-16">
          <h1 className="text-5xl font-black mb-12 text-gray-50">Search</h1>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-md text-gray-100 mb-6" />
          <div className="space-y-2">
            {results.map(m => <div key={m.id} className="border border-white/10 bg-white/5 p-4 rounded">{m.content.split('|')[0]}</div>)}
          </div>
        </div>
      </main>
    </div>
  );
}
