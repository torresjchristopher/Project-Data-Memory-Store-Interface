import { useNavigate } from 'react-router-dom';

export default function DownloadsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy-900 text-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 border-b border-white/20 px-6 py-4">
        <button onClick={() => navigate('/')} className="text-gray-300">← Back</button>
      </nav>
      <main className="pt-20 px-6">
        <div className="max-w-6xl mx-auto py-16">
          <h1 className="text-5xl font-black mb-12 text-gray-50">Downloads</h1>
          <a href="/downloads/artifact-cli.zip" download className="inline-block bg-red-600 text-white font-bold px-6 py-3 rounded-md hover:bg-red-700">Download Artifact CLI</a>
        </div>
      </main>
    </div>
  );
}
