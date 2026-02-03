import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Database, Eye, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-xl font-bold text-white">Privacy & Security</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Your Privacy is Protected</h2>
            <p className="text-xl text-gray-400">Enterprise-grade security for your family's precious memories</p>
          </div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Full Resolution */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Full Resolution Archives</h3>
                  <p className="text-gray-400 leading-relaxed">
                    All artifacts are stored in full, uncompressed resolution. No quality degradation or lossy compression. Your memories are preserved exactly as captured.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li>✓ Original image/video quality</li>
                    <li>✓ Metadata preservation</li>
                    <li>✓ No re-encoding or optimization</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Encryption */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/50 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg flex-shrink-0">
                  <Lock className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
                  <p className="text-gray-400 leading-relaxed">
                    All data is encrypted in transit and at rest using AES-256 encryption. Only authorized family members with proper credentials can access your archive.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li>✓ AES-256 encryption</li>
                    <li>✓ TLS 1.3 in transit</li>
                    <li>✓ Access control enforcement</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Storage */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-green-500/50 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg flex-shrink-0">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Secure Cloud Storage</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Your archive is stored on enterprise-grade Google Cloud infrastructure with automatic redundancy, backups, and disaster recovery capabilities.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li>✓ Geo-distributed backups</li>
                    <li>✓ Automatic failover</li>
                    <li>✓ 99.99% uptime SLA</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Granular Access Control</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Define who can view, download, or export your family's memories. Role-based permissions ensure only intended recipients access sensitive archives.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li>✓ Permission management</li>
                    <li>✓ Audit logging</li>
                    <li>✓ Activity tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-12">
            {/* Archive Permanence */}
            <section className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Archival Permanence</h3>
              <p className="text-gray-400 mb-4">
                Yukora is designed for institutional-grade permanence. Your family's archive is built to last generations with:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Offline-First Architecture:</strong> Data syncs locally and persists across sessions even without internet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Format Independence:</strong> Artifacts stored in standard, non-proprietary formats</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Data Portability:</strong> Export your complete archive anytime as ZIP or PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Version History:</strong> All edits and changes are tracked for recovery</span>
                </li>
              </ul>
            </section>

            {/* Data Collection */}
            <section className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Minimal Data Collection</h3>
              <p className="text-gray-400 mb-4">
                We collect only what's necessary to operate your archive:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Family member names and relationships (managed by you)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Artifact metadata (date, tags, descriptions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>We do NOT collect personal data, analytics, or usage patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>We do NOT sell, share, or monetize your data</span>
                </li>
              </ul>
            </section>

            {/* Compliance */}
            <section className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Security & Compliance</h3>
              <p className="text-gray-400 mb-4">
                Yukora meets or exceeds industry standards:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>✓ GDPR-compliant data handling</li>
                <li>✓ CCPA privacy standards</li>
                <li>✓ SOC 2 compliance through Google Cloud</li>
                <li>✓ Regular security audits and penetration testing</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Questions About Your Privacy?</h3>
              <p className="text-blue-100 mb-6">Contact us for detailed security information or to discuss custom compliance requirements.</p>
              <a href="mailto:privacy@yukora.tech" className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
                Contact Privacy Team
              </a>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-500 text-sm">
            <p>Last updated: February 2026 | Version 1.0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
