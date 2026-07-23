import express from 'express';
import * as projectController from '../controllers/projectController.js';

const router = express.Router();

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectDetail);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.put('/milestones/:id', projectController.updateMilestone);
router.delete('/:id', projectController.deleteProject);

export default router;
