import express from 'express';
import * as erpCrmController from '../controllers/erpCrmController.js';

const router = express.Router();

router.post('/sync', erpCrmController.syncSystem);

export default router;
