import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import assetsRoutes from './routes/assets.js';
import eventsRoutes from './routes/events.js';
import ledgerRoutes from './routes/ledger.js';
import portfolioRoutes from './routes/portfolio.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import maintenanceRoutes from './routes/maintenance.js';
import activityRoutes from './routes/activity.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/activity', activityRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assetpulse_gov';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
