export const MOCK_ASSETS = [
  { _id: '1', tag: 'GOV-VEH-001', name: 'Mahindra Bolero (District Collector)', category: 'VEHICLE', department: 'Revenue', site: 'District Collectorate', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 780000, ahi: { score: 95 } },
  { _id: '2', tag: 'GOV-IT-001', name: 'Dell PowerEdge R740 Server', category: 'IT_EQUIPMENT', department: 'Information Technology', site: 'State Data Center', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 320000, ahi: { score: 88 } },
  { _id: '3', tag: 'GOV-PMP-001', name: 'Main Water Pump Station A', category: 'PUMP', department: 'Municipal Corp', site: 'Municipal Water Plant', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 900000, ahi: { score: 92 } },
  { _id: '4', tag: 'GOV-DG-001', name: 'DG Set 500KVA (Mantralaya)', category: 'DG_SET', department: 'Public Works', site: 'Mantralaya Main Building', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 2800000, ahi: { score: 85 } },
  { _id: '5', tag: 'GOV-VEH-003', name: 'Force Traveller (Staff Bus)', category: 'VEHICLE', department: 'Education', site: 'Govt ITI Polytechnic', status: 'UNDER_MAINTENANCE', condition: 'POOR', currentValue: 1200000, ahi: { score: 45 } },
  { _id: '6', tag: 'GOV-MED-001', name: 'X-Ray Machine (Radiology)', category: 'IT_EQUIPMENT', department: 'Health', site: 'Civil Hospital Campus', status: 'IN_SERVICE', condition: 'GOOD', currentValue: 2500000, ahi: { score: 98 } },
  { _id: '7', tag: 'GOV-LFT-002', name: 'Goods Lift (Hospital)', category: 'LIFT', department: 'Health', site: 'Civil Hospital Campus', status: 'IMPAIRED', condition: 'POOR', currentValue: 1100000, ahi: { score: 30 } },
];

export const MOCK_STATS = {
  totalAssets: 3450,
  totalValue: 850000000,
  criticalAssets: 12,
  maintenanceDue: 45,
  distribution: {
    departments: [
      { name: 'Public Works', value: 1200 },
      { name: 'Health', value: 800 },
      { name: 'Municipal Corp', value: 950 },
      { name: 'Information Technology', value: 500 }
    ],
    status: [
      { name: 'IN_SERVICE', value: 2800 },
      { name: 'UNDER_MAINTENANCE', value: 300 },
      { name: 'IMPAIRED', value: 50 },
      { name: 'DISPOSED', value: 300 }
    ]
  }
};

export const MOCK_NOTIFICATIONS = [
  { _id: 'n1', type: 'MAINTENANCE_DUE', message: 'DG Set 500KVA maintenance due in 3 days.', createdAt: new Date().toISOString(), read: false },
  { _id: 'n2', type: 'FAULT_REPORTED', message: 'Critical fault on Goods Lift (Hospital).', createdAt: new Date().toISOString(), read: false }
];

export const MOCK_ACTIVITY = [
  { _id: 'a1', type: 'TRANSFERRED', actorName: 'Rajesh Kumar', assetId: { name: 'Mahindra Bolero' }, occurredAt: new Date().toISOString(), payload: { toDepartment: 'Revenue' } },
  { _id: 'a2', type: 'INSPECTED', actorName: 'Suresh Patil', assetId: { name: 'Main Water Pump' }, occurredAt: new Date().toISOString(), payload: { score: 5, notes: 'All good' } }
];
