import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { stateAt } from '../services/replay.js';
import { appendEvent } from '../services/ledger.js';
import Asset from '../models/Asset.js';
import AssetEvent from '../models/AssetEvent.js';
import { computeAHI } from '../services/health.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const assetShell = new Asset(req.body);
    // don't save yet, let the event projection do it, OR save it as a shell and let projector update it.
    // "POST /api/assets creates the shell then appends CREATED"
    await assetShell.save();

    await appendEvent({
      assetId: assetShell._id,
      type: 'CREATED',
      payload: req.body,
      actor: req.user
    });
    
    // projector has rebuilt it, fetch latest
    const finalAsset = await Asset.findById(assetShell._id);
    res.json(finalAsset);
  } catch (err) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { q, status, category, site, page = 1 } = req.query;
    const filter = {};
    if (q) filter.tag = { $regex: q, $options: 'i' };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (site) filter.site = site;

    const limit = 20;
    const skip = (page - 1) * limit;
    
    const items = await Asset.find(filter).skip(skip).limit(limit).lean();
    const total = await Asset.countDocuments(filter);
    
    const itemsWithAhi = items.map(asset => {
      // For list view, we use the projection state
      const state = asset;
      return { ...asset, ahi: computeAHI(state, asset) };
    });

    res.json({ items: itemsWithAhi, total });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).lean();
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    
    const state = asset;
    res.json({ ...asset, ahi: computeAHI(state, asset) });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/:id/state-at', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'date query required' } });
    
    const state = await stateAt(req.params.id, date);
    if (!state) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found at this date' } });
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/:id/events', requireAuth, async (req, res) => {
  try {
    const events = await AssetEvent.find({ assetId: req.params.id }).sort({ seq: 1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/:id/ahi', requireAuth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).lean();
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    
    const state = asset;
    const ahi = computeAHI(state, asset);
    res.json(ahi);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Transfer asset to another department/site
router.post('/:id/transfer', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { toDepartment, toSite, toLocation, toCustodian, reason } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });

    await appendEvent({
      assetId: asset._id,
      type: 'TRANSFERRED',
      payload: {
        fromDepartment: asset.department,
        fromSite: asset.site,
        toDepartment, toSite, toLocation, toCustodian, reason
      },
      actor: req.user
    });

    // Update projection directly
    asset.department = toDepartment || asset.department;
    asset.site = toSite || asset.site;
    asset.location = toLocation || asset.location;
    asset.custodian = toCustodian || asset.custodian;
    await asset.save();

    res.json(asset);
  } catch (err) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// Dispose asset
router.post('/:id/dispose', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { reason, method, approvedBy } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });

    await appendEvent({
      assetId: asset._id,
      type: 'DISPOSED',
      payload: { reason, method, approvedBy, previousStatus: asset.status },
      actor: req.user
    });

    asset.status = 'DISPOSED';
    asset.condition = 'CRITICAL';
    await asset.save();

    res.json(asset);
  } catch (err) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

// Decommission asset
router.post('/:id/decommission', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { reason } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });

    await appendEvent({
      assetId: asset._id,
      type: 'DECOMMISSIONED',
      payload: { reason, previousStatus: asset.status },
      actor: req.user
    });

    asset.status = 'DECOMMISSIONED';
    await asset.save();

    res.json(asset);
  } catch (err) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

export default router;
