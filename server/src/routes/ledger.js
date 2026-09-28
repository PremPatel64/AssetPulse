import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { verifyChain } from '../services/ledger.js';
import AssetEvent from '../models/AssetEvent.js';

const router = express.Router();

router.get('/verify', requireAuth, requireRole('ADMIN','MANAGER','AUDITOR'), async (req, res) => {
  try {
    const ids = req.query.assetId
      ? [req.query.assetId]
      : (await AssetEvent.distinct('assetId'));

    let checked = 0; const brokenLinks = [];
    for (const id of ids) {
      const r = await verifyChain(id);
      checked += r.checked;
      brokenLinks.push(...r.broken);
    }
    res.json({ ok: brokenLinks.length === 0, chains: ids.length, checked, brokenLinks });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
