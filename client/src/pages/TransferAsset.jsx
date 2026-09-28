import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowRightLeft, ArrowLeft, CheckCircle, Building2, MapPin, User } from 'lucide-react';

const DEPARTMENTS = ['Public Works', 'Information Technology', 'Transport', 'Health', 'Education', 'Revenue', 'Municipal Corp'];
const SITES = ['Mantralaya Main Building', 'District Collectorate', 'Civil Hospital Campus', 'Govt ITI Polytechnic', 'Municipal Water Plant', 'Zilla Parishad Office', 'State Data Center', 'Transport Nagar Depot', 'PWD Regional Office'];

export default function TransferAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    toDepartment: '', toSite: '', toLocation: '', toCustodian: '', reason: ''
  });

  useEffect(() => {
    api.get(`/api/assets/${id}`).then(res => {
      setAsset(res.data);
      setForm(prev => ({ ...prev, toDepartment: res.data.department, toSite: res.data.site }));
    });
  }, [id]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/api/assets/${id}/transfer`, form);
      setSuccess(true);
      setTimeout(() => navigate(`/assets/${id}`), 2000);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-white">Transfer Recorded on Ledger</h3>
      <p className="text-slate-500 mt-2">Immutable TRANSFERRED event created. Redirecting...</p>
    </div>
  );

  if (!asset) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link to={`/assets/${id}`} className="flex items-center space-x-1 text-sm text-slate-500 hover:text-amber-400 transition-colors">
        <ArrowLeft size={16} /><span>Back to Asset</span>
      </Link>

      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <ArrowRightLeft className="text-amber-500" size={24} />
          <span>Transfer Asset</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">Transfer <span className="text-cyan-400 font-mono">{asset.tag}</span> — {asset.name}</p>
      </div>

      {/* Current State */}
      <div className="glass-card p-5 border-l-4 border-l-cyan-500">
        <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-3">Current Assignment</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2"><Building2 size={14} className="text-slate-500" /><span className="text-white">{asset.department}</span></div>
          <div className="flex items-center space-x-2"><MapPin size={14} className="text-slate-500" /><span className="text-white">{asset.site}</span></div>
          <div className="flex items-center space-x-2"><User size={14} className="text-slate-500" /><span className="text-white">{asset.custodian || '—'}</span></div>
        </div>
      </div>

      {/* Transfer Form */}
      <form onSubmit={handleTransfer} className="space-y-5">
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <h3 className="text-xs text-amber-500 font-semibold tracking-wider uppercase mb-4">New Assignment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">To Department<span className="text-red-400">*</span></label>
              <select value={form.toDepartment} onChange={e => setForm({ ...form, toDepartment: e.target.value })} required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">To Site<span className="text-red-400">*</span></label>
              <select value={form.toSite} onChange={e => setForm({ ...form, toSite: e.target.value })} required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none">
                {SITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">New Location</label>
              <input type="text" value={form.toLocation} onChange={e => setForm({ ...form, toLocation: e.target.value })} placeholder="Floor / Room"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">New Custodian</label>
              <input type="text" value={form.toCustodian} onChange={e => setForm({ ...form, toCustodian: e.target.value })} placeholder="Responsible officer"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Reason for Transfer<span className="text-red-400">*</span></label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2} required placeholder="Provide justification for asset transfer..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600 resize-none" />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link to={`/assets/${id}`} className="px-6 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm">Cancel</Link>
          <button type="submit" disabled={saving} className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold text-sm shadow-lg disabled:opacity-50">
            {saving ? 'Recording...' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
}
