import AssetEvent from '../models/AssetEvent.js';

const INITIAL = {
  status: 'PROCURED', condition: 'GOOD',
  location: null, custodian: null,
  lastInspectionAt: null, lastInspectionScore: null,
  lastMaintenanceAt: null, openFaults: [],
  purchaseCost: 0, refurbishCount: 0
};

// Pure reducer. Given events in order, return state. No DB access.
export function foldEvents(events) {
  return events.reduce((s, e) => {
    const p = e.payload || {};
    switch (e.type) {
      case 'CREATED':
        return { ...s, ...p, status: 'PROCURED' };
      case 'COMMISSIONED':
        return { ...s, status: 'IN_SERVICE', commissionedAt: e.occurredAt, location: p.location ?? s.location };
      case 'TRANSFERRED':
        return { ...s, location: p.toLocation, custodian: p.toCustodian ?? s.custodian };
      case 'INSPECTED':
        return { ...s, lastInspectionAt: e.occurredAt, lastInspectionScore: p.score,
                 condition: scoreToCondition(p.score) };
      case 'FAULT_REPORTED':
        return { ...s, status: p.severity >= 4 ? 'IMPAIRED' : s.status,
                 openFaults: [...s.openFaults, { code: p.code, severity: p.severity, reportedAt: e.occurredAt }] };
      case 'FAULT_RESOLVED': {
        const openFaults = s.openFaults.filter(f => f.code !== p.code);
        return { ...s, openFaults, status: openFaults.length ? s.status : 'IN_SERVICE' };
      }
      case 'MAINTENANCE_PERFORMED':
        return { ...s, lastMaintenanceAt: e.occurredAt, status: 'IN_SERVICE',
                 condition: bumpCondition(s.condition) };
      case 'REFURBISHED':
        return { ...s, status: 'IN_SERVICE', condition: 'GOOD',
                 refurbishCount: s.refurbishCount + 1, lastMaintenanceAt: e.occurredAt };
      case 'DECOMMISSIONED':
        return { ...s, status: 'DECOMMISSIONED' };
      case 'DISPOSED':
        return { ...s, status: 'DISPOSED', disposalValue: p.disposalValue ?? 0 };
      default:
        return s;
    }
  }, { ...INITIAL, openFaults: [] });
}

const scoreToCondition = n => ['CRITICAL','POOR','FAIR','GOOD','EXCELLENT'][Math.max(0, Math.min(4, n - 1))];
const ORDER = ['CRITICAL','POOR','FAIR','GOOD','EXCELLENT'];
const bumpCondition = c => ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(c) + 1)];

export async function stateAt(assetId, date) {
  const events = await AssetEvent.find({ assetId, occurredAt: { $lte: new Date(date) } })
                                 .sort({ seq: 1 }).lean();
  if (!events.length) return null;   // asset did not exist yet on that date
  return { ...foldEvents(events), eventCount: events.length, asOf: date };
}
