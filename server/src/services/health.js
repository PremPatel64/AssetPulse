import dayjs from 'dayjs';

export function computeAHI(state, asset, asOf = new Date()) {
  const now = dayjs(asOf);
  const breakdown = [];

  // 1. Age, up to 30 points
  const ageYears = asset.purchaseDate ? now.diff(dayjs(asset.purchaseDate), 'year', true) : 0;
  const lifeRatio = Math.min(1, Math.max(0, ageYears) / (asset.designLifeYears || 15));
  const ageFactor = +(lifeRatio * 30).toFixed(1);
  breakdown.push({ label: 'Age vs design life', deduct: ageFactor,
    detail: `${Math.max(0, ageYears).toFixed(1)} of ${asset.designLifeYears || 15} yrs` });

  // 2. Maintenance neglect, up to 25
  const interval = asset.maintenanceIntervalDays || 90;
  const since = state.lastMaintenanceAt ? now.diff(dayjs(state.lastMaintenanceAt), 'day') : interval * 2;
  const neglectFactor = +(Math.min(1, Math.max(0, since) / (interval * 2)) * 25).toFixed(1);
  breakdown.push({ label: 'Maintenance overdue', deduct: neglectFactor,
    detail: `${since}d since service, interval ${interval}d` });

  // 3. Open faults, up to 25, severity 1-5
  const faultLoad = (state.openFaults || []).reduce((a, f) => a + f.severity, 0);
  const faultFactor = +(Math.min(1, faultLoad / 10) * 25).toFixed(1);
  breakdown.push({ label: 'Open faults', deduct: faultFactor,
    detail: `${(state.openFaults || []).length} open, severity load ${faultLoad}` });

  // 4. Inspection decay, up to 20
  const insScore = state.lastInspectionScore ?? 3;
  const insAge = state.lastInspectionAt ? now.diff(dayjs(state.lastInspectionAt), 'day') : 365;
  const decay = Math.min(1, Math.max(0, insAge) / 365);
  const inspectionFactor = +((((5 - insScore) / 4) * 0.7 + decay * 0.3) * 20).toFixed(1);
  breakdown.push({ label: 'Inspection quality', deduct: inspectionFactor,
    detail: `score ${insScore}/5, ${insAge}d old` });

  const score = Math.max(0, Math.round(100 - ageFactor - neglectFactor - faultFactor - inspectionFactor));
  const band = score >= 80 ? 'HEALTHY' : score >= 60 ? 'WATCH' : score >= 40 ? 'DEGRADED' : 'CRITICAL';

  const nextMaintenanceDue = state.lastMaintenanceAt
    ? dayjs(state.lastMaintenanceAt).add(interval, 'day').toISOString()
    : now.toISOString();

  // Explainable projection: how many days until AHI crosses 40 at current decay rate
  const dailyDecay = (25 / (interval * 2)) + (20 * 0.3 / 365);
  const daysToCritical = dailyDecay > 0 ? Math.max(0, Math.round((score - 40) / dailyDecay)) : null;

  return { score, band, breakdown, nextMaintenanceDue,
           predictedFailureWindow: daysToCritical, computedAt: now.toISOString() };
}
