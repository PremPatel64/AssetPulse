import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Wrench, Search, QrCode, Camera, AlertTriangle, CheckCircle, Clock, Send, Wifi, WifiOff, MapPin } from 'lucide-react';

const INSPECTION_CHECKLIST = [
  { id: 'visual', label: 'Visual inspection completed', category: 'General' },
  { id: 'noise', label: 'No abnormal noise/vibration', category: 'General' },
  { id: 'leaks', label: 'No fluid leaks detected', category: 'General' },
  { id: 'electrical', label: 'Electrical connections secure', category: 'Safety' },
  { id: 'safety', label: 'Safety guards in place', category: 'Safety' },
  { id: 'labels', label: 'Labels & tags readable', category: 'Compliance' },
  { id: 'clean', label: 'Area clean & organized', category: 'Compliance' },
  { id: 'calibration', label: 'Calibration within spec', category: 'Performance' },
  { id: 'output', label: 'Output within normal range', category: 'Performance' },
];

export default function FieldMode() {
  const [mode, setMode] = useState('search'); // search, inspect, report, maintain
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [faultForm, setFaultForm] = useState({ code: '', description: '', severity: 3 });
  const [maintenanceForm, setMaintenanceForm] = useState({ notes: '', cost: '', parts: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [isOnline] = useState(navigator.onLine);

  const searchAssets = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/api/assets?q=${searchQuery}`);
      setSearchResults(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectAsset = async (asset) => {
    try {
      const [assetRes, eventsRes] = await Promise.all([
        api.get(`/api/assets/${asset._id}`),
        api.get(`/api/assets/${asset._id}/events`)
      ]);
      setSelectedAsset({ ...assetRes.data, events: eventsRes.data });
      setMode('inspect');
    } catch (err) {
      console.error(err);
    }
  };

  const submitInspection = async () => {
    setSubmitting(true);
    try {
      const passedItems = Object.entries(checklist).filter(([, v]) => v).map(([k]) => k);
      const failedItems = INSPECTION_CHECKLIST.map(c => c.id).filter(id => !checklist[id]);
      const condition = failedItems.length === 0 ? 'GOOD' : failedItems.length <= 2 ? 'FAIR' : failedItems.length <= 4 ? 'POOR' : 'CRITICAL';
      
      await api.post(`/api/assets/${selectedAsset._id}/events`, {
        type: 'INSPECTED',
        payload: { passedItems, failedItems, condition, checklistScore: `${passedItems.length}/${INSPECTION_CHECKLIST.length}` }
      });
      showToast('Inspection recorded on ledger ✓');
      setChecklist({});
      setMode('search');
      setSelectedAsset(null);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const submitFault = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/assets/${selectedAsset._id}/events`, {
        type: 'FAULT_REPORTED',
        payload: { ...faultForm, severity: Number(faultForm.severity) }
      });
      showToast('Fault reported on ledger ✓');
      setFaultForm({ code: '', description: '', severity: 3 });
      setMode('search');
      setSelectedAsset(null);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const submitMaintenance = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/assets/${selectedAsset._id}/events`, {
        type: 'MAINTENANCE_PERFORMED',
        payload: { ...maintenanceForm, cost: Number(maintenanceForm.cost) || 0 }
      });
      showToast('Maintenance logged on ledger ✓');
      setMaintenanceForm({ notes: '', cost: '', parts: '' });
      setMode('search');
      setSelectedAsset(null);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Wrench className="text-amber-500" size={24} />
            <span>Field Mode</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">On-site inspection, fault reporting & maintenance logging</p>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <span className="flex items-center space-x-1.5 text-xs text-emerald-400"><Wifi size={14} /><span>Online</span></span>
          ) : (
            <span className="flex items-center space-x-1.5 text-xs text-red-400"><WifiOff size={14} /><span>Offline</span></span>
          )}
        </div>
      </div>

      {/* Search Mode */}
      {mode === 'search' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Find Asset</h3>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchAssets()}
                  placeholder="Search by tag, name, or serial..." className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600" />
              </div>
              <button onClick={searchAssets} className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold text-sm">Search</button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((asset, i) => (
                <button key={asset._id} onClick={() => selectAsset(asset)} className="w-full glass-card p-4 text-left hover:border-amber-500/50 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-cyan-400 text-sm">{asset.tag}</span>
                        <span className="text-white font-medium">{asset.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-500">{asset.department}</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-xs text-slate-500">{asset.site}</span>
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">{asset.status?.replace(/_/g, ' ')}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Asset Selected — Mode Chooser */}
      {selectedAsset && mode === 'inspect' && (
        <div className="space-y-4 animate-fade-in">
          {/* Asset Summary */}
          <div className="glass-card p-5 border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-cyan-400">{selectedAsset.tag}</span>
                  <span className="text-white font-bold">{selectedAsset.name}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                  <MapPin size={12} /><span>{selectedAsset.site} • {selectedAsset.location}</span>
                </div>
              </div>
              <button onClick={() => { setSelectedAsset(null); setMode('search'); }} className="text-xs text-slate-400 hover:text-white">← Change Asset</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => setMode('checklist')} className="glass-card p-6 text-center hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 transition-colors">
                <CheckCircle size={24} className="text-emerald-500" />
              </div>
              <p className="text-white font-medium">Inspection</p>
              <p className="text-[10px] text-slate-500 mt-1">9-point checklist</p>
            </button>
            <button onClick={() => setMode('fault')} className="glass-card p-6 text-center hover:border-red-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-500/20 transition-colors">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <p className="text-white font-medium">Report Fault</p>
              <p className="text-[10px] text-slate-500 mt-1">Log issue with severity</p>
            </button>
            <button onClick={() => setMode('maintain')} className="glass-card p-6 text-center hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-500/20 transition-colors">
                <Wrench size={24} className="text-amber-500" />
              </div>
              <p className="text-white font-medium">Log Maintenance</p>
              <p className="text-[10px] text-slate-500 mt-1">Parts, cost & notes</p>
            </button>
          </div>

          {/* Last 5 events */}
          <div className="glass-card p-5">
            <h4 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-3">Recent Events ({selectedAsset.events?.length || 0} total)</h4>
            <div className="space-y-2">
              {selectedAsset.events?.slice(-5).reverse().map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-slate-800/30">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{e.type?.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500">by {e.actorName}</span>
                  </div>
                  <span className="text-slate-600 font-mono">{new Date(e.occurredAt).toLocaleDateString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspection Checklist */}
      {mode === 'checklist' && selectedAsset && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-5 border-l-4 border-l-cyan-500">
            <span className="font-mono text-cyan-400 text-sm">{selectedAsset.tag}</span>
            <span className="text-white ml-2">{selectedAsset.name}</span>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mb-4 flex items-center space-x-2">
              <CheckCircle size={14} /><span>Field Inspection Checklist</span>
            </h3>
            <div className="space-y-2">
              {INSPECTION_CHECKLIST.map(item => (
                <label key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${checklist[item.id] ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-slate-800/30 border border-slate-800/50 hover:border-slate-700'}`}>
                  <input type="checkbox" checked={!!checklist[item.id]} onChange={e => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/30" />
                  <div className="flex-1">
                    <span className={`text-sm ${checklist[item.id] ? 'text-emerald-400' : 'text-white'}`}>{item.label}</span>
                    <span className="text-[10px] text-slate-600 ml-2">{item.category}</span>
                  </div>
                  {checklist[item.id] && <CheckCircle size={14} className="text-emerald-500" />}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between mt-5">
              <span className="text-xs text-slate-500">{Object.values(checklist).filter(Boolean).length}/{INSPECTION_CHECKLIST.length} items checked</span>
              <div className="flex space-x-2">
                <button onClick={() => setMode('inspect')} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm">Back</button>
                <button onClick={submitInspection} disabled={submitting} className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold text-sm shadow-lg disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fault Report */}
      {mode === 'fault' && selectedAsset && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-5 border-l-4 border-l-cyan-500">
            <span className="font-mono text-cyan-400 text-sm">{selectedAsset.tag}</span>
            <span className="text-white ml-2">{selectedAsset.name}</span>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-red-400 font-semibold tracking-wider uppercase mb-4 flex items-center space-x-2">
              <AlertTriangle size={14} /><span>Report Fault</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Fault Code</label>
                <input type="text" value={faultForm.code} onChange={e => setFaultForm({ ...faultForm, code: e.target.value })} placeholder="e.g. F-ELEC-001"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Description</label>
                <textarea value={faultForm.description} onChange={e => setFaultForm({ ...faultForm, description: e.target.value })} rows={3} placeholder="Describe the fault..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600 resize-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Severity (1-5)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setFaultForm({ ...faultForm, severity: s })}
                      className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${faultForm.severity === s
                        ? s >= 4 ? 'bg-red-500 text-white' : s >= 3 ? 'bg-amber-500 text-black' : 'bg-cyan-500 text-white'
                        : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-1">{faultForm.severity >= 4 ? 'CRITICAL — Immediate attention required' : faultForm.severity >= 3 ? 'MODERATE — Schedule repair' : 'LOW — Monitor during next inspection'}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-5">
              <button onClick={() => setMode('inspect')} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm">Back</button>
              <button onClick={submitFault} disabled={submitting || !faultForm.description} className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold text-sm shadow-lg disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Report Fault'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Maintenance */}
      {mode === 'maintain' && selectedAsset && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-5 border-l-4 border-l-cyan-500">
            <span className="font-mono text-cyan-400 text-sm">{selectedAsset.tag}</span>
            <span className="text-white ml-2">{selectedAsset.name}</span>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-amber-400 font-semibold tracking-wider uppercase mb-4 flex items-center space-x-2">
              <Wrench size={14} /><span>Log Maintenance</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Work Description</label>
                <textarea value={maintenanceForm.notes} onChange={e => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })} rows={3} placeholder="Describe maintenance work performed..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Cost (₹)</label>
                  <input type="number" value={maintenanceForm.cost} onChange={e => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })} placeholder="0"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Parts Replaced</label>
                  <input type="text" value={maintenanceForm.parts} onChange={e => setMaintenanceForm({ ...maintenanceForm, parts: e.target.value })} placeholder="e.g. Oil filter, belt"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none placeholder:text-slate-600" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-5">
              <button onClick={() => setMode('inspect')} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm">Back</button>
              <button onClick={submitMaintenance} disabled={submitting || !maintenanceForm.notes} className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold text-sm shadow-lg disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Log Maintenance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-fade-in-up z-50">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
