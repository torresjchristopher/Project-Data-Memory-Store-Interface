import { Shield, Lock, Eye, Database, Server, Key } from 'lucide-react';

export default function PrivacyTab() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Privacy & Security</h1>
        <p className="text-slate-50/60">Your family memories are protected with enterprise-grade security</p>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Feature 1 */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-slate-50/60">
                All data is encrypted in transit and at rest using industry-standard AES-256 encryption.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 mb-2">Anonymous Access</h3>
              <p className="text-sm text-slate-50/60">
                Access your archive without creating an account. No personal information is required or stored.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 mb-2">Private by Default</h3>
              <p className="text-sm text-slate-50/60">
                Your archive is completely private. No one can access it without the explicit access code.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Database className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 mb-2">Data Ownership</h3>
              <p className="text-sm text-slate-50/60">
                You own all your data. Export it anytime in standard formats (ZIP, PDF) without restrictions.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 5 */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/10">
              <Server className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 mb-2">Secure Infrastructure</h3>
              <p className="text-sm text-slate-50/60">
                Hosted on Firebase with automatic backups, DDoS protection, and compliance certifications.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 6 */}
        <div className="p-6 rounded-lg border border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <Key className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 mb-2">Access Control</h3>
              <p className="text-sm text-slate-50/60">
                Control who can access your archive with simple access codes and permission settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="p-6 rounded-lg border border-slate-700 bg-slate-900/50">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">Privacy Commitment</h2>
        <div className="space-y-4 text-slate-50/70">
          <p>
            We take your privacy seriously. SchnitzelBank is designed as a privacy-first platform for archiving family memories.
          </p>
          <p>
            We do not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Sell or share your data with third parties</li>
            <li>Use your data for advertising or tracking</li>
            <li>Store personal information without your consent</li>
            <li>Access or view your family memories</li>
            <li>Retain data longer than necessary</li>
          </ul>
          <p className="mt-4">
            We do:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Encrypt all data in transit and at rest</li>
            <li>Maintain secure, redundant backups</li>
            <li>Comply with GDPR and privacy regulations</li>
            <li>Allow you to delete your data anytime</li>
            <li>Provide transparent privacy practices</li>
          </ul>
        </div>
      </div>

      {/* Security Standards */}
      <div className="mt-8 p-6 rounded-lg border border-slate-700 bg-slate-900/50">
        <h3 className="font-semibold text-slate-50 mb-4">Security Standards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-50/70">
          <div>
            <span className="font-semibold text-slate-50">Encryption:</span> AES-256
          </div>
          <div>
            <span className="font-semibold text-slate-50">Protocol:</span> HTTPS/TLS 1.3
          </div>
          <div>
            <span className="font-semibold text-slate-50">Backups:</span> Automated, encrypted
          </div>
          <div>
            <span className="font-semibold text-slate-50">Compliance:</span> GDPR, CCPA
          </div>
        </div>
      </div>
    </div>
  );
}
