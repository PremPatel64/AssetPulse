import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import AssetEvent from '../models/AssetEvent.js';
import Asset from '../models/Asset.js';

const router = express.Router();

// Full system activity timeline
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, type, department } = req.query;
    const limit = 30;
    const skip = (page - 1) * limit;

    let filter = {};
    if (type) filter.type = type;

    // If department filter, find asset IDs in that department first
    if (department) {
      const deptAssets = await Asset.find({ department }).select('_id').lean();
      filter.assetId = { $in: deptAssets.map(a => a._id) };
    }

    const [events, total] = await Promise.all([
      AssetEvent.find(filter).sort({ occurredAt: -1 }).skip(skip).limit(limit).lean(),
      AssetEvent.countDocuments(filter)
    ]);

    // Enrich with asset info
    const assetIds = [...new Set(events.map(e => e.assetId?.toString()))];
    const assets = await Asset.find({ _id: { $in: assetIds } }).lean();
    const assetMap = {};
    assets.forEach(a => { assetMap[a._id.toString()] = a; });

    const enriched = events.map(e => ({
      ...e,
      assetTag: assetMap[e.assetId?.toString()]?.tag || 'Unknown',
      assetName: assetMap[e.assetId?.toString()]?.name || 'Unknown',
      assetDepartment: assetMap[e.assetId?.toString()]?.department || 'Unknown',
      assetCategory: assetMap[e.assetId?.toString()]?.category || 'Unknown',
    }));

    res.json({ events: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Event type stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const stats = await AssetEvent.aggregate(pipeline);
    const total = await AssetEvent.countDocuments();
    res.json({ stats, total });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
