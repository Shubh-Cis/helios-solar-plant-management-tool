import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', aiController.chat);
router.post('/report', aiController.generateReport);
router.post('/top-risks', aiController.getTopRisks);

export default router;
