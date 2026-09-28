export const MOCK_ASSETS = [
  { _id: '1', tag: 'GOV-VEH-001', name: 'Mahindra Bolero (District Collector)', category: 'VEHICLE', department: 'Revenue', site: 'District Collectorate', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 780000, purchaseCost: 980000, ahi: { score: 95 } },
  { _id: '2', tag: 'GOV-IT-001', name: 'Dell PowerEdge R740 Server', category: 'IT_EQUIPMENT', department: 'Information Technology', site: 'State Data Center', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 320000, purchaseCost: 450000, ahi: { score: 88 } },
  { _id: '3', tag: 'GOV-PMP-001', name: 'Main Water Pump Station A', category: 'PUMP', department: 'Municipal Corp', site: 'Municipal Water Plant', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 900000, purchaseCost: 1200000, ahi: { score: 92 } },
  { _id: '4', tag: 'GOV-DG-001', name: 'DG Set 500KVA (Mantralaya)', category: 'DG_SET', department: 'Public Works', site: 'Mantralaya Main Building', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 2800000, purchaseCost: 3500000, ahi: { score: 85 } },
  { _id: '5', tag: 'GOV-VEH-003', name: 'Force Traveller (Staff Bus)', category: 'VEHICLE', department: 'Education', site: 'Govt ITI Polytechnic', status: 'UNDER_MAINTENANCE', condition: 'POOR', currentValue: 1200000, purchaseCost: 1850000, ahi: { score: 45 } },
  { _id: '6', tag: 'GOV-MED-001', name: 'X-Ray Machine (Radiology)', category: 'IT_EQUIPMENT', department: 'Health', site: 'Civil Hospital Campus', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 2500000, purchaseCost: 3200000, ahi: { score: 98 } },
  { _id: '7', tag: 'GOV-LFT-002', name: 'Goods Lift (Hospital)', category: 'LIFT', department: 'Health', site: 'Civil Hospital Campus', status: 'IMPAIRED', condition: 'POOR', currentValue: 1100000, purchaseCost: 1800000, ahi: { score: 30 } },
];

export const MOCK_USERS = [
  { _id: 'u1', name: 'Rajesh Kumar', email: 'admin@assetpulse.io', role: 'ADMIN', createdAt: '2023-01-15T10:00:00Z' },
  { _id: 'u2', name: 'Priya Sharma', email: 'manager@assetpulse.io', role: 'MANAGER', createdAt: '2023-05-20T10:00:00Z' },
  { _id: 'u3', name: 'Suresh Patil', email: 'tech@assetpulse.io', role: 'TECHNICIAN', createdAt: '2024-02-10T10:00:00Z' },
  { _id: 'u4', name: 'Anita Desai', email: 'auditor@assetpulse.io', role: 'AUDITOR', createdAt: '2024-06-05T10:00:00Z' }
];

export const MOCK_STATS = {
  totalAssets: 3450,
  totalValue: 850000000,
  totalPurchaseCost: 1250000000,
  depreciation: 400000000,
  warrantyExpiredCount: 450,
  criticalCount: 12,
  nonCompliantCount: 5,
  avgAHI: 84,
  maintenanceDue: 45,
  byStatus: {
    IN_SERVICE: 2800,
    UNDER_MAINTENANCE: 300,
    IMPAIRED: 50,
    DISPOSED: 300
  },
  byDepartment: {
    'Public Works': 1200,
    'Health': 800,
    'Municipal Corp': 950,
    'Information Technology': 500
  },
  byCategory: {
    VEHICLE: 400,
    IT_EQUIPMENT: 800,
    FURNITURE: 1500,
    PUMP: 150,
    DG_SET: 50,
    LIFT: 80
  },
  atRisk: MOCK_ASSETS.filter(a => a.ahi.score < 70),
  recentEvents: [
    { _id: 'e1', type: 'TRANSFERRED', assetTag: 'GOV-VEH-001', assetName: 'Mahindra Bolero', actorName: 'Rajesh Kumar', occurredAt: new Date().toISOString() },
    { _id: 'e2', type: 'MAINTENANCE_PERFORMED', assetTag: 'GOV-PMP-001', assetName: 'Main Water Pump', actorName: 'Suresh Patil', occurredAt: new Date(Date.now() - 86400000).toISOString() }
  ]
};

