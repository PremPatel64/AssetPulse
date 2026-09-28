import { get, set } from 'idb-keyval';
import api from './api';

const KEY = 'assetpulse.outbox.v1';

export const listOutbox = async () => (await get(KEY)) || [];

export async function queueEvent(evt) {
  const q = await listOutbox();
  q.push({ ...evt, idempotencyKey: evt.idempotencyKey || crypto.randomUUID(), queuedAt: Date.now() });
  await set(KEY, q);
  return q.length;
}

export async function submitEvent(evt) {
  const withKey = { ...evt, idempotencyKey: crypto.randomUUID() };
  if (!navigator.onLine) return { queued: await queueEvent(withKey), offline: true };
  try {
    await api.post('/api/events', withKey);
    return { offline: false };
  } catch {
    return { queued: await queueEvent(withKey), offline: true };
  }
}

export async function flushOutbox() {
  const q = await listOutbox();
  if (!q.length || !navigator.onLine) return { flushed: 0 };
  const { data } = await api.post('/api/events/bulk', { events: q });
  await set(KEY, []);                       // server deduped, safe to clear
  return { flushed: data.accepted, duplicates: data.duplicates };
}

export function startAutoFlush(onCount) {
  const tick = async () => { await flushOutbox().catch(() => {}); onCount((await listOutbox()).length); };
  window.addEventListener('online', tick);
  const t = setInterval(tick, 15000);
  return () => { window.removeEventListener('online', tick); clearInterval(t); };
}
