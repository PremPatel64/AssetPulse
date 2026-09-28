import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import TimeScrubber from '../components/TimeScrubber';
import { 
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Activity, AlertTriangle, CheckCircle, Database, IndianRupee, 
  TrendingDown, ShieldAlert, Clock, Wrench, ArrowUpRight, 
  ArrowDownRight, Building2, Cpu, Zap, Eye
} from 'lucide-react';

const formatCurrency = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

const CATEGORY_ICONS = {
  VEHICLE: '🚗', IT_EQUIPMENT: '💻', FURNITURE: '🪑', PUMP: '⚙️',
  TRANSFORMER: '⚡', DG_SET: '🔋', CHILLER: '❄️', HVAC: '🌡️',
  LIFT: '🛗', FIRE_SAFETY: '🧯', SECURITY: '📹', SOLAR: '☀️',
  WATER_TREATMENT: '💧', ELECTRICAL: '🔌', BUILDING: '🏛️',
  PLUMBING: '🔧', SENSOR: '📡', PANEL: '🎛️'
};

const STATUS_COLORS = {
  IN_SERVICE: '#10b981', UNDER_MAINTENANCE: '#f59e0b', IMPAIRED: '#ef4444',
  PROCURED: '#38bdf8', COMMISSIONED: '#10b981', DISPOSED: '#64748b',
  DECOMMISSIONED: '#64748b', REFURBISHED: '#a855f7'
};

