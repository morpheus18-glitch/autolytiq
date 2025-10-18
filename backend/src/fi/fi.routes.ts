import { Router } from 'express';
import multer from 'multer';
import {
  deleteDocument,
  getFiProductDetails,
  getCreditApplication,
  getCreditReport,
  getDeal,
  listFiProducts,
  listDocuments,
  listLenderDecisions,
  listLenders,
  pullCreditReport,
  shareCreditReport,
  satisfySubmissionStipulation,
  buildMenuConfiguration,
  getMenuConfiguration,
  selectMenuOption,
  selectLenderSubmission,
  updateDeal,
  uploadDocument,
  upsertCreditApplication,
  submitCounterOffer,
  submitLenders,
  generateContracts,
  sendContractsForSignature,
  getContractStatuses,
  handleContractsWebhook,
  downloadContract,
  getFundingStatus,
  submitFundingRequest,
  updateFundingStatus,
  markFundingComplete,
  cancelFundingRequest,
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
router.get('/products', listFiProducts);
router.post('/menu/build', buildMenuConfiguration);
router.get('/menu/:dealId', getMenuConfiguration);
router.post('/menu/:dealId/select-option', selectMenuOption);
router.get('/product-details/:productId', getFiProductDetails);
router.get('/deals/:id/documents', listDocuments);
router.post('/deals/:id/documents/upload', upload.single('file'), uploadDocument);
router.delete('/deals/:id/documents/:docId', deleteDocument);
router.post('/credit/application', upsertCreditApplication);
router.get('/credit/application/:dealId', getCreditApplication);
router.post('/credit/pull', pullCreditReport);
router.get('/credit/report/:dealId', getCreditReport);
router.post('/credit/share', shareCreditReport);
router.get('/lenders', listLenders);
router.post('/lenders/submit', submitLenders);
router.get('/lenders/decisions/:dealId', listLenderDecisions);
router.post('/lenders/select-decision', selectLenderSubmission);
router.post('/lenders/counter-offer', submitCounterOffer);
router.post('/lenders/satisfy-stipulation', satisfySubmissionStipulation);
router.post('/contracts/generate', generateContracts);
router.post('/contracts/send-for-signature', sendContractsForSignature);
router.get('/contracts/status/:dealId', getContractStatuses);
router.post('/contracts/webhook', handleContractsWebhook);
router.get('/contracts/download/:contractId', downloadContract);
router.get('/funding/status/:dealId', getFundingStatus);
router.post('/funding/submit', submitFundingRequest);
router.put('/funding/update-status', updateFundingStatus);
router.post('/funding/mark-funded', markFundingComplete);
router.post('/funding/cancel', cancelFundingRequest);

export default router;