export const MOCK_DEPARTMENTS = [
  { _id: 'Public Works', count: 1200, totalCost: 450000000, totalValue: 320000000 },
  { _id: 'Health', count: 800, totalCost: 350000000, totalValue: 250000000 },
  { _id: 'Municipal Corp', count: 950, totalCost: 280000000, totalValue: 190000000 },
  { _id: 'Information Technology', count: 500, totalCost: 170000000, totalValue: 90000000 }
];

export const MOCK_CATEGORIES = [
  { _id: 'VEHICLE', count: 400, avgCondition: 3.5 },
  { _id: 'IT_EQUIPMENT', count: 800, avgCondition: 4.2 },
  { _id: 'FURNITURE', count: 1500, avgCondition: 3.8 },
  { _id: 'PUMP', count: 150, avgCondition: 3.1 },
  { _id: 'LIFT', count: 80, avgCondition: 2.5 }
];

export const MOCK_MAINTENANCE = {
  summary: { overdue: 2, urgent: 3, upcoming: 15, normal: 45 },
  schedule: [
    { assetId: '5', assetTag: 'GOV-VEH-003', assetName: 'Force Traveller (Staff Bus)', department: 'Education', intervalDays: 90, lastMaintenanceDate: new Date(Date.now() - 100 * 86400000).toISOString(), nextDueDate: new Date(Date.now() - 10 * 86400000).toISOString(), daysUntilDue: -10, custodian: 'Suresh Patil', urgency: 'overdue' },
    { assetId: '7', assetTag: 'GOV-LFT-002', assetName: 'Goods Lift (Hospital)', department: 'Health', intervalDays: 30, lastMaintenanceDate: new Date(Date.now() - 28 * 86400000).toISOString(), nextDueDate: new Date(Date.now() + 2 * 86400000).toISOString(), daysUntilDue: 2, custodian: 'Priya Sharma', urgency: 'urgent' },
    { assetId: '3', assetTag: 'GOV-PMP-001', assetName: 'Main Water Pump Station A', department: 'Municipal Corp', intervalDays: 180, lastMaintenanceDate: new Date(Date.now() - 160 * 86400000).toISOString(), nextDueDate: new Date(Date.now() + 20 * 86400000).toISOString(), daysUntilDue: 20, custodian: 'Rajesh Kumar', urgency: 'upcoming' }
  ]
};

export const MOCK_NOTIFICATIONS = {
  summary: { total: 2, critical: 1, warning: 1, info: 0, byCategory: { maintenance: 1, faults: 1 } },
  alerts: [
    { severity: 'critical', category: 'faults', message: 'Critical fault on Goods Lift', assetTag: 'GOV-LFT-002', assetName: 'Goods Lift (Hospital)', department: 'Health', assetId: '7' },
    { severity: 'warning', category: 'maintenance', message: 'Force Traveller maintenance overdue by 10 days', assetTag: 'GOV-VEH-003', assetName: 'Force Traveller (Staff Bus)', department: 'Education', assetId: '5' }
  ]
};

export const MOCK_ACTIVITY = [
  { _id: 'a1', type: 'TRANSFERRED', actorName: 'Rajesh Kumar', assetId: { name: 'Mahindra Bolero', tag: 'GOV-VEH-001' }, occurredAt: new Date().toISOString(), payload: { toDepartment: 'Revenue' } },
  { _id: 'a2', type: 'INSPECTED', actorName: 'Suresh Patil', assetId: { name: 'Main Water Pump', tag: 'GOV-PMP-001' }, occurredAt: new Date().toISOString(), payload: { score: 5, notes: 'All good' } }
];
