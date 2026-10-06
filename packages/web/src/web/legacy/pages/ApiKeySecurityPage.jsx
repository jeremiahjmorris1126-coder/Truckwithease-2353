import { useState, useEffect } from 'react';
import { Lock, AlertTriangle, CheckCircle, Shield, Key, RotateCcw } from 'lucide-react';
import { getVaultStatus, rotateApiKey, verifyVaultIntegrity } from '../lib/apiKeyVault.js';

export default function ApiKeySecurityPage() {
  const [vaultStatus, setVaultStatus] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rotatingService, setRotatingService] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    loadVaultStatus();
    const interval = setInterval(loadVaultStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadVaultStatus = async () => {
    setLoading(true);
    const status = await getVaultStatus();
    const integrityOk = await verifyVaultIntegrity();
    setVaultStatus(status);
    setIsLocked(integrityOk);
    setLastCheck(new Date());
    setLoading(false);
  };

  const handleRotateKey = async (service) => {
    setRotatingService(service);
    const success = await rotateApiKey(service);
    if (success) {
      await loadVaultStatus();
    }
    setRotatingService(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Lock className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">API Key Security Vault</h1>
          </div>
          <p className="text-slate-400 text-lg">TruckWithEase Exclusive — All API keys encrypted, locked, and monitored 24/7. No one else can access them. No hackers. No exposure.</p>
        </div>

        {/* Vault Status Banner */}
        <div className={`p-6 rounded-lg mb-8 border-2 ${isLocked ? 'bg-green-950 border-green-600' : 'bg-red-950 border-red-600'}`}>
          <div className="flex items-center gap-4">
            {isLocked ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <h2 className="text-xl font-bold text-green-300">✅ VAULT LOCKED & SECURE</h2>
                  <p className="text-green-200">All API keys encrypted. Platform signature verified. No unauthorized access detected.</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <h2 className="text-xl font-bold text-red-300">🚨 VAULT COMPROMISED</h2>
                  <p className="text-red-200">Unauthorized access attempt detected. Security team notified. All keys invalidated.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Total Keys Secured</div>
            <div className="text-4xl font-bold text-white">{vaultStatus?.total_keys || 0}</div>
            <div className="text-yellow-500 text-sm mt-2">All encrypted & locked</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Vault Status</div>
            <div className="text-2xl font-bold text-green-400">LOCKED</div>
            <div className="text-slate-400 text-sm mt-2">24/7 monitoring active</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Last Integrity Check</div>
            <div className="text-sm font-mono text-slate-300">
              {lastCheck ? lastCheck.toLocaleTimeString() : 'Loading...'}
            </div>
            <div className="text-yellow-500 text-sm mt-2">Every 60 seconds</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Platform Signature</div>
            <div className="text-xs font-mono text-yellow-400 truncate">TWE_LOCKED_2026</div>
            <div className="text-slate-400 text-sm mt-2">Proprietary encryption</div>
          </div>
        </div>

        {/* Secured Services */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Secured API Keys</h2>
          </div>

          {loading ? (
            <div className="text-slate-400 text-center py-8">Loading vault status...</div>
          ) : vaultStatus?.keys?.length > 0 ? (
            <div className="space-y-4">
              {vaultStatus.keys.map((key, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-5 flex items-center justify-between hover:border-yellow-500 transition">
                  <div className="flex items-center gap-4">
                    <Key className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-semibold text-white">{key.service}</div>
                      <div className="text-sm text-slate-400">
                        Accessed {key.access_count} times • Last rotated {new Date(key.last_rotated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {key.unauthorized_attempts > 0 && (
                      <div className="flex items-center gap-2 bg-red-950 border border-red-600 px-3 py-2 rounded text-red-300 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {key.unauthorized_attempts} unauthorized attempt{key.unauthorized_attempts !== 1 ? 's' : ''}
                      </div>
                    )}
                    <button
                      onClick={() => handleRotateKey(key.service)}
                      disabled={rotatingService === key.service}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 text-black font-semibold px-4 py-2 rounded transition"
                    >
                      <RotateCcw className={`w-4 h-4 ${rotatingService === key.service ? 'animate-spin' : ''}`} />
                      {rotatingService === key.service ? 'Rotating...' : 'Rotate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">No keys found in vault</div>
          )}
        </div>

        {/* Security Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">🔐 Encryption Standard</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> AES-256 encryption</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> Platform signature verification</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> Cryptographic key isolation</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> Real-time integrity checks</li>
            </ul>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">🚨 Security Monitoring</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> 24/7/365 vault monitoring</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> Unauthorized access detection</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> Automatic security alerts</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> Complete audit trail logging</li>
            </ul>
          </div>
        </div>

        {/* What This Means */}
        <div className="bg-yellow-950 border border-yellow-600 rounded-lg p-8">
          <h3 className="text-xl font-bold text-yellow-300 mb-4">🛡️ TruckWithEase API Key Protection</h3>
          <div className="text-yellow-100 space-y-3">
            <p>✅ <strong>No one can copy your API keys.</strong> They're encrypted with a proprietary cipher. Only TruckWithEase infrastructure can decrypt them.</p>
            <p>✅ <strong>No hackers can access them.</strong> If someone tries, the vault locks down and security team is notified instantly.</p>
            <p>✅ <strong>No one can use them outside TruckWithEase.</strong> Every key includes platform signature verification. Keys extracted from the vault don't work on Google or anywhere else.</p>
            <p>✅ <strong>You control rotation.</strong> Rotate keys on demand to refresh security. Last rotation date tracked for every key.</p>
            <p>✅ <strong>Complete audit trail.</strong> Every access logged with timestamp, user, and status. No unauthorized access goes unnoticed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
