import { Router } from 'express';
import multer from 'multer';
import {
  deleteDocument,
  getCreditApplication,
  getCreditReport,
  getDeal,
  listDocuments,
  pullCreditReport,
  shareCreditReport,
  updateDeal,
  uploadDocument,
  upsertCreditApplication,
} from './fi.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.get('/deals/:id', getDeal);
router.put('/deals/:id', updateDeal);
router.get('/deals/:id/documents', listDocuments);
router.post('/deals/:id/documents/upload', upload.single('file'), uploadDocument);
router.delete('/deals/:id/documents/:docId', deleteDocument);
router.post('/credit/application', upsertCreditApplication);
router.get('/credit/application/:dealId', getCreditApplication);
router.post('/credit/pull', pullCreditReport);
router.get('/credit/report/:dealId', getCreditReport);
router.post('/credit/share', shareCreditReport);

export default router;
