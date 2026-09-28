import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  tag: { type: String, unique: true, required: true },       // GOV-VEH-0001
  name: String,
  category: { 
    enum: [
      'VEHICLE','IT_EQUIPMENT','FURNITURE','BUILDING','PUMP','TRANSFORMER',
      'DG_SET','CHILLER','PANEL','LIFT','SENSOR','HVAC','ELECTRICAL',
      'PLUMBING','FIRE_SAFETY','SECURITY','SOLAR','WATER_TREATMENT'
    ], 
    type: String 
  },
  department: String,        // "Public Works", "IT", "Transport", "Health"
  site: String,              // building or campus name
  location: String,          // floor / room
  manufacturer: String, 
  model: String, 
  serial: String,
  purchaseDate: Date, 
  purchaseCost: Number, 
  currentValue: Number,      // depreciated value
  designLifeYears: Number,
  warrantyExpiry: Date,
  maintenanceIntervalDays: { type: Number, default: 90 },
  status: { 
    enum: [
      'PROCURED', 'COMMISSIONED', 'IN_SERVICE', 'UNDER_MAINTENANCE', 
      'IMPAIRED', 'REFURBISHED', 'DECOMMISSIONED', 'DISPOSED'
    ], 
    default: 'PROCURED',
    type: String
  },
  condition: { enum: ['EXCELLENT','GOOD','FAIR','POOR','CRITICAL'], default: 'GOOD', type: String },
  priority: { enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM', type: String },
  lastInspectionAt: Date, 
  lastInspectionScore: Number,  // 1-5
  lastMaintenanceAt: Date,
  nextMaintenanceDue: Date,
  openFaults: [{ code: String, severity: Number, reportedAt: Date, description: String }],
  custodian: String,
  custodianContact: String,
  eventCount: Number, 
  lastEventHash: String,
  geoCoords: {
    lat: Number,
    lng: Number
  },
  documents: [{
    name: String,
    type: String,  // 'WARRANTY', 'MANUAL', 'INSPECTION_REPORT', 'PURCHASE_ORDER'
    uploadedAt: Date
  }],
  compliance: {
    lastAuditDate: Date,
    nextAuditDue: Date,
    certifications: [String],
    isCompliant: { type: Boolean, default: true }
  },
  insurancePolicy: String,
  budgetCode: String,
  notes: String
}, { timestamps: true });

assetSchema.index({ tag: 1 });
assetSchema.index({ department: 1, status: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ site: 1 });

export default mongoose.model('Asset', assetSchema);
