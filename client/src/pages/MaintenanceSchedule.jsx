import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Calendar, AlertTriangle, Clock, CheckCircle, Wrench, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const URGENCY_CONFIG = {
  overdue: { label: 'OVERDUE', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-900/50', dot: 'bg-red-500' },
  urgent: { label: 'DUE SOON', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-900/50', dot: 'bg-amber-500' },
  upcoming: { label: 'UPCOMING', color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-900/50', dot: 'bg-cyan-500' },
  normal: { label: 'SCHEDULED', color: 'text-slate-400', bg: 'bg-slate-800/30', border: 'border-slate-800/50', dot: 'bg-slate-500' },
};

export default function MaintenanceSchedule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filterUrgency, setFilterUrgency] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/maintenance');
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

  const schedule = data?.schedule?.filter(s => !filterUrgency || s.urgency === filterUrgency) || [];

  // Calendar helper: group by month
  const calendarMonths = {};
  schedule.forEach(s => {
    const key = new Date(s.nextDueDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!calendarMonths[key]) calendarMonths[key] = [];
    calendarMonths[key].push(s);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Calendar className="text-amber-500" size={24} />
            <span>Maintenance Schedule</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track and manage preventive maintenance across all assets</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${view === 'list' ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400' : 'bg-slate-800/30 text-slate-400'}`}>List View</button>
          <button onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${view === 'calendar' ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400' : 'bg-slate-800/30 text-slate-400'}`}>Calendar View</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'overdue', icon: AlertTriangle, label: 'Overdue', count: data?.summary?.overdue || 0 },
          { key: 'urgent', icon: Clock, label: 'Due This Week', count: data?.summary?.urgent || 0 },
          { key: 'upcoming', icon: Calendar, label: 'Next 30 Days', count: data?.summary?.upcoming || 0 },
          { key: 'normal', icon: CheckCircle, label: 'Scheduled', count: data?.summary?.normal || 0 },
        ].map((item, i) => {
          const cfg = URGENCY_CONFIG[item.key];
          return (
            <div key={item.key} className={`kpi-card glass-card p-4 cursor-pointer animate-fade-in-up stagger-${i + 1} ${filterUrgency === item.key ? 'border-amber-500/50' : ''}`}
              onClick={() => setFilterUrgency(filterUrgency === item.key ? '' : item.key)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{item.label}</span>
                <item.icon size={16} className={cfg.color} />
              </div>
              <div className={`text-2xl font-bold font-mono ${cfg.color}`}>{item.count}</div>
            </div>
          );
        })}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-600 border-b border-slate-800/50 font-mono tracking-wider bg-slate-900/30">
              <tr>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">TAG</th>
                <th className="px-4 py-3">ASSET</th>
                <th className="px-4 py-3">DEPARTMENT</th>
                <th className="px-4 py-3">INTERVAL</th>
                <th className="px-4 py-3">LAST DONE</th>
                <th className="px-4 py-3">NEXT DUE</th>
                <th className="px-4 py-3">DAYS</th>
                <th className="px-4 py-3">CUSTODIAN</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, i) => {
                const cfg = URGENCY_CONFIG[item.urgency];
                return (
                  <tr key={item.assetId} className="border-b border-slate-800/30 table-row-hover animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400 text-xs">{item.assetTag}</td>
                    <td className="px-4 py-3 text-white text-xs max-w-[160px] truncate">{item.assetName}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.department}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.intervalDays}d</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(item.lastMaintenanceDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-medium text-white">{new Date(item.nextDueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span className={cfg.color}>{item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)}d overdue` : `${item.daysUntilDue}d`}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.custodian || '—'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/assets/${item.assetId}`} className="p-1.5 rounded-md hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-all inline-flex">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="space-y-6">
          {Object.entries(calendarMonths).map(([month, items]) => (
            <div key={month} className="glass-card p-5 animate-fade-in">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <Calendar size={16} className="text-amber-400" />
                <span>{month}</span>
                <span className="text-xs text-slate-500 font-normal">({items.length} items)</span>
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {items.map((item, i) => {
                  const cfg = URGENCY_CONFIG[item.urgency];
                  const day = new Date(item.nextDueDate).getDate();
                  return (
                    <Link to={`/assets/${item.assetId}`} key={i} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3 hover:scale-105 transition-transform`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-bold font-mono text-white">{day}</span>
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{item.assetTag}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.assetName}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
