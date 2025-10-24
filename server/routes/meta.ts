import { Router, type Request, type Response } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Load package.json for version info
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
);

// Server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * GET /api/version
 * Returns application version information
 */
router.get('/version', (_req: Request, res: Response) => {
  res.json({
    name: packageJson.name,
    version: packageJson.version,
    commit: process.env.GIT_SHA || 'unknown'
  });
});

/**
 * GET /api/health
 * Returns health status and uptime information
 */
router.get('/health', (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  
  res.json({
    status: 'ok',
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString()
  });
});

export default router;
