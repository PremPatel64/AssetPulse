import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { appendEvent } from '../services/ledger.js';
import AssetEvent from '../models/AssetEvent.js';

const router = express.Router();

const eventSchema = z.object({
  assetId: z.string(),
  type: z.enum([
    'CREATED','COMMISSIONED','TRANSFERRED','INSPECTED',
    'FAULT_REPORTED','MAINTENANCE_PERFORMED','FAULT_RESOLVED',
    'REFURBISHED','DECOMMISSIONED','DISPOSED'
  ]),
  payload: z.any().optional(),
  occurredAt: z.string().datetime().optional(),
  idempotencyKey: z.string().optional()
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'), async (req, res) => {
  try {
    const data = eventSchema.parse(req.body);
    const event = await appendEvent({ ...data, actor: req.user });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

router.post('/bulk', requireAuth, requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'), async (req, res) => {
  try {
    const { events = [] } = req.body;
    let accepted = 0, duplicates = 0;
    
    // Serial on purpose: the hash chain requires ordered appends
    for (const e of events.sort((a,b) => new Date(a.occurredAt || Date.now()) - new Date(b.occurredAt || Date.now()))) {
      const data = eventSchema.parse(e);
      if (data.idempotencyKey) {
        const exists = await AssetEvent.findOne({ idempotencyKey: data.idempotencyKey }).lean();
        if (exists) { duplicates++; continue; }
      }
      await appendEvent({ ...data, actor: req.user });
      accepted++;
    }
    res.json({ accepted, duplicates });
  } catch (err) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
});

export default router;
