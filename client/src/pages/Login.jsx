import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../store/useAuth';
import { Lock, Building2, Shield, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuth(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (em, pass) => {
    setEmail(em);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-xl shadow-amber-500/20">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">AssetPulse</h1>
          <p className="text-xs text-slate-500 font-mono tracking-[0.3em] mt-2">GOVERNMENT ASSET MANAGEMENT</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 shadow-2xl">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Shield size={16} className="text-amber-500" />
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Secure Control Room Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="officer@assetpulse.io" 
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600 pr-10"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-900/50 animate-fade-in">
                <Lock size={14} className="text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 transition-all text-sm">
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>AUTHENTICATING...</span>
                </span>
              ) : 'AUTHENTICATE'}
            </button>
          </form>

          {/* Demo Roles */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase text-center mb-3">Quick Access — Demo Roles</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Director (Admin)', email: 'admin@assetpulse.io', pass: 'Admin@123', color: 'text-amber-400', bg: 'hover:bg-amber-500/10' },
                { label: 'Dy. Director (Mgr)', email: 'manager@assetpulse.io', pass: 'Manager@123', color: 'text-cyan-400', bg: 'hover:bg-cyan-500/10' },
                { label: 'Jr. Engineer (Tech)', email: 'tech@assetpulse.io', pass: 'Tech@123', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10' },
                { label: 'CAG Auditor', email: 'auditor@assetpulse.io', pass: 'Audit@123', color: 'text-purple-400', bg: 'hover:bg-purple-500/10' },
              ].map(role => (
                <button key={role.email} onClick={() => autofill(role.email, role.pass)}
                  className={`p-2.5 rounded-lg bg-slate-800/30 border border-slate-800/50 ${role.bg} transition-all text-left`}>
                  <span className={`text-xs font-medium ${role.color}`}>{role.label}</span>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">{role.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-6 font-mono">
          AssetPulse v2.0 · Tamper-Evident Ledger · © 2024 Govt. of India
        </p>
      </div>
    </div>
  );
}
