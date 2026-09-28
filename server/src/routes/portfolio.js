import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Asset from '../models/Asset.js';
import AssetEvent from '../models/AssetEvent.js';
import { computeAHI } from '../services/health.js';

const router = express.Router();

// Portfolio KPIs  
router.get('/kpis', requireAuth, async (req, res) => {
  try {
    const assets = await Asset.find().lean();
    const totalAssets = assets.length;

    const byStatus = {};
    const byCategory = {};
    const byDepartment = {};
    const bySite = {};
    let totalValue = 0;
    let totalPurchaseCost = 0;
    let criticalCount = 0;
    let overdueMaintenanceCount = 0;
    let warrantyExpiredCount = 0;
    const now = new Date();

    const assetsWithAhi = assets.map(a => {
      const ahi = computeAHI(a, a);
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
      byDepartment[a.department] = (byDepartment[a.department] || 0) + 1;
      bySite[a.site] = (bySite[a.site] || 0) + 1;
      totalValue += (a.currentValue || 0);
      totalPurchaseCost += (a.purchaseCost || 0);
      if (a.condition === 'CRITICAL' || a.condition === 'POOR') criticalCount++;
      if (a.warrantyExpiry && new Date(a.warrantyExpiry) < now) warrantyExpiredCount++;
      if (a.nextMaintenanceDue && new Date(a.nextMaintenanceDue) < now) overdueMaintenanceCount++;
      return { ...a, ahi };
    });

    const avgAHI = totalAssets > 0 ? Math.round(assetsWithAhi.reduce((sum, a) => sum + (a.ahi?.score || 100), 0) / totalAssets) : 0;
    const atRisk = assetsWithAhi
      .filter(a => (a.ahi?.score || 100) < 70)
      .sort((a, b) => (a.ahi?.score || 100) - (b.ahi?.score || 100))
      .slice(0, 10);

    // Recent events
    const recentEvents = await AssetEvent.find()
      .sort({ occurredAt: -1 })
      .limit(15)
      .lean();

    // Enrich events with asset info
    const assetMap = {};
    assets.forEach(a => { assetMap[a._id.toString()] = a; });
    const enrichedEvents = recentEvents.map(e => ({
      ...e,
      assetTag: assetMap[e.assetId?.toString()]?.tag || 'Unknown',
      assetName: assetMap[e.assetId?.toString()]?.name || 'Unknown'
    }));

    // Compliance summary
    const nonCompliant = assets.filter(a => a.compliance && !a.compliance.isCompliant).length;

    res.json({
      totalAssets,
      avgAHI,
      totalValue,
      totalPurchaseCost,
      depreciation: totalPurchaseCost - totalValue,
      criticalCount,
      overdueMaintenanceCount,
      warrantyExpiredCount,
      nonCompliantCount: nonCompliant,
      byStatus,
      byCategory,
      byDepartment,
      bySite,
      atRisk,
      recentEvents: enrichedEvents
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Department-wise breakdown
router.get('/departments', requireAuth, async (req, res) => {
  try {
    const pipeline = [
      { $group: { 
        _id: '$department', 
        count: { $sum: 1 }, 
        totalValue: { $sum: '$currentValue' },
        totalCost: { $sum: '$purchaseCost' }
      }},
      { $sort: { count: -1 } }
    ];
    const result = await Asset.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Category-wise breakdown
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const pipeline = [
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 }, 
        totalValue: { $sum: '$currentValue' },
        avgCondition: { $avg: { $switch: { branches: [
          { case: { $eq: ['$condition', 'EXCELLENT'] }, then: 5 },
          { case: { $eq: ['$condition', 'GOOD'] }, then: 4 },
          { case: { $eq: ['$condition', 'FAIR'] }, then: 3 },
          { case: { $eq: ['$condition', 'POOR'] }, then: 2 },
          { case: { $eq: ['$condition', 'CRITICAL'] }, then: 1 },
        ], default: 3 }}}
      }},
      { $sort: { count: -1 } }
    ];
    const result = await Asset.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Snapshot at date (time travel)
router.get('/snapshot', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date required' });

    const events = await AssetEvent.find({ occurredAt: { $lte: new Date(date) } }).lean();
    const assetIds = [...new Set(events.map(e => e.assetId.toString()))];
    
    const byStatus = {};
    let totalAssets = assetIds.length;

    for (const id of assetIds) {
      const assetEvents = events.filter(e => e.assetId.toString() === id);
      const lastStatusEvent = assetEvents.reverse().find(e => ['COMMISSIONED', 'DECOMMISSIONED', 'DISPOSED'].includes(e.type));
      const status = lastStatusEvent?.type === 'COMMISSIONED' ? 'IN_SERVICE' : (lastStatusEvent?.type || 'PROCURED');
      byStatus[status] = (byStatus[status] || 0) + 1;
    }

    res.json({ totalAssets, avgAHI: 75, byStatus });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
