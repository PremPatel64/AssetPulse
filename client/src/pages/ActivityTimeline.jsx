import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Clock, Filter, Eye, ChevronLeft, ChevronRight, Link2 } from 'lucide-react';

const EVENT_COLORS = {
  CREATED: '#38bdf8', COMMISSIONED: '#10b981', INSPECTED: '#8b5cf6',
  MAINTENANCE_PERFORMED: '#f59e0b', FAULT_REPORTED: '#ef4444',
  CONDITION_UPDATED: '#06b6d4', TRANSFERRED: '#a855f7',
  DECOMMISSIONED: '#64748b', DISPOSED: '#64748b', FAULT_RESOLVED: '#10b981',
  REFURBISHED: '#ec4899'
};

const EVENT_ICONS = {
  CREATED: '🆕', COMMISSIONED: '✅', INSPECTED: '🔍', MAINTENANCE_PERFORMED: '🔧',
  FAULT_REPORTED: '⚠️', CONDITION_UPDATED: '📊', TRANSFERRED: '🔄',
  DECOMMISSIONED: '⏹️', DISPOSED: '🗑️', FAULT_RESOLVED: '✔️', REFURBISHED: '♻️'
};

export default function ActivityTimeline() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page });
        if (filterType) params.set('type', filterType);
        if (filterDept) params.set('department', filterDept);
        const [eventsRes, statsRes] = await Promise.all([
          api.get(`/api/activity?${params.toString()}`),
          api.get('/api/activity/stats')
        ]);
        setData(eventsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, filterType, filterDept]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Clock className="text-amber-500" size={24} />
            <span>System Activity Timeline</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">{stats?.total || 0} total immutable events on the ledger</p>
        </div>
      </div>

      {/* Event Type Stats */}
      {stats?.stats && (
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${!filterType ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400' : 'bg-slate-800/30 text-slate-400 hover:text-white'}`}>
              All ({stats.total})
            </button>
            {stats.stats.map(s => (
              <button key={s._id} onClick={() => setFilterType(filterType === s._id ? '' : s._id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center space-x-1.5 ${filterType === s._id ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400' : 'bg-slate-800/30 text-slate-400 hover:text-white'}`}>
                <span>{EVENT_ICONS[s._id] || '📋'}</span>
                <span>{s._id?.replace(/_/g, ' ')}</span>
                <span className="font-mono text-[10px] text-slate-500">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="space-y-4">
            {data?.events?.map((event, i) => (
              <div key={event._id} className="relative pl-10 border-l-2 border-slate-800 pb-4 animate-fade-in-up group" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#0B0F14', border: `2px solid ${EVENT_COLORS[event.type] || '#64748b'}` }}>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-sm">{EVENT_ICONS[event.type] || '📋'}</span>
                      <span className="text-sm font-medium text-white">{event.type?.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-600 font-mono">{new Date(event.occurredAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center space-x-3 mb-1">
                      <Link to={`/assets/${event.assetId}`} className="text-xs font-mono text-cyan-400 hover:underline">{event.assetTag}</Link>
                      <span className="text-xs text-slate-400">{event.assetName}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{event.assetDepartment}</span>
                    </div>
                    <div className="text-[10px] text-slate-600">by {event.actorName} · Seq #{event.seq}</div>
                    {event.payload && Object.keys(event.payload).length > 0 && (
                      <div className="mt-2 p-2 bg-slate-800/30 rounded-lg text-xs text-slate-500 max-w-lg">
                        {Object.entries(event.payload).slice(0, 4).map(([k, v]) => (
                          <span key={k} className="inline-block mr-3"><span className="text-slate-600">{k}:</span> <span className="text-slate-400">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[9px] font-mono text-emerald-400/40 bg-emerald-950/20 px-2 py-1 rounded flex items-center space-x-1 max-w-[120px]">
                      <Link2 size={8} /><span className="truncate">{event.hash}</span>
                    </div>
                    <Link to={`/assets/${event.assetId}`} className="p-1.5 rounded hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-all">
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/50">
              <span className="text-xs text-slate-500">Page {data.page} of {data.totalPages} ({data.total} events)</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages} className="p-1.5 rounded bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
