import mongoose from 'mongoose';

const assetEventSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', index: true, required: true },
  seq: { type: Number, required: true },                 // 0,1,2... per asset
  type: {
    type: String,
    enum: ['CREATED','COMMISSIONED','TRANSFERRED','INSPECTED','FAULT_REPORTED',
           'MAINTENANCE_PERFORMED','FAULT_RESOLVED','REFURBISHED','CONDITION_UPDATED',
           'DECOMMISSIONED','DISPOSED'],
    required: true
  },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: String,
  occurredAt: { type: Date, default: Date.now, index: true },
  idempotencyKey: { type: String, unique: true, sparse: true },
  prevHash: { type: String, required: true },
  hash: { type: String, required: true }
});

assetEventSchema.index({ assetId: 1, seq: 1 }, { unique: true });

export default mongoose.model('AssetEvent', assetEventSchema);