const EVENT_COLORS = {
  CREATED: '#38bdf8', COMMISSIONED: '#10b981', INSPECTED: '#8b5cf6',
  MAINTENANCE_PERFORMED: '#f59e0b', FAULT_REPORTED: '#ef4444',
  CONDITION_UPDATED: '#06b6d4', DECOMMISSIONED: '#64748b', DISPOSED: '#64748b'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = date
          ? await api.get(`/api/portfolio/snapshot?date=${date}`)
          : await api.get('/api/portfolio/kpis');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date]);

  if (loading || !data) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-slate-500">Loading portfolio data...</span>
      </div>
    </div>
  );

  const donutData = Object.entries(data.byStatus || {}).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  const deptData = Object.entries(data.byDepartment || {}).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(data.byCategory || {}).map(([name, value]) => ({ name, value, icon: CATEGORY_ICONS[name] || '📦' }));

  const kpis = [
    { label: 'Total Assets', value: data.totalAssets, icon: Database, color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-400', trend: null },
    { label: 'Portfolio Value', value: formatCurrency(data.totalValue || 0), icon: IndianRupee, color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-400', trend: null },
    { label: 'Avg Health Index', value: data.avgAHI, icon: Activity, color: 'from-amber-500 to-orange-600', textColor: 'text-amber-400', trend: data.avgAHI >= 70 ? 'up' : 'down' },
    { label: 'Critical / At Risk', value: data.criticalCount || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-600', textColor: 'text-red-400', trend: 'alert' },
    { label: 'Depreciation', value: formatCurrency(data.depreciation || 0), icon: TrendingDown, color: 'from-purple-500 to-violet-600', textColor: 'text-purple-400' },
    { label: 'Warranty Expired', value: data.warrantyExpiredCount || 0, icon: ShieldAlert, color: 'from-orange-500 to-red-600', textColor: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>Government Asset Control Room</span>
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Real-time portfolio monitoring & health analytics</p>
        </div>
        <div className="w-80">
          <TimeScrubber onChange={setDate} />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card glass-card p-4 animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                <kpi.icon size={14} className="text-white" />
              </div>
            </div>
            <div className={`text-2xl font-bold font-mono ${kpi.textColor} animate-count-up`}>
              {kpi.value}
            </div>
            {kpi.trend === 'up' && <div className="flex items-center text-emerald-400 text-xs mt-1"><ArrowUpRight size={12} /> Healthy</div>}
            {kpi.trend === 'down' && <div className="flex items-center text-red-400 text-xs mt-1"><ArrowDownRight size={12} /> Below target</div>}
            {kpi.trend === 'alert' && <div className="flex items-center text-red-400 text-xs mt-1"><AlertTriangle size={12} className="mr-1" /> Needs attention</div>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Status Donut */}
        <div className="col-span-3 glass-card p-5 animate-fade-in-up stagger-2">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Asset Status Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name.replace(/ /g, '_')] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {donutData.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name.replace(/ /g, '_')] || '#64748b' }}></div>
                  <span className="text-slate-400">{entry.name}</span>
                </div>
                <span className="font-mono text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="col-span-5 glass-card p-5 animate-fade-in-up stagger-3">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Assets by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="col-span-4 glass-card p-5 animate-fade-in-up stagger-4 overflow-auto max-h-[380px]">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Asset Categories</h3>
          <div className="space-y-2">
            {categoryData.sort((a, b) => b.value - a.value).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm text-slate-300">{cat.name.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${(cat.value / (data.totalAssets || 1)) * 100}%` }}></div>
                  </div>
                  <span className="font-mono text-sm text-white w-6 text-right">{cat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: At-Risk + Activity Feed */}
      <div className="grid grid-cols-12 gap-4">
        {/* At-Risk Assets */}
        {data.atRisk && data.atRisk.length > 0 && (
          <div className="col-span-7 glass-card p-5 animate-fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-amber-500 font-semibold tracking-wider uppercase flex items-center space-x-2">
                <AlertTriangle size={14} />
                <span>At-Risk Assets (AHI &lt; 70)</span>
              </h3>
              <Link to="/assets?filter=at-risk" className="text-xs text-cyan-400 hover:underline">View all →</Link>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-600 border-b border-slate-800/50 font-mono tracking-wider">
                <tr>
                  <th className="pb-2">TAG</th>
                  <th className="pb-2">ASSET</th>
                  <th className="pb-2">DEPT</th>
                  <th className="pb-2">CONDITION</th>
                  <th className="pb-2">AHI</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.atRisk.map(asset => (
                  <tr key={asset._id} className="border-b border-slate-800/30 table-row-hover">
                    <td className="py-2.5 font-mono text-cyan-400 text-xs">{asset.tag}</td>
                    <td className="py-2.5 text-slate-300 text-xs max-w-[160px] truncate">{asset.name}</td>
                    <td className="py-2.5 text-slate-500 text-xs">{asset.department}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium status-${(asset.condition || '').toLowerCase()}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900/50">
                        {asset.ahi?.score ?? '—'}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Link to={`/assets/${asset._id}`} className="text-slate-500 hover:text-amber-400 transition-colors">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Activity Feed */}
        {data.recentEvents && (
          <div className={`${data.atRisk?.length > 0 ? 'col-span-5' : 'col-span-12'} glass-card p-5 animate-fade-in-up stagger-6 max-h-[380px] overflow-auto`}>
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4 flex items-center space-x-2">
              <Clock size={14} />
              <span>Recent Ledger Activity</span>
            </h3>
            <div className="space-y-3">
              {data.recentEvents.map((event, i) => (
                <div key={event._id || i} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
                  <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: EVENT_COLORS[event.type] || '#64748b' }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">{event.type?.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-600 font-mono">{new Date(event.occurredAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-cyan-400/70">{event.assetTag}</span> · {event.assetName}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">by {event.actorName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-5 animate-fade-in-up stagger-6">
        <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-3">Quick Actions</h3>
        <div className="grid grid-cols-6 gap-3">
          <Link to="/assets/new" className="p-4 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-amber-500/50 text-center transition-all group">
            <div className="text-2xl mb-1">➕</div>
            <p className="text-xs text-slate-400 group-hover:text-white">Register Asset</p>
          </Link>
          <Link to="/field" className="p-4 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-emerald-500/50 text-center transition-all group">
            <div className="text-2xl mb-1">🔧</div>
            <p className="text-xs text-slate-400 group-hover:text-white">Field Mode</p>
          </Link>
          <Link to="/maintenance" className="p-4 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-cyan-500/50 text-center transition-all group">
            <div className="text-2xl mb-1">📅</div>
            <p className="text-xs text-slate-400 group-hover:text-white">Maintenance</p>
          </Link>
          <Link to="/audit" className="p-4 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-emerald-500/50 text-center transition-all group">
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-slate-400 group-hover:text-white">Verify Ledger</p>
          </Link>
          <Link to="/reports" className="p-4 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-purple-500/50 text-center transition-all group">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-slate-400 group-hover:text-white">Reports</p>
          </Link>
          <Link to="/notifications" className="p-4 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-red-500/50 text-center transition-all group">
            <div className="text-2xl mb-1">🔔</div>
            <p className="text-xs text-slate-400 group-hover:text-white">Alerts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
