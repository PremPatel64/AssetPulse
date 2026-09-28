import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Asset from '../models/Asset.js';
import AssetEvent from '../models/AssetEvent.js';

const router = express.Router();

// Get maintenance schedule - upcoming and overdue
router.get('/', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const assets = await Asset.find({ status: { $in: ['IN_SERVICE', 'UNDER_MAINTENANCE'] } }).lean();
    
    const schedule = [];

    for (const asset of assets) {
      // Find last maintenance event
      const lastMaintEvent = await AssetEvent.findOne({ 
        assetId: asset._id, 
        type: 'MAINTENANCE_PERFORMED' 
      }).sort({ occurredAt: -1 }).lean();

      const lastMaintDate = lastMaintEvent?.occurredAt || asset.lastMaintenanceAt || asset.purchaseDate || asset.createdAt;
      const intervalDays = asset.maintenanceIntervalDays || 90;
      
      const nextDue = new Date(lastMaintDate);
      nextDue.setDate(nextDue.getDate() + intervalDays);
      
      const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
      
      let urgency = 'normal';
      if (daysUntilDue < 0) urgency = 'overdue';
      else if (daysUntilDue <= 7) urgency = 'urgent';
      else if (daysUntilDue <= 30) urgency = 'upcoming';

      schedule.push({
        assetId: asset._id,
        assetTag: asset.tag,
        assetName: asset.name,
        category: asset.category,
        department: asset.department,
        site: asset.site,
        custodian: asset.custodian,
        priority: asset.priority,
        intervalDays,
        lastMaintenanceDate: lastMaintDate,
        nextDueDate: nextDue,
        daysUntilDue,
        urgency
      });
    }

    // Sort: overdue first, then by days until due
    schedule.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    const summary = {
      total: schedule.length,
      overdue: schedule.filter(s => s.urgency === 'overdue').length,
      urgent: schedule.filter(s => s.urgency === 'urgent').length,
      upcoming: schedule.filter(s => s.urgency === 'upcoming').length,
      normal: schedule.filter(s => s.urgency === 'normal').length,
    };

    res.json({ schedule, summary });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
