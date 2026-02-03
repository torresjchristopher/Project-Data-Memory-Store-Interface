import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { MemoryTree } from '../../types';

interface SearchTabProps {
  tree: MemoryTree;
}

export default function SearchTab({ tree }: SearchTabProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    return tree.memories.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      m.tags.customTags?.some((t: string) => t.toLowerCase().includes(q)) ||
      tree.people.some(p => 
        m.tags.personIds.includes(p.id) && 
        p.name.toLowerCase().includes(q)
      )
    );
  }, [query, tree.memories, tree.people]);

  const getPersonName = (personId: string) => {
    return tree.people.find(p => p.id === personId)?.name || 'Unknown';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-4">Search Archive</h1>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-50/40" />
          <input
            type="text"
            placeholder="Search by name, description, tags, or people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div>
        {query.trim() === '' ? (
          <div className="text-center py-16">
            <p className="text-slate-50/60">Enter a search term to find memories</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-50/60">No results found for "{query}"</p>
          </div>
        ) : (
          <div>
            <p className="text-slate-50/60 mb-6">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-3">
              {results.map(memory => (
                <div
                  key={memory.id}
                  className="p-4 rounded-lg border border-slate-700 bg-slate-900 hover:border-blue-500 hover:bg-slate-900/80 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {memory.type === 'image' && memory.photoUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-foreground/10">
                        <img
                          src={memory.photoUrl}
                          alt={memory.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-50 mb-2">{memory.name}</h3>
                      
                      {memory.description && (
                        <p className="text-sm text-slate-50/60 mb-2 line-clamp-2">{memory.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-slate-50/50">
                        <span>{new Date(memory.date).toLocaleDateString()}</span>
                        {memory.tags.personIds.length > 0 && (
                          <span>
                            People: {memory.tags.personIds.map(getPersonName).join(', ')}
                          </span>
                        )}
                        {memory.tags.customTags && memory.tags.customTags.length > 0 && (
                          <span>Tags: {memory.tags.customTags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
