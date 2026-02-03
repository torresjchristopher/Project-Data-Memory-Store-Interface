import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MemoryTree, Memory } from '../types';
import { buildFolderStructure, findItemByPath, type FolderItem } from '../utils/folderStructure';

interface ImprovedGalleryPageProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function ImprovedGalleryPage({ tree, onExport }: ImprovedGalleryPageProps) {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FolderItem | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const rootFolder = useMemo(() => buildFolderStructure(tree), [tree]);

  const currentFolder = useMemo(() => {
    return findItemByPath(rootFolder, currentPath) || rootFolder;
  }, [rootFolder, currentPath]);

  const breadcrumbs = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ name: 'Archive', path: '/' }];
    let pathBuilder = '';
    
    parts.forEach(part => {
      pathBuilder += `/${part}`;
      crumbs.push({ name: part, path: pathBuilder });
    });
    return crumbs;
  }, [currentPath]);

  const getFolderItemsAsMemories = (): Array<{ item: FolderItem; memory?: Memory }> => {
    const items = currentFolder.children || [];
    return items.map(item => ({
      item,
      memory: tree.memories.find(m => m.id === (item.data as any)?.id)
    }));
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set([...prev, id]));
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const items = getFolderItemsAsMemories();
  const imageItems = items.filter(({ memory }) => memory?.type === 'image');

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition hidden md:block"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-gray-100 transition text-sm font-medium"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-50">Archive Gallery</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-navy-900/50 border-r border-white/10 flex-shrink-0 overflow-y-auto transition-all duration-300 hidden md:block`}
        >
          <div className="p-4 space-y-2">
            <FolderTree
              folder={rootFolder}
              currentPath={currentPath}
              onNavigate={setCurrentPath}
              level={0}
            />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* BREADCRUMBS */}
          <div className="bg-navy-900/30 border-b border-white/10 px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-2 text-sm overflow-x-auto max-w-7xl mx-auto">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  {idx > 0 && <span className="text-gray-500">/</span>}
                  <button
                    onClick={() => setCurrentPath(crumb.path)}
                    className={`text-gray-300 hover:text-gray-100 transition ${
                      idx === breadcrumbs.length - 1 ? 'font-semibold text-gray-50' : ''
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* GALLERY GRID */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {imageItems.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">{imageItems.length} images</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {imageItems.map(({ item, memory }) => {
                      const isLoaded = loadedImages.has(item.name);
                      const parts = (item.data as any)?.content?.split('|DELIM|') || [];
                      const title = parts[0] || item.name;
                      const imageUrl = parts[1] || '';
                      const timestamp = (item.data as any)?.timestamp;

                      return (
                        <div
                          key={item.name}
                          onClick={() => setSelectedItem(item)}
                          className="group cursor-pointer"
                        >
                          {/* IMAGE CARD */}
                          <div className="relative bg-navy-700/50 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition aspect-square">
                            {/* SKELETON LOADER */}
                            {!isLoaded && (
                              <div className="absolute inset-0 bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700 animate-pulse" />
                            )}

                            {/* IMAGE */}
                            <img
                              src={imageUrl}
                              alt={title}
                              onLoad={() => handleImageLoad(item.name)}
                              className={`w-full h-full object-cover transition-opacity ${
                                isLoaded ? 'opacity-100' : 'opacity-0'
                              }`}
                            />

                            {/* OVERLAY */}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* METADATA */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                              <h3 className="text-sm font-semibold text-gray-50 truncate">{title}</h3>
                              {timestamp && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(timestamp).toLocaleDateString()}
                                </p>
                              )}
                              {memory?.tags.personIds.length! > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {memory?.tags.personIds.slice(0, 2).map((pid: string) => {
                                    const person = tree.people.find(p => p.id === pid);
                                    return (
                                      <span key={pid} className="text-xs px-2 py-1 bg-blue-500/30 text-blue-200 rounded">
                                        {person?.name}
                                      </span>
                                    );
                                  })}
                                  {memory?.tags.personIds.length! > 2 && (
                                    <span className="text-xs px-2 py-1 bg-blue-500/30 text-blue-200 rounded">
                                      +{memory?.tags.personIds.length! - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-4 text-gray-600">📁</div>
                  <p className="text-gray-400 text-lg">No images in this folder</p>
                  <p className="text-gray-500 text-sm mt-2">Navigate to a folder with images or use the sidebar</p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <footer className="bg-navy-900/50 border-t border-white/10 px-4 sm:px-6 py-4 flex justify-end gap-3 max-w-7xl mx-auto w-full">
            <button
              onClick={() => onExport('ZIP')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Export ZIP
            </button>
            <button
              onClick={() => onExport('PDF')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Export PDF
            </button>
          </footer>
        </main>
      </div>

      {/* LIGHTBOX */}
      {selectedItem && (
        <Lightbox
          item={selectedItem}
          tree={tree}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

interface FolderTreeProps {
  folder: FolderItem;
  currentPath: string;
  onNavigate: (path: string) => void;
  level: number;
}

function FolderTree({ folder, currentPath, onNavigate, level }: FolderTreeProps) {
  const [expanded, setExpanded] = useState(level === 0);
  
  const children = folder.children?.filter(c => c.type === 'folder') || [];
  const images = folder.children?.filter(c => c.type === 'memory') || [];

  const folderPath = folder.path || '/';
  const isActive = currentPath === folderPath;

  return (
    <div>
      <button
        onClick={() => {
          onNavigate(folderPath);
          if (children.length > 0) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
          isActive
            ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30'
            : 'text-gray-300 hover:bg-white/5'
        }`}
      >
        {children.length > 0 && (
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
        {children.length === 0 && <div className="w-4" />}
        📁
        <span className="truncate">{folder.name}</span>
        {images.length > 0 && (
          <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
            {images.length}
          </span>
        )}
      </button>

      {expanded && children.length > 0 && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
          {children.map((child) => (
            <FolderTree
              key={child.path}
              folder={child}
              currentPath={currentPath}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LightboxProps {
  item: FolderItem;
  tree: MemoryTree;
  onClose: () => void;
}

function Lightbox({ item, tree, onClose }: LightboxProps) {
  const parts = (item.data as any)?.content?.split('|DELIM|') || [];
  const title = parts[0] || item.name;
  const imageUrl = parts[1] || '';
  const timestamp = (item.data as any)?.timestamp;
  const personIds = (item.data as any)?.tags?.personIds || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-navy-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-50 truncate">{title}</h3>
            {timestamp && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-white/10 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* IMAGE */}
        <div className="flex-1 overflow-y-auto bg-black/50 p-6 flex items-center justify-center">
          <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain" />
        </div>

        {/* METADATA */}
        {personIds.length > 0 && (
          <div className="px-6 py-4 bg-navy-900/50 border-t border-white/10">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">People</p>
            <div className="flex flex-wrap gap-2">
              {personIds.map((pid: string) => {
                const person = tree.people.find(p => p.id === pid);
                return (
                  <span key={pid} className="px-3 py-1.5 bg-blue-600/30 text-blue-200 text-sm rounded-full border border-blue-500/30">
                    {person?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-6 py-4 bg-navy-900/50 border-t border-white/10 flex justify-end">
          <a
            href={imageUrl}
            download={title}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Download Original
          </a>
        </div>
      </div>
    </div>
  );
}
