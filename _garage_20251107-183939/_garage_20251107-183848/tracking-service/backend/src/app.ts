import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import trackingRouter from './routes/tracking.routes';

type CorsOrigin = string | RegExp | (string | RegExp)[];

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: corsOrigins.length > 0 ? corsOrigins : true,
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tracking', trackingRouter);

export default app;
