import express from 'express';
import * as riskController from '../controllers/riskController.js';

const router = express.Router();

router.get('/', riskController.getRisks);
router.post('/', riskController.createRisk);

export default router;
