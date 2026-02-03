import { Download, Package, FileJson } from 'lucide-react';
import type { MemoryTree } from '../../types';

interface ExportTabProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function ExportTab({ tree, onExport }: ExportTabProps) {
  const totalSize = tree.memories.reduce((acc, m) => {
    return acc + (m.photoUrl ? 2 : 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Export Archive</h1>
        <p className="text-slate-50/60">Download your entire family archive in your preferred format</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="text-3xl font-bold gradient-text mb-2">{tree.memories.length}</div>
          <p className="text-sm text-slate-50/60">Total artifacts</p>
        </div>
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="text-3xl font-bold gradient-text mb-2">{tree.people.length}</div>
          <p className="text-sm text-slate-50/60">Family members</p>
        </div>
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="text-3xl font-bold gradient-text mb-2">~{totalSize}MB</div>
          <p className="text-sm text-slate-50/60">Estimated size</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ZIP Export */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900 hover:border-blue-500 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-50 text-lg mb-2">ZIP Archive</h3>
              <p className="text-sm text-slate-50/60 mb-4">
                Complete archive with all metadata, media files, and family information in a compressed ZIP file.
              </p>
              <button
                onClick={() => onExport('ZIP')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
            </div>
          </div>
        </div>

        {/* PDF Export */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900 hover:border-purple-500 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <FileJson className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-50 text-lg mb-2">PDF Memory Book</h3>
              <p className="text-sm text-slate-50/60 mb-4">
                Beautiful, printable PDF memory book with photos, dates, and family information formatted for sharing.
              </p>
              <button
                onClick={() => onExport('PDF')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 p-6 rounded-lg border border-slate-700 bg-slate-900/50">
        <h3 className="font-semibold text-slate-50 mb-4">Export Information</h3>
        <ul className="space-y-2 text-sm text-slate-50/70">
          <li>• All media files are included at full resolution</li>
          <li>• Metadata includes dates, people, and tags</li>
          <li>• All data is encrypted and secure</li>
          <li>• Downloads are created on-demand and temporary</li>
          <li>• ZIP format supports all media types and is fully compatible</li>
          <li>• PDF format is ideal for printing and sharing</li>
        </ul>
      </div>
    </div>
  );
}
