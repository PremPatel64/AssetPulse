import AssetEvent from '../models/AssetEvent.js';
import Asset from '../models/Asset.js';
import { foldEvents } from './replay.js';

export async function rebuildAsset(assetId) {
  const events = await AssetEvent.find({ assetId }).sort({ seq: 1 }).lean();
  if (!events.length) return null;

  const state = foldEvents(events);
  
  // Update the projection
  const updatedAsset = await Asset.findByIdAndUpdate(
    assetId,
    {
      ...state,
      eventCount: events.length,
      lastEventHash: events[events.length - 1].hash,
    },
    { new: true, upsert: false } // we don't upsert because POST /api/assets creates the shell first
  );

  return updatedAsset;
}
