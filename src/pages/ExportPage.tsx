import { useNavigate } from 'react-router-dom';
import type { MemoryTree } from '../types';

export default function ExportPage({ onExport }: { tree: MemoryTree; onExport: (f: 'ZIP'|'PDF') => void }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy-900 text-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 border-b border-white/20 px-6 py-4">
        <button onClick={() => navigate('/')} className="text-gray-300">← Back</button>
      </nav>
      <main className="pt-20 px-6">
        <div className="max-w-6xl mx-auto py-16">
          <h1 className="text-5xl font-black mb-12 text-gray-50">Export</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => onExport('ZIP')} className="border border-white/10 bg-white/5 p-8 rounded-lg hover:bg-white/10">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">ZIP Archive</h2>
              <p className="text-gray-400">Export as ZIP with folder structure</p>
            </button>
            <button onClick={() => onExport('PDF')} className="border border-white/10 bg-white/5 p-8 rounded-lg hover:bg-white/10">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Memory Book PDF</h2>
              <p className="text-gray-400">Export as beautiful PDF</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
