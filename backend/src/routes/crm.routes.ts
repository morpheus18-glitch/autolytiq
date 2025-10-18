import express from 'express';
import leadRoutes from './lead.routes.js';

const router = express.Router();

router.use('/leads', leadRoutes);

export default router;

