import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import TimeScrubber from '../components/TimeScrubber';
import { Link2, ArrowLeft, MapPin, Calendar, IndianRupee, Shield, Wrench, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AHI_RING_COLORS = { good: '#10b981', warning: '#f59e0b', critical: '#ef4444' };

function AhiGauge({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? AHI_RING_COLORS.good : score >= 60 ? AHI_RING_COLORS.warning : AHI_RING_COLORS.critical;

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono text-white">{score}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">AHI Score</span>
      </div>
    </div>
  );
}

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const [assetRes, eventsRes] = await Promise.all([
          api.get(`/api/assets/${id}`),
          api.get(`/api/assets/${id}/events`)
        ]);
        setAsset(assetRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id, date]);

  if (!asset) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Event Timeline' },
    { id: 'financials', label: 'Financials' },
    { id: 'compliance', label: 'Compliance' },
  ];

  const STATUS_CLASSES = {
    IN_SERVICE: 'status-in-service', UNDER_MAINTENANCE: 'status-under-maintenance',
    IMPAIRED: 'status-impaired', DISPOSED: 'status-disposed',
    DECOMMISSIONED: 'status-decommissioned', PROCURED: 'status-procured'
  };

  const EVENT_COLORS = {
    CREATED: '#38bdf8', COMMISSIONED: '#10b981', INSPECTED: '#8b5cf6',
    MAINTENANCE_PERFORMED: '#f59e0b', FAULT_REPORTED: '#ef4444',
    CONDITION_UPDATED: '#06b6d4', DECOMMISSIONED: '#64748b'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-center space-x-3 text-sm">
        <Link to="/assets" className="flex items-center space-x-1 text-slate-500 hover:text-amber-400 transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Register</span>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-white">{asset.name}</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[asset.status] || ''}`}>
              {asset.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
            <span className="font-mono text-cyan-400">{asset.tag}</span>
            <span>•</span>
            <span>{asset.category?.replace(/_/g, ' ')}</span>
            <span>•</span>
            <span>{asset.department}</span>
            {asset.site && <><span>•</span><span className="flex items-center space-x-1"><MapPin size={12} /><span>{asset.site}</span></span></>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-72">
            <TimeScrubber onChange={setDate} />
          </div>
          {asset.status !== 'DISPOSED' && asset.status !== 'DECOMMISSIONED' && (
            <div className="flex items-center space-x-2 ml-4">
              <Link to={`/assets/${id}/transfer`} className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 text-xs transition-all">
                <span>↗ Transfer</span>
              </Link>
              <button onClick={async () => { if(confirm('Dispose this asset? This is irreversible.')) { await api.post(`/api/assets/${id}/dispose`, { reason: 'End of life', method: 'Auction', approvedBy: 'Director' }); window.location.reload(); }}} className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/30 text-xs transition-all">
                <span>🗑 Dispose</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-800/50">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm transition-all border-b-2 ${activeTab === tab.id ? 'text-amber-400 border-amber-500 font-medium' : 'text-slate-500 border-transparent hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-5 animate-fade-in">
          {/* AHI + Details */}
          <div className="col-span-2 space-y-5">
            <div className="glass-card p-6">
              <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-5">Asset Health Index</h3>
              <div className="flex items-center space-x-8">
                <AhiGauge score={asset.ahi?.score || 100} />
                <div className="flex-1 space-y-3">
                  {asset.ahi?.breakdown?.length > 0 ? asset.ahi.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(item.deduct * 5, 100)}%` }}></div>
                        </div>
                        <span className="text-xs font-mono text-red-400">-{item.deduct}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm">No deductions — asset is in excellent condition.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-3">Equipment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Manufacturer</span><span className="text-white">{asset.manufacturer || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="text-white font-mono">{asset.model || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Serial No.</span><span className="text-white font-mono">{asset.serial || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Design Life</span><span className="text-white">{asset.designLifeYears ? `${asset.designLifeYears} years` : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-white">{asset.location || '—'}</span></div>
                </div>
              </div>
              <div className="glass-card p-4">
                <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-3">Maintenance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Interval</span><span className="text-white">{asset.maintenanceIntervalDays || 90} days</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Last Inspection</span><span className="text-white">{asset.lastInspectionAt ? new Date(asset.lastInspectionAt).toLocaleDateString('en-IN') : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Last Maintenance</span><span className="text-white">{asset.lastMaintenanceAt ? new Date(asset.lastMaintenanceAt).toLocaleDateString('en-IN') : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Custodian</span><span className="text-white">{asset.custodian || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Priority</span>
                    <span className={`font-medium ${asset.priority === 'CRITICAL' ? 'text-red-400' : asset.priority === 'HIGH' ? 'text-amber-400' : 'text-slate-400'}`}>{asset.priority || 'MEDIUM'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Open Faults */}
            {asset.openFaults?.length > 0 && (
              <div className="glass-card p-4 border-l-4 border-l-red-500">
                <h4 className="text-xs text-red-400 font-semibold tracking-wider uppercase mb-3 flex items-center space-x-2">
                  <AlertTriangle size={14} /><span>Open Faults ({asset.openFaults.length})</span>
                </h4>
                <div className="space-y-2">
                  {asset.openFaults.map((fault, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-900/10 border border-red-900/30">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs text-red-400">{fault.code}</span>
                        <span className="text-xs text-slate-400">{fault.description}</span>
                      </div>
                      <span className="text-xs font-mono bg-red-900/30 px-2 py-0.5 rounded text-red-400">SEV {fault.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: QR + Quick Actions */}
          <div className="space-y-5">
            <div className="glass-card p-5 text-center">
              <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-4">Field QR Code</h4>
              <div className="inline-block bg-white p-3 rounded-lg">
                <QRCodeSVG value={`assetpulse://${asset.tag}`} size={140} />
              </div>
              <p className="text-[10px] text-slate-500 mt-3">Scan with Field Mode app</p>
            </div>

            <div className="glass-card p-5">
              <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-3">Quick Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Calendar size={14} className="text-slate-500" />
                  <span className="text-slate-400">Purchased: {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <IndianRupee size={14} className="text-slate-500" />
                  <span className="text-slate-400">Cost: ₹{(asset.purchaseCost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield size={14} className="text-slate-500" />
                  <span className="text-slate-400">Warranty: {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText size={14} className="text-slate-500" />
                  <span className="text-slate-400">Budget: {asset.budgetCode || '—'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield size={14} className="text-slate-500" />
                  <span className="text-slate-400">Insurance: {asset.insurancePolicy || '—'}</span>
                </div>
              </div>
            </div>

            {/* Events count */}
            <div className="glass-card p-4 text-center">
              <span className="text-3xl font-bold font-mono text-cyan-400">{events.length}</span>
              <p className="text-xs text-slate-500 mt-1">Immutable Ledger Events</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="glass-card p-6 max-h-[600px] overflow-auto animate-fade-in">
          <div className="space-y-6">
            {events.slice().reverse().map((e, i) => (
              <div key={e._id} className="relative pl-8 border-l-2 border-slate-800 animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-[#0B0F14]" style={{ borderColor: EVENT_COLORS[e.type] || '#64748b' }}></div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{e.type?.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-600 font-mono">Seq #{e.seq} · {new Date(e.occurredAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">by {e.actorName}</div>
                {e.payload && Object.keys(e.payload).length > 0 && (
                  <div className="text-xs text-slate-500 bg-slate-800/30 rounded-lg p-3 mb-2">
                    {Object.entries(e.payload).map(([k, v]) => (
                      <div key={k} className="flex items-center space-x-2">
                        <span className="text-slate-600">{k}:</span>
                        <span className="text-slate-400">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400/50 bg-emerald-950/20 p-2 rounded">
                  <Link2 size={10} />
                  <span className="truncate">{e.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-3 gap-5 animate-fade-in">
          <div className="glass-card p-5">
            <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-2">Purchase Cost</h4>
            <span className="text-2xl font-bold font-mono text-white">₹{(asset.purchaseCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="glass-card p-5">
            <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-2">Current Value</h4>
            <span className="text-2xl font-bold font-mono text-emerald-400">₹{(asset.currentValue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="glass-card p-5">
            <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-2">Depreciation</h4>
            <span className="text-2xl font-bold font-mono text-red-400">₹{((asset.purchaseCost || 0) - (asset.currentValue || 0)).toLocaleString('en-IN')}</span>
          </div>
          <div className="col-span-3 glass-card p-5">
            <h4 className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-3">Maintenance Costs</h4>
            <div className="space-y-2">
              {events.filter(e => e.type === 'MAINTENANCE_PERFORMED' && e.payload?.cost).map((e, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-800/30">
                  <div>
                    <span className="text-xs text-white">{e.payload.notes || 'Maintenance'}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{new Date(e.occurredAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <span className="font-mono text-sm text-amber-400">₹{(e.payload.cost || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {events.filter(e => e.type === 'MAINTENANCE_PERFORMED' && e.payload?.cost).length === 0 && (
                <p className="text-slate-500 text-sm">No maintenance cost records found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="grid grid-cols-2 gap-5 animate-fade-in">
          <div className="glass-card p-5">
            <h4 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Compliance Status</h4>
            <div className="flex items-center space-x-3 mb-4">
              {asset.compliance?.isCompliant ? (
                <><CheckCircle size={24} className="text-emerald-500" /><span className="text-lg text-emerald-400 font-bold">Compliant</span></>
              ) : (
                <><AlertTriangle size={24} className="text-red-500" /><span className="text-lg text-red-400 font-bold">Non-Compliant</span></>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Last Audit</span><span className="text-white">{asset.compliance?.lastAuditDate ? new Date(asset.compliance.lastAuditDate).toLocaleDateString('en-IN') : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Next Audit Due</span><span className="text-white">{asset.compliance?.nextAuditDue ? new Date(asset.compliance.nextAuditDue).toLocaleDateString('en-IN') : '—'}</span></div>
            </div>
          </div>
          <div className="glass-card p-5">
            <h4 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Certifications</h4>
            <div className="space-y-2">
              {asset.compliance?.certifications?.length > 0 ? asset.compliance.certifications.map((cert, i) => (
                <div key={i} className="flex items-center space-x-2 p-2 rounded bg-emerald-900/10 border border-emerald-900/30">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-sm text-emerald-400">{cert}</span>
                </div>
              )) : <p className="text-slate-500 text-sm">No certifications recorded.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
