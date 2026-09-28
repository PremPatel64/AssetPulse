import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Eye, SlidersHorizontal } from 'lucide-react';

const STATUS_CLASSES = {
  IN_SERVICE: 'status-in-service',
  UNDER_MAINTENANCE: 'status-under-maintenance',
  IMPAIRED: 'status-impaired',
  DISPOSED: 'status-disposed',
  DECOMMISSIONED: 'status-decommissioned',
  PROCURED: 'status-procured',
  COMMISSIONED: 'status-commissioned',
  REFURBISHED: 'status-refurbished',
};

const CATEGORY_ICONS = {
  VEHICLE: '🚗', IT_EQUIPMENT: '💻', FURNITURE: '🪑', PUMP: '⚙️',
  TRANSFORMER: '⚡', DG_SET: '🔋', CHILLER: '❄️', HVAC: '🌡️',
  LIFT: '🛗', FIRE_SAFETY: '🧯', SECURITY: '📹', SOLAR: '☀️',
  WATER_TREATMENT: '💧', ELECTRICAL: '🔌'
};

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (statusFilter) params.set('status', statusFilter);
        if (categoryFilter) params.set('category', categoryFilter);
        params.set('page', page);
        const res = await api.get(`/api/assets?${params.toString()}`);
        setAssets(res.data.items);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [search, statusFilter, categoryFilter, page]);

  const getAhiColor = (score) => {
    if (score >= 80) return 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50';
    if (score >= 60) return 'bg-amber-900/30 text-amber-400 border border-amber-900/50';
    return 'bg-red-900/30 text-red-400 border border-red-900/50';
  };

  const totalPages = Math.ceil(total / 20);

  const exportCSV = () => {
    const headers = ['Tag', 'Name', 'Category', 'Department', 'Status', 'Condition', 'AHI', 'Purchase Cost', 'Current Value'];
    const rows = assets.map(a => [a.tag, a.name, a.category, a.department, a.status, a.condition, a.ahi?.score || 100, a.purchaseCost, a.currentValue]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'assets_export.csv'; a.click();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Government Asset Register</h2>
          <p className="text-sm text-slate-500 mt-1">{total} assets tracked across all departments</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={exportCSV} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/50 text-sm transition-all">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <Link to="/assets/new" className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all">
            <span>+ Register Asset</span>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by tag, name, or department..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-lg border transition-all ${showFilters ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'}`}>
            <SlidersHorizontal size={18} />
          </button>
        </div>
        {showFilters && (
          <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-slate-800/50 animate-fade-in">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50">
              <option value="">All Statuses</option>
              <option value="IN_SERVICE">In Service</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="IMPAIRED">Impaired</option>
              <option value="PROCURED">Procured</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
              <option value="DISPOSED">Disposed</option>
            </select>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50">
              <option value="">All Categories</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="PUMP">Pump</option>
              <option value="TRANSFORMER">Transformer</option>
              <option value="DG_SET">DG Set</option>
              <option value="CHILLER">Chiller</option>
              <option value="HVAC">HVAC</option>
              <option value="LIFT">Lift</option>
              <option value="FIRE_SAFETY">Fire Safety</option>
              <option value="SECURITY">Security</option>
              <option value="SOLAR">Solar</option>
              <option value="FURNITURE">Furniture</option>
              <option value="ELECTRICAL">Electrical</option>
            </select>
            {(statusFilter || categoryFilter) && (
              <button onClick={() => { setStatusFilter(''); setCategoryFilter(''); }} className="text-xs text-amber-400 hover:underline">Clear filters</button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-slate-600 border-b border-slate-800/50 font-mono tracking-wider bg-slate-900/30">
            <tr>
              <th className="px-4 py-3">TAG</th>
              <th className="px-4 py-3">ASSET NAME</th>
              <th className="px-4 py-3">CATEGORY</th>
              <th className="px-4 py-3">DEPARTMENT</th>
              <th className="px-4 py-3">STATUS</th>
              <th className="px-4 py-3">CONDITION</th>
              <th className="px-4 py-3">AHI</th>
              <th className="px-4 py-3">VALUE</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, i) => (
              <tr key={asset._id} className={`border-b border-slate-800/30 table-row-hover animate-fade-in-up`} style={{ animationDelay: `${i * 30}ms` }}>
                <td className="px-4 py-3 font-mono text-cyan-400 text-xs">{asset.tag}</td>
                <td className="px-4 py-3 text-white font-medium text-xs max-w-[200px] truncate">{asset.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  <span className="flex items-center space-x-1.5">
                    <span>{CATEGORY_ICONS[asset.category] || '📦'}</span>
                    <span>{asset.category?.replace(/_/g, ' ')}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{asset.department}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CLASSES[asset.status] || ''}`}>
                    {asset.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{asset.condition}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded ${getAhiColor(asset.ahi?.score || 100)}`}>
                    {asset.ahi?.score || 100}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {asset.currentValue ? `₹${(asset.currentValue / 100000).toFixed(1)}L` : '—'}
                </td>
                <td className="px-4 py-3">
                  <Link to={`/assets/${asset._id}`} className="p-1.5 rounded-md hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-all inline-flex">
                    <Eye size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50">
            <span className="text-xs text-slate-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-400 font-mono">Page {page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
