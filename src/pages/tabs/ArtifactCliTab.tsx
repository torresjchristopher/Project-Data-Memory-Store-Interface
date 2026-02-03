import { Download, Terminal, Code2, CheckCircle, Zap } from 'lucide-react';

export default function ArtifactCliTab() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Artifact CLI</h1>
        <p className="text-slate-50/60">Command-line interface for managing your family archive</p>
      </div>

      {/* Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-50 mb-6">Installation</h2>
        
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900 mb-6">
          <div className="flex items-start gap-2 mb-4">
            <Terminal className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-50 mb-2">macOS / Linux</p>
              <code className="block p-3 rounded bg-slate-950/50 text-green-400 font-mono text-sm overflow-x-auto">
                curl -L https://artifact.schnitzel.dev/install.sh | bash
              </code>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900 mb-6">
          <div className="flex items-start gap-2 mb-4">
            <Terminal className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-50 mb-2">Windows (PowerShell)</p>
              <code className="block p-3 rounded bg-slate-950/50 text-green-400 font-mono text-sm overflow-x-auto">
                iwr -useb https://artifact.schnitzel.dev/install.ps1 | iex
              </code>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-2 mb-4">
            <Terminal className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-50 mb-2">npm (All Platforms)</p>
              <code className="block p-3 rounded bg-slate-950/50 text-green-400 font-mono text-sm overflow-x-auto">
                npm install -g @schnitzel/artifact-cli
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-50 mb-6">Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Upload Archives', desc: 'Batch upload family memories from your computer' },
            { title: 'Organize Media', desc: 'Tag, categorize, and organize your media files' },
            { title: 'Backup Management', desc: 'Create and manage encrypted backups' },
            { title: 'Data Export', desc: 'Export archives in ZIP, PDF, or JSON formats' },
            { title: 'Metadata Tools', desc: 'Add and edit metadata like dates and people tags' },
            { title: 'Sync Across Devices', desc: 'Keep your archive synchronized across all devices' },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-slate-700 bg-slate-900">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-50 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-50/60">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commands */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-50 mb-6">Common Commands</h2>
        
        <div className="space-y-4">
          {[
            { cmd: 'artifact --version', desc: 'Show CLI version' },
            { cmd: 'artifact init', desc: 'Initialize a new archive' },
            { cmd: 'artifact upload <path>', desc: 'Upload media files' },
            { cmd: 'artifact organize', desc: 'Organize and deduplicate media' },
            { cmd: 'artifact export --format zip', desc: 'Export archive as ZIP' },
            { cmd: 'artifact sync', desc: 'Synchronize with cloud' },
            { cmd: 'artifact backup create', desc: 'Create an encrypted backup' },
            { cmd: 'artifact help', desc: 'Show help information' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-700 bg-slate-900/50 hover:border-blue-500 transition-colors">
              <code className="text-blue-400 font-mono text-sm">{item.cmd}</code>
              <p className="text-sm text-slate-50/60 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Requirements */}
      <div className="p-6 rounded-lg border border-slate-700 bg-slate-900/50">
        <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          System Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-50/70">
          <div>
            <span className="font-semibold text-slate-50">Node.js:</span> 18.0 or higher
          </div>
          <div>
            <span className="font-semibold text-slate-50">RAM:</span> 512MB minimum
          </div>
          <div>
            <span className="font-semibold text-slate-50">Disk:</span> 1GB free space
          </div>
          <div>
            <span className="font-semibold text-slate-50">OS:</span> macOS, Linux, Windows
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-6 rounded-lg border border-blue-500/30 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Code2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-50 mb-2">Full Documentation</h3>
            <p className="text-sm text-slate-50/70 mb-4">
              Visit the official documentation for detailed guides, examples, and advanced configuration options.
            </p>
            <a
              href="https://docs.schnitzel.dev/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/50"
            >
              <Download className="w-4 h-4" />
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
