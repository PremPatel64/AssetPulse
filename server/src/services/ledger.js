import crypto from 'crypto';
import AssetEvent from '../models/AssetEvent.js';
import { rebuildAsset } from './projector.js';

const GENESIS = '0'.repeat(64);

// Stable stringify so key order never changes the hash
function canonical(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
  return '{' + Object.keys(obj).sort()
    .map(k => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

export function computeHash({ prevHash, assetId, seq, type, payload, actorId, occurredAt }) {
  const material = [
    prevHash, String(assetId), String(seq), type,
    canonical(payload ?? {}), String(actorId),
    new Date(occurredAt).toISOString()
  ].join('|');
  return crypto.createHash('sha256').update(material).digest('hex');
}

export async function appendEvent({ assetId, type, payload = {}, actor, occurredAt = new Date(), idempotencyKey = null }) {
  const last = await AssetEvent.findOne({ assetId }).sort({ seq: -1 }).lean();
  const seq = last ? last.seq + 1 : 0;
  const prevHash = last ? last.hash : GENESIS;

  const base = {
    assetId, seq, type, payload,
    actorId: actor._id, actorName: actor.name,
    occurredAt: new Date(occurredAt), prevHash
  };
  if (idempotencyKey) {
    base.idempotencyKey = idempotencyKey;
  }
  base.hash = computeHash(base);

  const doc = await AssetEvent.create(base);
  await rebuildAsset(assetId);           // refresh the read projection
  return doc;
}

export async function verifyChain(assetId) {
  const events = await AssetEvent.find({ assetId }).sort({ seq: 1 }).lean();
  const broken = [];
  let expectedPrev = GENESIS;

  for (const e of events) {
    if (e.prevHash !== expectedPrev) {
      broken.push({ assetId, seq: e.seq, reason: 'BROKEN_LINK' });
    }
    const recomputed = computeHash(e);
    if (recomputed !== e.hash) {
      broken.push({ assetId, seq: e.seq, reason: 'HASH_MISMATCH' });
    }
    expectedPrev = e.hash;
  }
  return { checked: events.length, broken };
}
