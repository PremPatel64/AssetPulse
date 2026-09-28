import { useState, useEffect } from 'react';
import api from '../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, Download, TrendingUp, IndianRupee, Building2, Cpu } from 'lucide-react';

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b', '#ec4899'];

const formatCurrency = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val?.toLocaleString('en-IN') || 0}`;
};

export default function Reports() {
  const [deptData, setDeptData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [activeReport, setActiveReport] = useState('department');

  useEffect(() => {
    async function load() {
      try {
        const [deptRes, catRes, kpiRes] = await Promise.all([
          api.get('/api/portfolio/departments'),
          api.get('/api/portfolio/categories'),
          api.get('/api/portfolio/kpis')
        ]);
        setDeptData(deptRes.data);
        setCatData(catRes.data);
        setKpis(kpiRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const reports = [
    { id: 'department', label: 'Department Analysis', icon: Building2 },
    { id: 'category', label: 'Category Breakdown', icon: Cpu },
    { id: 'financial', label: 'Financial Overview', icon: IndianRupee },
    { id: 'health', label: 'Health Distribution', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="text-amber-500" size={24} />
            <span>Reports & Analytics</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Comprehensive portfolio analytics for government asset oversight</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex space-x-2">
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
              activeReport === r.id 
                ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 font-medium' 
                : 'bg-slate-800/30 border border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700'
            }`}>
            <r.icon size={16} />
            <span>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Department Analysis */}
      {activeReport === 'department' && (
        <div className="grid grid-cols-2 gap-5 animate-fade-in">
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Assets by Department</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Department Value (₹)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData.map(d => ({ name: d._id, value: d.totalValue || 0 }))} innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val) => formatCurrency(val)} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-span-2 glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Department Summary Table</h3>
            <table className="w-full text-sm">
              <thead className="text-[10px] text-slate-600 border-b border-slate-800/50 font-mono tracking-wider">
                <tr>
                  <th className="text-left pb-2">DEPARTMENT</th>
                  <th className="text-right pb-2">ASSETS</th>
                  <th className="text-right pb-2">TOTAL COST</th>
                  <th className="text-right pb-2">CURRENT VALUE</th>
                  <th className="text-right pb-2">DEPRECIATION</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((d, i) => (
                  <tr key={i} className="border-b border-slate-800/30 table-row-hover">
                    <td className="py-2.5 text-white font-medium">{d._id}</td>
                    <td className="py-2.5 text-right font-mono text-cyan-400">{d.count}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{formatCurrency(d.totalCost)}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-400">{formatCurrency(d.totalValue)}</td>
                    <td className="py-2.5 text-right font-mono text-red-400">{formatCurrency((d.totalCost || 0) - (d.totalValue || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {activeReport === 'category' && (
        <div className="grid grid-cols-2 gap-5 animate-fade-in">
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Category Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData.map(c => ({ name: c._id?.replace(/_/g, ' '), value: c.count }))} innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Avg Condition Score by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData.map(c => ({ name: c._id?.replace(/_/g, ' '), score: Math.round((c.avgCondition || 3) * 20) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={20}>
                    {catData.map((c, i) => {
                      const score = Math.round((c.avgCondition || 3) * 20);
                      return <Cell key={i} fill={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview */}
      {activeReport === 'financial' && kpis && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-card p-5 text-center">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Total Purchase Cost</p>
              <p className="text-2xl font-bold font-mono text-white mt-2">{formatCurrency(kpis.totalPurchaseCost)}</p>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Current Book Value</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">{formatCurrency(kpis.totalValue)}</p>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Total Depreciation</p>
              <p className="text-2xl font-bold font-mono text-red-400 mt-2">{formatCurrency(kpis.depreciation)}</p>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Warranty Expired</p>
              <p className="text-2xl font-bold font-mono text-orange-400 mt-2">{kpis.warrantyExpiredCount}</p>
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Value by Department</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData.map(d => ({ name: d._id, cost: d.totalCost, value: d.totalValue }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val) => formatCurrency(val)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="cost" name="Purchase Cost" fill="#64748b" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="value" name="Current Value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Health Distribution */}
      {activeReport === 'health' && kpis && (
        <div className="grid grid-cols-2 gap-5 animate-fade-in">
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Condition Distribution</h3>
            <div className="space-y-3">
              {['IN_SERVICE', 'UNDER_MAINTENANCE', 'IMPAIRED', 'PROCURED', 'DECOMMISSIONED', 'DISPOSED'].map(status => {
                const count = kpis.byStatus?.[status] || 0;
                const pct = kpis.totalAssets > 0 ? (count / kpis.totalAssets) * 100 : 0;
                const colors = { IN_SERVICE: '#10b981', UNDER_MAINTENANCE: '#f59e0b', IMPAIRED: '#ef4444', PROCURED: '#38bdf8', DECOMMISSIONED: '#64748b', DISPOSED: '#64748b' };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{status.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-white">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: colors[status] || '#64748b' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Portfolio Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold font-mono text-white">{kpis.totalAssets}</p>
                <p className="text-xs text-slate-500 mt-1">Total Assets</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold font-mono text-amber-400">{kpis.avgAHI}</p>
                <p className="text-xs text-slate-500 mt-1">Avg AHI</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold font-mono text-red-400">{kpis.criticalCount}</p>
                <p className="text-xs text-slate-500 mt-1">Critical</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold font-mono text-orange-400">{kpis.nonCompliantCount}</p>
                <p className="text-xs text-slate-500 mt-1">Non-Compliant</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
