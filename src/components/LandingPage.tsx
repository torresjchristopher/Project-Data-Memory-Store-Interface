import { useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onAuthSuccess: () => void;
}

export default function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'JACKSON_HEIGHTS') {
      onAuthSuccess();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          The Murray Family
        </h1>
        <p className="text-xl md:text-2xl text-navy-200">
          Digital Artifact Archive
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center mb-12">
        {/* Left: Artifact CLI Feature */}
        <div className="bg-navy-800 border-2 border-navy-600 rounded-lg p-8">
          <div className="mb-6">
            <div className="inline-block bg-gradient-to-br from-blue-400 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🎯 NEW: Artifact CLI
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Scan & Archive with CLI
          </h2>
          <p className="text-navy-200 mb-6 text-lg">
            Professional-grade scanning with native resolution preservation. Capture artifacts at original quality—including 4K and ultra-high resolution files.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-navy-100">
              <span className="text-blue-400 mr-3 text-xl">✓</span>
              Native resolution preservation (4K & beyond)
            </li>
            <li className="flex items-center text-navy-100">
              <span className="text-blue-400 mr-3 text-xl">✓</span>
              Lossless compression options
            </li>
            <li className="flex items-center text-navy-100">
              <span className="text-blue-400 mr-3 text-xl">✓</span>
              Batch metadata & format support
            </li>
            <li className="flex items-center text-navy-100">
              <span className="text-blue-400 mr-3 text-xl">✓</span>
              Permanent archival-grade storage
            </li>
          </ul>
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
            Download Artifact CLI
          </button>
        </div>

        {/* Right: Gallery Preview */}
        <div className="bg-navy-800 border-2 border-navy-600 rounded-lg p-8">
          <div className="mb-6">
            <div className="inline-block bg-gradient-to-br from-emerald-400 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              📚 EXPLORE: Memory Gallery
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            View Family Artifacts
          </h2>
          <p className="text-navy-200 mb-6 text-lg">
            Browse the complete collection of family memories. Browse photographs, documents, and stories organized chronologically or by family member.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-navy-100">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Full-resolution image viewing
            </li>
            <li className="flex items-center text-navy-100">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Timeline & gallery views
            </li>
            <li className="flex items-center text-navy-100">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Export as memory books (PDF)
            </li>
            <li className="flex items-center text-navy-100">
              <span className="text-emerald-400 mr-3 text-xl">✓</span>
              Secure family access only
            </li>
          </ul>
          <button
            onClick={() => document.getElementById('password-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Enter Gallery
          </button>
        </div>
      </div>

      {/* Password Authentication */}
      <div id="password-form" className="w-full max-w-md">
        <div className="bg-navy-800 border-2 border-navy-500 rounded-lg p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Family Access
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-navy-100 text-sm font-semibold mb-2">
                Enter password to access
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 bg-navy-700 text-white border-2 border-navy-600 rounded-lg focus:border-blue-500 focus:outline-none placeholder-navy-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-navy-300 hover:text-white"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Access Collection
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-navy-700">
            <p className="text-navy-300 text-center text-xs">
              🔐 Secure family archive
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-navy-300 text-sm">
        <p>© 2026 Murray Family Archive. All memories preserved.</p>
      </div>
    </div>
  );
}
