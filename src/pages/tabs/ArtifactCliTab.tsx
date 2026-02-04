import { 
  Download, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Monitor,
  CheckCircle2
} from 'lucide-react';

export default function ArtifactCliTab() {
  const specs = [
    { label: 'Runtime', value: 'Python 3.11+', icon: Cpu },
    { label: 'Core RSS', value: '12MB', icon: Monitor },
    { label: 'Data I/O', value: 'Atomic Store', icon: HardDrive },
    { label: 'Integrity', value: 'VaultZero', icon: ShieldCheck },
  ];

  return (
    <div className="text-slate-200 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-[#c5a059] font-black text-[10px] uppercase tracking-[0.5em] italic">Ingestion Interface</span>
        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mt-4">
          Artifact <span className="underline decoration-white/5 underline-offset-8">CLI.</span>
        </h2>
        <p className="text-lg text-slate-400 font-medium italic leading-relaxed max-w-2xl mx-auto pt-4">
          High-caliber ingestion for professional archives. A zero-latency bridge between local storage and the Schnitzelbank sovereign cloud.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Specs Panel */}
        <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <h3 className="text-white font-black text-lg uppercase italic tracking-[0.2em] mb-10">Technical Blueprint</h3>
          <div className="space-y-8">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <spec.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{spec.label}</span>
                </div>
                <span className="text-white font-black italic text-lg">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features & Download */}
        <div className="space-y-8 flex flex-col justify-center">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Bulk Classification</h4>
            <p className="text-slate-500 text-sm font-medium italic">Automated metadata mapping for thousands of artifacts in a single session.</p>
          </div>
          
          <a href="/downloads/artifact-cli-v1.0.zip" className="flex items-center justify-center gap-4 px-12 py-6 bg-[#c5a059] text-[#05080f] rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-[#b48a3e] transition-all hover:scale-105 active:scale-95">
            <Download className="w-5 h-5" />
            Download Binary
          </a>
        </div>
      </div>

      <div className="text-center">
        <a href="https://github.com/torresjchristopher/artifact-cli" target="_blank" className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">View Source Code on GitHub</a>
      </div>
    </div>
  );
}