import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MemoryTree } from '../types';

interface GalleryPreviewLandingProps {
  tree?: MemoryTree;
}

export default function GalleryPreviewLanding({ tree }: GalleryPreviewLandingProps) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Get all images for carousel
  const images = useMemo(() => {
    if (!tree) return [];
    
    return tree.memories
      .filter(m => m.type === 'image')
      .map(m => {
        const parts = m.content.split('|DELIM|');
        return {
          url: parts[1] || '',
          title: parts[0] || 'Untitled',
          memory: m,
        };
      })
      .filter(img => img.url.startsWith('http'));
  }, [tree]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoRotate || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoRotate, images.length]);

  // Handle arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
        setAutoRotate(false);
      }
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
        setAutoRotate(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-navy-900 text-gray-100 flex items-center justify-center overflow-hidden relative">
      {/* BACKGROUND CAROUSEL */}
      <div className="absolute inset-0">
        {currentImage && (
          <>
            {/* IMAGE */}
            <div className="absolute inset-0">
              <img
                src={currentImage.url}
                alt={currentImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/75 to-navy-900/85" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.4),rgba(0,0,0,0.8))]" />
          </>
        )}

        {/* FALLBACK GRADIENT */}
        {!currentImage && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.08),transparent_55%)]" />
          </>
        )}
      </div>

      {/* CAROUSEL CONTROLS */}
      {images.length > 0 && (
        <>
          {/* LEFT ARROW */}
          <button
            onClick={() => {
              setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
              setAutoRotate(false);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 hidden md:flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={() => {
              setCurrentImageIndex(prev => (prev + 1) % images.length);
              setAutoRotate(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 hidden md:flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* DOT INDICATORS */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentImageIndex(idx);
                  setAutoRotate(false);
                }}
                className={`rounded-full transition-all ${
                  idx === currentImageIndex
                    ? 'w-3 h-3 bg-blue-400'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* PLAY/PAUSE */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="absolute bottom-8 right-8 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium"
          >
            {autoRotate ? '⏸' : '▶'}
          </button>
        </>
      )}

      {/* MAIN CONTENT OVERLAY */}
      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-20 max-w-5xl mx-auto text-center">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-gray-50 drop-shadow-lg">
            Yukora
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-4 drop-shadow-md font-light">
            Institutional Archive
          </p>
          <p className="text-gray-300 text-lg drop-shadow-md max-w-2xl mx-auto">
            Preserve family memories and artifacts with professional archival tools
          </p>
        </div>

        {/* NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
          <NavButton
            label="Gallery"
            description="Browse and explore all artifacts"
            icon="image"
            onClick={() => navigate('/gallery')}
            highlight
          />

          <NavButton
            label="People"
            description="Browse by family member"
            icon="users"
            onClick={() => navigate('/people')}
          />

          <NavButton
            label="Search"
            description="Find artifacts by metadata"
            icon="tag"
            onClick={() => navigate('/search')}
          />

          <NavButton
            label="Artifact CLI"
            description="Command-line tools and ingest"
            icon="download"
            onClick={() => navigate('/artifact-cli')}
          />

          <NavButton
            label="Export"
            description="Download archive as ZIP or PDF"
            icon="export"
            onClick={() => navigate('/export')}
          />

          <NavButton
            label="Downloads"
            description="Get CLI and tools"
            icon="download"
            onClick={() => navigate('/downloads')}
          />
        </div>

        {/* STATS */}
        {tree && (
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <div>
              <p className="text-2xl font-bold text-blue-300">{tree.memories.length}</p>
              <p className="text-xs text-gray-400 mt-1">Artifacts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-300">{tree.people.length}</p>
              <p className="text-xs text-gray-400 mt-1">Family Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-300">{tree.familyName}</p>
              <p className="text-xs text-gray-400 mt-1">Family</p>
            </div>
          </div>
        )}

        {/* FOOTER TEXT */}
        <p className="text-center text-gray-400 text-xs mt-8">
          © 2026 Yukora Archive • Professional Family Record Management
        </p>
      </div>
    </div>
  );
}

interface NavButtonProps {
  label: string;
  description: string;
  icon: string;
  onClick: () => void;
  highlight?: boolean;
}

function NavButton({ label, description, icon, onClick, highlight }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-lg border backdrop-blur-sm transition-all text-left p-6 ${
        highlight
          ? 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400 shadow-lg shadow-blue-500/20'
          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-lg font-semibold ${highlight ? 'text-blue-200' : 'text-gray-100 group-hover:text-blue-300'} transition`}>
          {label}
        </h3>
        <div className={`text-2xl transition-transform group-hover:scale-110 ${highlight ? 'text-blue-300' : 'text-gray-400 group-hover:text-blue-300'}`}>
          {icon === 'image' && '🖼️'}
          {icon === 'users' && '👥'}
          {icon === 'tag' && '🔍'}
          {icon === 'export' && '📤'}
          {icon === 'download' && '⬇️'}
        </div>
      </div>
      <p className="text-gray-300 text-sm group-hover:text-gray-200 transition">
        {description}
      </p>
    </button>
  );
}
