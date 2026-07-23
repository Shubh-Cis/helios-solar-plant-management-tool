import express from 'express';
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

router.post('/', documentController.uploadDocument);
router.put('/:id/status', documentController.updateStatus);

export default router;
