import { useNavigate } from 'react-router-dom';
import ModernGallery from '../components/ModernGallery';
import type { MemoryTree } from '../types';

export default function GalleryPage({ tree, onExport }: { tree: MemoryTree; onExport: (f: 'ZIP'|'PDF') => void }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 px-6 py-3">
        <button onClick={() => navigate('/')} className="text-gray-900 font-semibold">← Back</button>
      </div>
      <div className="pt-14"><ModernGallery tree={tree} onExport={onExport} /></div>
    </div>
  );
}
