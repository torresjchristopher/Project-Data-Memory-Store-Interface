import { useNavigate } from 'react-router-dom';
import { Download, Zap, Code, Github, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ArtifactCliPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-300 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-white">Artifact CLI</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full">
              <span className="text-sm font-semibold text-blue-300">Version 1.0 Released</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-white leading-tight">
              Artifact <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CLI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Enterprise-grade terminal interface for managing and ingesting artifacts into your Yukora archive
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/downloads/artifact-cli.zip" download className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
                <Download className="w-5 h-5" />
                Download Latest Release
              </a>
              <a href="https://github.com/torresjchristopher/artifact-cli" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-slate-600 transition">
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Batch Processing",
                desc: "Upload hundreds of artifacts with metadata in minutes"
              },
              {
                icon: Code,
                title: "Rich Terminal UI",
                desc: "Intuitive menu system built with Rich terminal framework"
              },
              {
                icon: BookOpen,
                title: "Metadata Management",
                desc: "Add descriptions, tags, and relationships to artifacts"
              },
              {
                icon: Download,
                title: "Direct Upload",
                desc: "Push artifacts directly to your Yukora archive"
              },
              {
                icon: Zap,
                title: "File Organization",
                desc: "Auto-organize by person, date, and custom categories"
              },
              {
                icon: Github,
                title: "Open Source",
                desc: "Fully transparent codebase available on GitHub"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition group">
                <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4 group-hover:bg-blue-500/30 transition">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Quick Start</h2>
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Download",
                desc: "Download the latest Artifact CLI release for your platform (Windows, macOS, Linux)"
              },
              {
                step: 2,
                title: "Install",
                desc: "Extract the ZIP file and run the setup script (instructions included)"
              },
              {
                step: 3,
                title: "Configure",
                desc: "Enter your Yukora archive credentials and Firebase connection details"
              },
              {
                step: 4,
                title: "Start Ingesting",
                desc: "Point CLI to your artifact folders and begin uploading to your archive"
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Requirements */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">System Requirements</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                os: "Windows",
                versions: ["Windows 10 or later", "Python 3.8+", "2GB RAM minimum"]
              },
              {
                os: "macOS",
                versions: ["macOS 11 or later", "Python 3.8+", "2GB RAM minimum"]
              },
              {
                os: "Linux",
                versions: ["Ubuntu 18.04+", "Python 3.8+", "2GB RAM minimum"]
              }
            ].map((req, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">{req.os}</h3>
                <ul className="space-y-2 text-gray-400">
                  {req.versions.map((v, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Documentation */}
        <section className="max-w-6xl mx-auto px-6 py-16 mb-12">
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4">
              <BookOpen className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Full Documentation Available</h3>
                <p className="text-gray-400 mb-6">
                  Comprehensive guides, tutorials, and API documentation are available in the GitHub repository. Learn how to automate your artifact ingestion workflow and integrate with your custom systems.
                </p>
                <a href="https://github.com/torresjchristopher/artifact-cli" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold group">
                  Read Full Documentation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="bg-gradient-to-t from-slate-800 to-transparent py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Ingest Your Archive?</h2>
            <p className="text-gray-400 mb-8">Download Artifact CLI and start preserving your family memories today</p>
            <a href="/downloads/artifact-cli.zip" download className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
              <Download className="w-5 h-5" />
              Download Now
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>Artifact CLI v1.0 • Part of the Yukora Ecosystem • © 2026</p>
        </div>
      </footer>
    </div>
  );
}

