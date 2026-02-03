import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

export default function ArtifactCliPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy-900 text-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 border-b border-white/20 px-6 py-4">
        <button onClick={() => navigate('/')} className="text-gray-300 font-semibold">← Back</button>
      </nav>
      <main className="pt-20 px-6">
        <div className="max-w-4xl mx-auto py-16">
          <h1 className="text-5xl font-black mb-6 text-gray-50">Artifact CLI</h1>
          <p className="text-xl text-gray-300 mb-8">Terminal-based tool for managing and ingesting artifacts into the Yukora archive system.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-white/10 bg-white/5 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Features</h2>
              <ul className="space-y-2 text-gray-400">
                <li>• Batch artifact upload</li>
                <li>• Metadata management</li>
                <li>• Family tree organization</li>
                <li>• Firebase integration</li>
              </ul>
            </div>
            
            <div className="border border-white/10 bg-white/5 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Get Started</h2>
              <a href="/downloads/artifact-cli.zip" download className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-md hover:bg-red-700 mb-4">
                <Icon name="download" className="w-5 h-5" />
                Download CLI
              </a>
              <p className="text-gray-400 text-sm">Latest release available for Windows, macOS, and Linux</p>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Documentation</h2>
            <p className="text-gray-400 mb-4">View the full Artifact CLI documentation on GitHub:</p>
            <a href="https://github.com/torresjchristopher/artifact-cli" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold">
              github.com/torresjchristopher/artifact-cli →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
