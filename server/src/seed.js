import mongoose from 'mongoose';
import User from './models/User.js';
import Asset from './models/Asset.js';
import AssetEvent from './models/AssetEvent.js';
import { appendEvent } from './services/ledger.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assetpulse_gov';

const DEPARTMENTS = ['Public Works', 'Information Technology', 'Transport', 'Health', 'Education', 'Revenue', 'Municipal Corp'];
const SITES = [
  'Mantralaya Main Building', 'District Collectorate', 'Civil Hospital Campus',
  'Govt ITI Polytechnic', 'Municipal Water Plant', 'Zilla Parishad Office',
  'State Data Center', 'Transport Nagar Depot', 'PWD Regional Office'
];

const ASSETS_DATA = [
  // Vehicles
  { tag: 'GOV-VEH-001', name: 'Mahindra Bolero (District Collector)', category: 'VEHICLE', department: 'Revenue', site: 'District Collectorate', manufacturer: 'Mahindra', model: 'Bolero B6', purchaseCost: 980000, designLifeYears: 10, priority: 'HIGH', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-VEH-002', name: 'Tata Ace Mini Truck', category: 'VEHICLE', department: 'Public Works', site: 'PWD Regional Office', manufacturer: 'Tata Motors', model: 'Ace Gold', purchaseCost: 650000, designLifeYears: 8, priority: 'MEDIUM', status: 'IN_SERVICE', condition: 'FAIR' },
  { tag: 'GOV-VEH-003', name: 'Force Traveller (Staff Bus)', category: 'VEHICLE', department: 'Education', site: 'Govt ITI Polytechnic', manufacturer: 'Force Motors', model: 'Traveller 26', purchaseCost: 1850000, designLifeYears: 12, priority: 'MEDIUM', status: 'UNDER_MAINTENANCE', condition: 'POOR' },
  { tag: 'GOV-VEH-004', name: 'Toyota Innova (CMO)', category: 'VEHICLE', department: 'Municipal Corp', site: 'Zilla Parishad Office', manufacturer: 'Toyota', model: 'Innova Crysta', purchaseCost: 2150000, designLifeYears: 10, priority: 'HIGH', status: 'IN_SERVICE', condition: 'EXCELLENT' },
  { tag: 'GOV-VEH-005', name: 'Ashok Leyland Garbage Truck', category: 'VEHICLE', department: 'Municipal Corp', site: 'Transport Nagar Depot', manufacturer: 'Ashok Leyland', model: 'Ecomet 1015', purchaseCost: 2800000, designLifeYears: 15, priority: 'CRITICAL', status: 'IMPAIRED', condition: 'CRITICAL' },

  // IT Equipment
  { tag: 'GOV-IT-001', name: 'Dell PowerEdge R740 Server', category: 'IT_EQUIPMENT', department: 'Information Technology', site: 'State Data Center', manufacturer: 'Dell', model: 'PowerEdge R740', purchaseCost: 450000, designLifeYears: 5, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-IT-002', name: 'HP LaserJet Enterprise MFP', category: 'IT_EQUIPMENT', department: 'Revenue', site: 'District Collectorate', manufacturer: 'HP', model: 'LaserJet M635', purchaseCost: 125000, designLifeYears: 5, priority: 'MEDIUM', status: 'IN_SERVICE', condition: 'FAIR' },
  { tag: 'GOV-IT-003', name: 'Cisco Catalyst 9300 Switch', category: 'IT_EQUIPMENT', department: 'Information Technology', site: 'State Data Center', manufacturer: 'Cisco', model: 'C9300-48P', purchaseCost: 380000, designLifeYears: 7, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'EXCELLENT' },
  { tag: 'GOV-IT-004', name: 'Lenovo ThinkStation Workstation', category: 'IT_EQUIPMENT', department: 'Public Works', site: 'PWD Regional Office', manufacturer: 'Lenovo', model: 'ThinkStation P340', purchaseCost: 95000, designLifeYears: 5, priority: 'LOW', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-IT-005', name: 'UPS 10KVA (Server Room)', category: 'ELECTRICAL', department: 'Information Technology', site: 'State Data Center', manufacturer: 'APC', model: 'Smart-UPS SRT10K', purchaseCost: 320000, designLifeYears: 8, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },

  // Pumps & Water Treatment
  { tag: 'GOV-PMP-001', name: 'Main Water Pump Station A', category: 'PUMP', department: 'Municipal Corp', site: 'Municipal Water Plant', manufacturer: 'Kirloskar', model: 'KDS-1050++', purchaseCost: 1200000, designLifeYears: 15, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-PMP-002', name: 'Submersible Borewell Pump', category: 'PUMP', department: 'Municipal Corp', site: 'Municipal Water Plant', manufacturer: 'Crompton', model: '6W12R10', purchaseCost: 280000, designLifeYears: 10, priority: 'HIGH', status: 'UNDER_MAINTENANCE', condition: 'FAIR' },
  { tag: 'GOV-WTP-001', name: 'Chlorination System', category: 'WATER_TREATMENT', department: 'Municipal Corp', site: 'Municipal Water Plant', manufacturer: 'Ion Exchange', model: 'INDION-CLR200', purchaseCost: 850000, designLifeYears: 12, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'EXCELLENT' },

  // Power & Electrical
  { tag: 'GOV-DG-001', name: 'DG Set 500KVA (Mantralaya)', category: 'DG_SET', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'Cummins', model: 'C500D5', purchaseCost: 3500000, designLifeYears: 20, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-DG-002', name: 'DG Set 125KVA (Hospital)', category: 'DG_SET', department: 'Health', site: 'Civil Hospital Campus', manufacturer: 'Mahindra Powerol', model: 'MP-125', purchaseCost: 1100000, designLifeYears: 15, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'FAIR' },
  { tag: 'GOV-TRF-001', name: '1000KVA Transformer', category: 'TRANSFORMER', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'ABB', model: 'Distribution 1000', purchaseCost: 2800000, designLifeYears: 25, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-SOL-001', name: '100kW Rooftop Solar Array', category: 'SOLAR', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'Tata Solar', model: 'TP-350', purchaseCost: 5500000, designLifeYears: 25, priority: 'HIGH', status: 'IN_SERVICE', condition: 'EXCELLENT' },

  // HVAC & Building Systems
  { tag: 'GOV-CHI-001', name: 'Chiller 200TR (Central)', category: 'CHILLER', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'Carrier', model: '30XA-200', purchaseCost: 4200000, designLifeYears: 20, priority: 'HIGH', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-HVC-001', name: 'AHU Floor 3 (Mantralaya)', category: 'HVAC', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'Blue Star', model: 'AHU-5000', purchaseCost: 680000, designLifeYears: 15, priority: 'MEDIUM', status: 'IN_SERVICE', condition: 'FAIR' },
  { tag: 'GOV-LFT-001', name: 'Passenger Lift (Main Block)', category: 'LIFT', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'KONE', model: 'MonoSpace 500', purchaseCost: 2500000, designLifeYears: 20, priority: 'HIGH', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-LFT-002', name: 'Goods Lift (Hospital)', category: 'LIFT', department: 'Health', site: 'Civil Hospital Campus', manufacturer: 'Otis', model: 'Gen2 Freight', purchaseCost: 1800000, designLifeYears: 20, priority: 'HIGH', status: 'IMPAIRED', condition: 'POOR' },

  // Fire Safety & Security
  { tag: 'GOV-FIR-001', name: 'Fire Alarm Panel (Mantralaya)', category: 'FIRE_SAFETY', department: 'Public Works', site: 'Mantralaya Main Building', manufacturer: 'Honeywell', model: 'Morley-IAS', purchaseCost: 950000, designLifeYears: 10, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-FIR-002', name: 'Fire Suppression System (DC)', category: 'FIRE_SAFETY', department: 'Information Technology', site: 'State Data Center', manufacturer: 'Tyco', model: 'FM-200', purchaseCost: 1500000, designLifeYears: 15, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'EXCELLENT' },
  { tag: 'GOV-SEC-001', name: 'CCTV System 64-Channel', category: 'SECURITY', department: 'Municipal Corp', site: 'Zilla Parishad Office', manufacturer: 'Hikvision', model: 'DS-9664NI', purchaseCost: 420000, designLifeYears: 7, priority: 'HIGH', status: 'IN_SERVICE', condition: 'GOOD' },

  // Furniture & Office
  { tag: 'GOV-FRN-001', name: 'Modular Workstations (20 Units)', category: 'FURNITURE', department: 'Revenue', site: 'District Collectorate', manufacturer: 'Godrej', model: 'Interio Script', purchaseCost: 600000, designLifeYears: 10, priority: 'LOW', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-FRN-002', name: 'Conference Table (Boardroom)', category: 'FURNITURE', department: 'Municipal Corp', site: 'Zilla Parishad Office', manufacturer: 'Nilkamal', model: 'Executive 3600', purchaseCost: 85000, designLifeYears: 15, priority: 'LOW', status: 'IN_SERVICE', condition: 'EXCELLENT' },

  // Medical Equipment
  { tag: 'GOV-MED-001', name: 'X-Ray Machine (Radiology)', category: 'IT_EQUIPMENT', department: 'Health', site: 'Civil Hospital Campus', manufacturer: 'Siemens', model: 'MULTIX Impact', purchaseCost: 3200000, designLifeYears: 10, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'GOOD' },
  { tag: 'GOV-MED-002', name: 'Ventilator (ICU Ward)', category: 'IT_EQUIPMENT', department: 'Health', site: 'Civil Hospital Campus', manufacturer: 'Medtronic', model: 'PB 980', purchaseCost: 1800000, designLifeYears: 8, priority: 'CRITICAL', status: 'IN_SERVICE', condition: 'FAIR' },

  // Disposed / Decommissioned
  { tag: 'GOV-VEH-010', name: 'Ambassador Car (Scrapped)', category: 'VEHICLE', department: 'Revenue', site: 'Transport Nagar Depot', manufacturer: 'Hindustan Motors', model: 'Ambassador Mark IV', purchaseCost: 450000, designLifeYears: 15, priority: 'LOW', status: 'DISPOSED', condition: 'CRITICAL' },
  { tag: 'GOV-IT-010', name: 'HP ProLiant DL360 (Retired)', category: 'IT_EQUIPMENT', department: 'Information Technology', site: 'State Data Center', manufacturer: 'HP', model: 'ProLiant DL360', purchaseCost: 280000, designLifeYears: 5, priority: 'LOW', status: 'DECOMMISSIONED', condition: 'POOR' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Asset.deleteMany({});
  await AssetEvent.deleteMany({});

  // Create users
  const admin = await User.create({ name: 'Rajesh Kumar (Director)', email: 'admin@assetpulse.io', passwordHash: 'Admin@123', role: 'ADMIN' });
  const manager = await User.create({ name: 'Priya Sharma (Dy. Director)', email: 'manager@assetpulse.io', passwordHash: 'Manager@123', role: 'MANAGER' });
  const tech = await User.create({ name: 'Suresh Patil (Jr. Engineer)', email: 'tech@assetpulse.io', passwordHash: 'Tech@123', role: 'TECHNICIAN' });
  const auditor = await User.create({ name: 'Anita Desai (CAG Auditor)', email: 'auditor@assetpulse.io', passwordHash: 'Audit@123', role: 'AUDITOR' });
  console.log('Users created');

  const actors = [admin, manager, tech, auditor];
  const eventTypes = ['INSPECTED', 'MAINTENANCE_PERFORMED', 'FAULT_REPORTED', 'CONDITION_UPDATED'];

  for (const data of ASSETS_DATA) {
    const purchaseDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
    const warrantyYears = Math.floor(Math.random() * 3) + 1;
    const warrantyExpiry = new Date(purchaseDate);
    warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + warrantyYears);

    const asset = new Asset({
      ...data,
      purchaseDate,
      warrantyExpiry,
      currentValue: Math.round(data.purchaseCost * (0.3 + Math.random() * 0.6)),
      maintenanceIntervalDays: [30, 60, 90, 180][Math.floor(Math.random() * 4)],
      location: ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Basement', 'Rooftop', 'Compound'][Math.floor(Math.random() * 7)],
      custodian: ['Rajesh Kumar', 'Priya Sharma', 'Suresh Patil', 'Amit Joshi', 'Deepa Nair'][Math.floor(Math.random() * 5)],
      budgetCode: `BUD-${2024}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      insurancePolicy: Math.random() > 0.3 ? `INS-${String(Math.floor(Math.random() * 90000) + 10000)}` : null,
      geoCoords: { lat: 18.5 + Math.random() * 2, lng: 73.8 + Math.random() * 2 },
      compliance: {
        lastAuditDate: new Date(2024, Math.floor(Math.random() * 6), 1),
        nextAuditDue: new Date(2025, Math.floor(Math.random() * 12), 1),
        certifications: ['ISO 55001', 'GEM Registered'].slice(0, Math.floor(Math.random() * 3)),
        isCompliant: Math.random() > 0.2
      }
    });
    await asset.save();

    // CREATED event
    await appendEvent({
      assetId: asset._id,
      type: 'CREATED',
      payload: { name: data.name, category: data.category, site: data.site, department: data.department, purchaseCost: data.purchaseCost },
      actor: admin,
      occurredAt: purchaseDate
    });

    // COMMISSIONED event
    const commDate = new Date(purchaseDate);
    commDate.setDate(commDate.getDate() + Math.floor(Math.random() * 30) + 7);
    if (data.status !== 'PROCURED') {
      await appendEvent({
        assetId: asset._id,
        type: 'COMMISSIONED',
        payload: { location: asset.location, custodian: asset.custodian },
        actor: manager,
        occurredAt: commDate
      });
    }

    // Add 3-8 lifecycle events spread over time
    const numEvents = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numEvents; i++) {
      const eventDate = new Date(commDate);
      eventDate.setDate(eventDate.getDate() + (i + 1) * (30 + Math.floor(Math.random() * 60)));
      
      if (eventDate > new Date()) break;

      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      let payload = {};

      switch (type) {
        case 'INSPECTED':
          payload = { score: 1 + Math.floor(Math.random() * 5), notes: ['Routine check passed', 'Minor wear observed', 'Requires attention', 'All parameters normal', 'Scheduled inspection complete'][Math.floor(Math.random() * 5)] };
          break;
        case 'MAINTENANCE_PERFORMED':
          payload = { notes: ['Oil change & filter replacement', 'Bearing replacement', 'Electrical panel servicing', 'Annual maintenance contract work', 'Calibration completed'][Math.floor(Math.random() * 5)], cost: Math.floor(Math.random() * 50000) + 5000 };
          break;
        case 'FAULT_REPORTED':
          payload = { code: `FLT-${String(Math.floor(Math.random() * 900) + 100)}`, severity: 1 + Math.floor(Math.random() * 5), description: ['Unusual vibration detected', 'Overheating reported', 'Pressure drop observed', 'Leakage from seal', 'Electrical short circuit', 'Display malfunction'][Math.floor(Math.random() * 6)] };
          break;
        case 'CONDITION_UPDATED':
          payload = { condition: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] };
          break;
      }

      await appendEvent({
        assetId: asset._id,
        type,
        payload,
        actor: actors[Math.floor(Math.random() * actors.length)],
        occurredAt: eventDate
      });
    }
  }

  const totalAssets = await Asset.countDocuments();
  const totalEvents = await AssetEvent.countDocuments();
  console.log(`Seed complete! ${totalAssets} assets, ${totalEvents} events created.`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
