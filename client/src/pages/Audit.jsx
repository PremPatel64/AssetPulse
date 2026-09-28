import { useState } from 'react';
import api from '../lib/api';
import { ShieldAlert, ShieldCheck, Database, Search, Lock, CheckCircle, XCircle } from 'lucide-react';

export default function Audit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verifyLedger = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/ledger/verify');
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-xl shadow-emerald-500/20 mb-2">
          <Lock size={36} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Immutable Ledger Audit</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
          Cryptographically verify the entire hash-chained event ledger across all government assets. 
          This process checks every <span className="text-cyan-400 font-mono">SHA-256</span> link in the chain to detect 
          tampering, missing records, and integrity violations.
        </p>
        
        <button 
          onClick={verifyLedger}
          disabled={loading}
          className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center space-x-3 mx-auto disabled:opacity-50 transition-all text-sm tracking-wide"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>VERIFYING LEDGER INTEGRITY...</span>
            </>
          ) : (
            <>
              <Database size={20} />
              <span>VERIFY FULL PORTFOLIO LEDGER</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`p-8 rounded-xl border-2 animate-fade-in-up ${result.ok ? 'glass-card border-emerald-900/50' : 'glass-card border-red-900/50'}`}>
          <div className="flex items-center space-x-5 mb-6">
            {result.ok ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck size={36} className="text-emerald-500" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse-glow">
                <ShieldAlert size={36} className="text-red-500" />
              </div>
            )}
            <div>
              <h3 className={`text-2xl font-bold ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.ok ? 'LEDGER INTEGRITY VERIFIED' : 'TAMPERING DETECTED'}
              </h3>
              <p className="text-slate-500 font-mono text-sm mt-1">
                Verified <span className="text-white">{result.checked}</span> events across <span className="text-white">{result.chains}</span> asset chains
              </p>
            </div>
          </div>

          {result.ok && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-4 text-center">
                <CheckCircle size={20} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-lg font-bold font-mono text-white">{result.checked}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Events Verified</p>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-4 text-center">
                <Database size={20} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-lg font-bold font-mono text-white">{result.chains}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Asset Chains</p>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-4 text-center">
                <Lock size={20} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-lg font-bold font-mono text-white">0</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Broken Links</p>
              </div>
            </div>
          )}

          {!result.ok && result.brokenLinks?.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-xs text-red-500 font-semibold tracking-wider uppercase flex items-center space-x-2">
                <XCircle size={14} />
                <span>Broken Links Identified ({result.brokenLinks.length})</span>
              </h4>
              {result.brokenLinks.map((err, i) => (
                <div key={i} className="flex items-center justify-between bg-red-900/10 p-4 rounded-lg border border-red-900/30 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center space-x-3">
                    <Search className="text-red-400" size={14} />
                    <span className="font-mono text-xs text-slate-300">Asset: <span className="text-cyan-400">{err.assetId}</span></span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-400">Seq: <span className="text-white font-mono">{err.seq}</span></span>
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold font-mono">
                      {err.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="glass-card p-6">
        <h4 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-3">How It Works</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white font-medium mb-1">1. Hash Chain</p>
            <p className="text-slate-500 text-xs">Each event's hash includes the previous event's hash, creating an unbreakable chain.</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">2. Recomputation</p>
            <p className="text-slate-500 text-xs">The audit re-computes every SHA-256 hash from raw data and compares with stored values.</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">3. CAG Compliance</p>
            <p className="text-slate-500 text-xs">Meets Comptroller & Auditor General standards for tamper-evident government records.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
