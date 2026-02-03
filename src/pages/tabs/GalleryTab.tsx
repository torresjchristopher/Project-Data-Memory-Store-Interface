import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, X, Zap } from 'lucide-react';
import type { MemoryTree, Memory } from '../../types';

interface GalleryTabProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc';
type FilterType = 'all' | 'image' | 'video' | 'document';

interface Filters {
  type: FilterType;
  personIds: string[];
  dateRange: [string | null, string | null];
  tags: string[];
}

export default function GalleryTab({ tree }: GalleryTabProps) {
  const [sort, setSort] = useState<SortOption>('latest');
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    personIds: [],
    dateRange: [null, null],
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tree.memories.forEach(m => {
      m.tags.customTags?.forEach((t: string) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [tree.memories]);

  const filteredAndSorted = useMemo(() => {
    let results = [...tree.memories];

    if (filters.type !== 'all') {
      results = results.filter(m => m.type === filters.type);
    }

    if (filters.personIds.length > 0) {
      results = results.filter(m =>
        filters.personIds.some(pid => m.tags.personIds.includes(pid))
      );
    }

    if (filters.tags.length > 0) {
      results = results.filter(m =>
        filters.tags.some(tag => m.tags.customTags?.includes(tag))
      );
    }

    if (filters.dateRange[0] || filters.dateRange[1]) {
      const [startStr, endStr] = filters.dateRange;
      const start = startStr ? new Date(startStr).getTime() : 0;
      const end = endStr ? new Date(endStr).getTime() : Infinity;
      results = results.filter(m => {
        const date = new Date(m.date).getTime();
        return date >= start && date <= end;
      });
    }

    results.sort((a, b) => {
      switch (sort) {
        case 'latest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return results;
  }, [tree.memories, filters, sort]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedMemory) return;
    
    const imageMemories = filteredAndSorted.filter(m => m.type === 'image');
    const currentIndex = imageMemories.findIndex(m => m.id === selectedMemory.id);

    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setSelectedMemory(imageMemories[currentIndex - 1]);
    } else if (e.key === 'ArrowRight' && currentIndex < imageMemories.length - 1) {
      setSelectedMemory(imageMemories[currentIndex + 1]);
    } else if (e.key === 'Escape') {
      setSelectedMemory(null);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemory, filteredAndSorted]);

  const togglePersonFilter = (personId: string) => {
    setFilters(prev => ({
      ...prev,
      personIds: prev.personIds.includes(personId)
        ? prev.personIds.filter(p => p !== personId)
        : [...prev.personIds, personId]
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      personIds: [],
      dateRange: [null, null],
      tags: [],
    });
  };

  const hasActiveFilters = 
    filters.type !== 'all' ||
    filters.personIds.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange[0] ||
    filters.dateRange[1];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-1">Gallery</h1>
          <p className="text-slate-50/60">{filteredAndSorted.length} items</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-slate-700 text-slate-50/60 hover:text-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-50 hover:border-foreground/50 transition-colors"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-8 p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-50">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm text-slate-50/70 block mb-2">Type</label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'image', 'video', 'document'] as FilterType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilters(prev => ({ ...prev, type }))}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.type === type
                        ? 'bg-blue-500 text-white'
                        : 'border border-slate-700 text-slate-50/60 hover:text-slate-50'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* People Filter */}
            <div>
              <label className="text-sm text-slate-50/70 block mb-2">People</label>
              <div className="flex gap-2 flex-wrap">
                {tree.people.map(person => (
                  <button
                    key={person.id}
                    onClick={() => togglePersonFilter(person.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.personIds.includes(person.id)
                        ? 'bg-purple-500 text-white'
                        : 'border border-slate-700 text-slate-50/60 hover:text-slate-50'
                    }`}
                  >
                    {person.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm text-slate-50/70 block mb-2">Tags</label>
                <div className="flex gap-2 flex-wrap">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-indigo-500 text-white'
                          : 'border border-slate-700 text-slate-50/60 hover:text-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-50/60 mb-4">No items match your filters</p>
          <button
            onClick={clearFilters}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSorted.map((memory) => (
            <div
              key={memory.id}
              onClick={() => setSelectedMemory(memory)}
              className="group cursor-pointer rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              {memory.type === 'image' && memory.photoUrl && (
                <div className="aspect-square overflow-hidden bg-foreground/10">
                  <img
                    src={memory.photoUrl}
                    alt={memory.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              {memory.type === 'video' && (
                <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
              )}
              {memory.type === 'document' && (
                <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <span className="text-lg font-semibold text-slate-50">DOC</span>
                </div>
              )}
              
              <div className="p-3 bg-slate-900 border-t border-slate-700">
                <p className="font-semibold text-slate-50 truncate">{memory.name}</p>
                <p className="text-sm text-slate-50/60 mt-1">
                  {new Date(memory.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedMemory && selectedMemory.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedMemory(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {selectedMemory.photoUrl && (
              <img
                src={selectedMemory.photoUrl}
                alt={selectedMemory.name}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const images = filteredAndSorted.filter(m => m.type === 'image');
                const currentIdx = images.findIndex(m => m.id === selectedMemory.id);
                if (currentIdx > 0) {
                  setSelectedMemory(images[currentIdx - 1]);
                }
              }}
              className="absolute left-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const images = filteredAndSorted.filter(m => m.type === 'image');
                const currentIdx = images.findIndex(m => m.id === selectedMemory.id);
                if (currentIdx < images.length - 1) {
                  setSelectedMemory(images[currentIdx + 1]);
                }
              }}
              className="absolute right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-4 rounded-lg">
              <h3 className="font-semibold text-white">{selectedMemory.name}</h3>
              <p className="text-sm text-white/70 mt-1">
                {new Date(selectedMemory.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
