import express from 'express';
import settingsRoutes from './routes/settings.routes.js';
import { errorHandler } from './lib/errors.js';

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use('/api/settings', settingsRoutes);
app.use(errorHandler);

export default app;
