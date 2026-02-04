import { Download, Package, FileJson, Info } from 'lucide-react';
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
    <div className="container mx-auto px-10 py-16 text-slate-200">
      <div className="mb-20 space-y-4">
        <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.5em] italic">Data Portability</span>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase">
          Archive <span className="underline decoration-white/5 underline-offset-8">EXPORT.</span>
        </h1>
        <p className="text-xl text-slate-400 font-medium italic leading-relaxed max-w-2xl pt-4">
          Request a full extraction of the {tree.familyName} digital legacy. High-resolution media and metadata bundled for local preservation.
        </p>
      </div>

      {/* Institutional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="glass p-10 rounded-[2.5rem] border-white/5">
          <div className="text-4xl font-black text-white italic mb-2 tracking-tighter">{tree.memories.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Classified Artifacts</div>
        </div>
        <div className="glass p-10 rounded-[2.5rem] border-white/5">
          <div className="text-4xl font-black text-white italic mb-2 tracking-tighter">{tree.people.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Associated Subjects</div>
        </div>
        <div className="glass p-10 rounded-[2.5rem] border-white/5">
          <div className="text-4xl font-black text-white italic mb-2 tracking-tighter">~{totalSize}MB</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Extraction Volume</div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass p-12 rounded-[3rem] border-white/5 group hover:border-blue-500/30 transition-all">
          <div className="flex items-start gap-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">ZIP Complete Archive</h3>
                <p className="text-slate-500 text-sm font-medium italic leading-relaxed">
                  Full resolution media, JSON metadata schemas, and subject profiles compiled into a single atomic container.
                </p>
              </div>
              <button
                onClick={() => onExport('ZIP')}
                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                Initialize Extraction
              </button>
            </div>
          </div>
        </div>

        <div className="glass p-12 rounded-[3rem] border-white/5 group hover:border-purple-500/30 transition-all">
          <div className="flex items-start gap-8">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
              <FileJson className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">PDF Document Record</h3>
                <p className="text-slate-500 text-sm font-medium italic leading-relaxed">
                  A high-fidelity visual record of the entire archive, formatted for print and physical storage protocols.
                </p>
              </div>
              <button
                onClick={() => onExport('PDF')}
                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                Generate Record
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Info */}
      <div className="mt-16 bg-slate-950/50 border border-white/5 rounded-3xl p-10 flex gap-6 items-start">
        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Extraction Protocols</h4>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-2 text-[10px] font-bold text-slate-600 uppercase italic tracking-widest">
            <div className="flex items-center gap-2"><span className="text-blue-500">●</span> Local-first encryption active</div>
            <div className="flex items-center gap-2"><span className="text-blue-500">●</span> Media bitrates maintained at 100%</div>
            <div className="flex items-center gap-2"><span className="text-blue-500">●</span> Metadata parity with Firestore v4</div>
            <div className="flex items-center gap-2"><span className="text-blue-500">●</span> Atomic export integrity check</div>
          </div>
        </div>
      </div>
    </div>
  );
}