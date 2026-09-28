import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Asset from '../models/Asset.js';
import AssetEvent from '../models/AssetEvent.js';

const router = express.Router();

// Get smart notifications/alerts
router.get('/', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const alerts = [];

    const assets = await Asset.find().lean();

    for (const asset of assets) {
      // Warranty expiring within 30 days or already expired
      if (asset.warrantyExpiry) {
        const warrantyDate = new Date(asset.warrantyExpiry);
        const daysUntilExpiry = Math.ceil((warrantyDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) {
          alerts.push({
            type: 'WARRANTY_EXPIRED',
            severity: 'warning',
            assetId: asset._id,
            assetTag: asset.tag,
            assetName: asset.name,
            department: asset.department,
            message: `Warranty expired ${Math.abs(daysUntilExpiry)} days ago`,
            date: asset.warrantyExpiry,
            category: 'warranty'
          });
        } else if (daysUntilExpiry <= 30) {
          alerts.push({
            type: 'WARRANTY_EXPIRING',
            severity: 'info',
            assetId: asset._id,
            assetTag: asset.tag,
            assetName: asset.name,
            department: asset.department,
            message: `Warranty expires in ${daysUntilExpiry} days`,
            date: asset.warrantyExpiry,
            category: 'warranty'
          });
        }
      }

      // Overdue maintenance
      if (asset.lastMaintenanceAt && asset.maintenanceIntervalDays) {
        const nextDue = new Date(asset.lastMaintenanceAt);
        nextDue.setDate(nextDue.getDate() + asset.maintenanceIntervalDays);
        const daysOverdue = Math.ceil((now - nextDue) / (1000 * 60 * 60 * 24));
        if (daysOverdue > 0) {
          alerts.push({
            type: 'MAINTENANCE_OVERDUE',
            severity: 'critical',
            assetId: asset._id,
            assetTag: asset.tag,
            assetName: asset.name,
            department: asset.department,
            message: `Maintenance overdue by ${daysOverdue} days`,
            date: nextDue,
            category: 'maintenance'
          });
        }
      }

      // Critical/Poor condition
      if (asset.condition === 'CRITICAL') {
        alerts.push({
          type: 'CRITICAL_CONDITION',
          severity: 'critical',
          assetId: asset._id,
          assetTag: asset.tag,
          assetName: asset.name,
          department: asset.department,
          message: `Asset in CRITICAL condition — immediate attention required`,
          date: asset.updatedAt,
          category: 'health'
        });
      } else if (asset.condition === 'POOR') {
        alerts.push({
          type: 'POOR_CONDITION',
          severity: 'warning',
          assetId: asset._id,
          assetTag: asset.tag,
          assetName: asset.name,
          department: asset.department,
          message: `Asset in POOR condition — schedule maintenance`,
          date: asset.updatedAt,
          category: 'health'
        });
      }

      // Open faults
      if (asset.openFaults && asset.openFaults.length > 0) {
        const highSeverity = asset.openFaults.filter(f => f.severity >= 4);
        if (highSeverity.length > 0) {
          alerts.push({
            type: 'HIGH_SEVERITY_FAULT',
            severity: 'critical',
            assetId: asset._id,
            assetTag: asset.tag,
            assetName: asset.name,
            department: asset.department,
            message: `${highSeverity.length} high-severity fault(s) unresolved`,
            date: highSeverity[0].reportedAt || asset.updatedAt,
            category: 'faults'
          });
        }
      }

      // Non-compliant
      if (asset.compliance && !asset.compliance.isCompliant) {
        alerts.push({
          type: 'NON_COMPLIANT',
          severity: 'warning',
          assetId: asset._id,
          assetTag: asset.tag,
          assetName: asset.name,
          department: asset.department,
          message: `Asset is non-compliant — audit required`,
          date: asset.compliance.nextAuditDue || asset.updatedAt,
          category: 'compliance'
        });
      }

      // Impaired status
      if (asset.status === 'IMPAIRED') {
        alerts.push({
          type: 'ASSET_IMPAIRED',
          severity: 'critical',
          assetId: asset._id,
          assetTag: asset.tag,
          assetName: asset.name,
          department: asset.department,
          message: `Asset is IMPAIRED and not operational`,
          date: asset.updatedAt,
          category: 'health'
        });
      }
    }

    // Sort by severity then date
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Summary counts
    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      byCategory: {
        warranty: alerts.filter(a => a.category === 'warranty').length,
        maintenance: alerts.filter(a => a.category === 'maintenance').length,
        health: alerts.filter(a => a.category === 'health').length,
        faults: alerts.filter(a => a.category === 'faults').length,
        compliance: alerts.filter(a => a.category === 'compliance').length,
      }
    };

    res.json({ alerts, summary });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
