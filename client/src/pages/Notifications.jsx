import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Bell, AlertTriangle, AlertCircle, Info, Shield, Wrench, Heart, Bug, Eye, Filter, CheckCircle } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-900/50', badge: 'bg-red-500' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-900/50', badge: 'bg-amber-500' },
  info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-900/50', badge: 'bg-cyan-500' },
};

const CATEGORY_CONFIG = {
  warranty: { icon: Shield, label: 'Warranty', color: 'text-orange-400' },
  maintenance: { icon: Wrench, label: 'Maintenance', color: 'text-amber-400' },
  health: { icon: Heart, label: 'Health', color: 'text-red-400' },
  faults: { icon: Bug, label: 'Faults', color: 'text-red-400' },
  compliance: { icon: CheckCircle, label: 'Compliance', color: 'text-purple-400' },
};

export default function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/notifications');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const alerts = data?.alerts?.filter(a => {
    if (filterCategory && a.category !== filterCategory) return false;
    if (filterSeverity && a.severity !== filterSeverity) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Bell className="text-amber-500" size={24} />
            <span>Alerts & Notifications</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Smart alerts generated from asset health analysis</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="kpi-card glass-card p-4 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Total</span>
            <Bell size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{data?.summary?.total || 0}</div>
        </div>
        <div className="kpi-card glass-card p-4 animate-fade-in-up stagger-2 cursor-pointer" onClick={() => setFilterSeverity(filterSeverity === 'critical' ? '' : 'critical')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Critical</span>
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{data?.summary?.critical || 0}</div>
        </div>
        <div className="kpi-card glass-card p-4 animate-fade-in-up stagger-3 cursor-pointer" onClick={() => setFilterSeverity(filterSeverity === 'warning' ? '' : 'warning')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Warning</span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{data?.summary?.warning || 0}</div>
        </div>
        <div className="kpi-card glass-card p-4 animate-fade-in-up stagger-4 cursor-pointer" onClick={() => setFilterSeverity(filterSeverity === 'info' ? '' : 'info')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Info</span>
            <Info size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{data?.summary?.info || 0}</div>
        </div>
        <div className="kpi-card glass-card p-4 animate-fade-in-up stagger-5">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-2">By Category</div>
          <div className="space-y-1">
            {Object.entries(data?.summary?.byCategory || {}).map(([cat, count]) => {
              const cfg = CATEGORY_CONFIG[cat];
              return count > 0 ? (
                <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)} className={`flex items-center justify-between w-full text-xs px-1 py-0.5 rounded ${filterCategory === cat ? 'bg-slate-800' : ''}`}>
                  <span className={cfg?.color || 'text-slate-400'}>{cfg?.label || cat}</span>
                  <span className="font-mono text-white">{count}</span>
                </button>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      {(filterCategory || filterSeverity) && (
        <div className="flex items-center space-x-2 animate-fade-in">
          <Filter size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500">Filtering:</span>
          {filterSeverity && <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-white">{filterSeverity}</span>}
          {filterCategory && <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-white">{filterCategory}</span>}
          <button onClick={() => { setFilterCategory(''); setFilterSeverity(''); }} className="text-xs text-amber-400 hover:underline">Clear</button>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          const SevIcon = sev.icon;
          const catCfg = CATEGORY_CONFIG[alert.category];
          const CatIcon = catCfg?.icon || Bell;

          return (
            <div key={i} className={`glass-card p-4 ${sev.border} border-l-4 animate-fade-in-up flex items-center justify-between group`} style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg ${sev.bg} flex items-center justify-center`}>
                  <SevIcon size={18} className={sev.color} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{alert.message}</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs font-mono text-cyan-400">{alert.assetTag}</span>
                    <span className="text-xs text-slate-500">{alert.assetName}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{alert.department}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className={`text-xs flex items-center space-x-1 ${catCfg?.color || 'text-slate-400'}`}>
                      <CatIcon size={10} /><span>{catCfg?.label || alert.category}</span>
                    </span>
                  </div>
                </div>
              </div>
              <Link to={`/assets/${alert.assetId}`} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-all">
                <Eye size={16} />
              </Link>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="text-center py-12 glass-card">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-white">All Clear!</p>
            <p className="text-sm text-slate-500">No alerts match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
