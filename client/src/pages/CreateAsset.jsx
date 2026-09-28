import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PlusCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  'VEHICLE','IT_EQUIPMENT','FURNITURE','BUILDING','PUMP','TRANSFORMER',
  'DG_SET','CHILLER','PANEL','LIFT','SENSOR','HVAC','ELECTRICAL',
  'PLUMBING','FIRE_SAFETY','SECURITY','SOLAR','WATER_TREATMENT'
];
const DEPARTMENTS = ['Public Works', 'Information Technology', 'Transport', 'Health', 'Education', 'Revenue', 'Municipal Corp'];
const SITES = [
  'Mantralaya Main Building', 'District Collectorate', 'Civil Hospital Campus',
  'Govt ITI Polytechnic', 'Municipal Water Plant', 'Zilla Parishad Office',
  'State Data Center', 'Transport Nagar Depot', 'PWD Regional Office'
];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CreateAsset() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    tag: '', name: '', category: 'IT_EQUIPMENT', department: 'Public Works',
    site: 'Mantralaya Main Building', location: '', manufacturer: '', model: '',
    serial: '', purchaseDate: '', purchaseCost: '', designLifeYears: '',
    maintenanceIntervalDays: 90, priority: 'MEDIUM', custodian: '',
    budgetCode: '', insurancePolicy: '', notes: ''
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.purchaseCost) payload.purchaseCost = Number(payload.purchaseCost);
      if (payload.designLifeYears) payload.designLifeYears = Number(payload.designLifeYears);
      if (payload.maintenanceIntervalDays) payload.maintenanceIntervalDays = Number(payload.maintenanceIntervalDays);
      
      const res = await api.post('/api/assets', payload);
      setSuccess(true);
      setTimeout(() => navigate(`/assets/${res.data._id}`), 1500);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create asset');
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-white">Asset Registered Successfully</h3>
      <p className="text-slate-500 mt-2">Redirecting to asset detail...</p>
    </div>
  );

  const InputField = ({ label, field, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">{label}{required && <span className="text-red-400">*</span>}</label>
      <input type={type} value={form[field]} onChange={e => updateField(field, e.target.value)} placeholder={placeholder}
        required={required}
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600" />
    </div>
  );

  const SelectField = ({ label, field, options, required }) => (
    <div>
      <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">{label}{required && <span className="text-red-400">*</span>}</label>
      <select value={form[field]} onChange={e => updateField(field, e.target.value)} required={required}
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all">
        {options.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate('/assets')} className="flex items-center space-x-1 text-sm text-slate-500 hover:text-amber-400 transition-colors">
        <ArrowLeft size={16} /><span>Back to Register</span>
      </button>

      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <PlusCircle className="text-amber-500" size={24} />
          <span>Register New Government Asset</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">This will create an immutable CREATED event on the ledger.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-6">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Basic Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Asset Tag" field="tag" placeholder="GOV-XXX-000" required />
            <InputField label="Asset Name" field="name" placeholder="Full asset description" required />
            <SelectField label="Category" field="category" options={CATEGORIES} required />
            <SelectField label="Department" field="department" options={DEPARTMENTS} required />
            <SelectField label="Site / Campus" field="site" options={SITES} required />
            <InputField label="Location (Floor/Room)" field="location" placeholder="e.g. Floor 2, Room 205" />
          </div>
        </div>

        {/* Equipment Details */}
        <div className="glass-card p-6">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Equipment Details</h3>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Manufacturer" field="manufacturer" placeholder="e.g. Tata, HP, Kirloskar" />
            <InputField label="Model" field="model" placeholder="Model number" />
            <InputField label="Serial Number" field="serial" placeholder="OEM serial" />
          </div>
        </div>

        {/* Financial & Lifecycle */}
        <div className="glass-card p-6">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Financial & Lifecycle</h3>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Purchase Date" field="purchaseDate" type="date" />
            <InputField label="Purchase Cost (₹)" field="purchaseCost" type="number" placeholder="0" />
            <InputField label="Design Life (years)" field="designLifeYears" type="number" placeholder="10" />
            <InputField label="Maintenance Interval (days)" field="maintenanceIntervalDays" type="number" placeholder="90" />
            <SelectField label="Priority" field="priority" options={PRIORITIES} />
            <InputField label="Budget Code" field="budgetCode" placeholder="BUD-2024-XXXX" />
          </div>
        </div>

        {/* Custodian & Notes */}
        <div className="glass-card p-6">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Custodian & Remarks</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Custodian Name" field="custodian" placeholder="Responsible officer" />
            <InputField label="Insurance Policy" field="insurancePolicy" placeholder="INS-XXXXX" />
          </div>
          <div className="mt-4">
            <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} rows={3} placeholder="Additional remarks..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-600 resize-none" />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/assets')} className="px-6 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white text-sm transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 transition-all">
            {saving ? 'Registering...' : 'Register Asset on Ledger'}
          </button>
        </div>
      </form>
    </div>
  );
}
