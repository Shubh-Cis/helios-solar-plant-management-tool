import * as projectService from '../services/projectService.js';

export async function getProjects(req, res) {
  try {
    const data = await projectService.getAllProjects();
    res.json(data);
  } catch (error) {
    console.error('getProjects Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProjectDetail(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(450).json({ error: 'Invalid project ID format' });
    }

    const data = await projectService.getProjectById(id);
    if (!data) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('getProjectDetail Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createProject(req, res) {
  try {
    const newProject = await projectService.createProject(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('createProject Error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function updateProject(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    const updated = await projectService.updateProject(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('updateProject Error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function deleteProject(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    const deleted = await projectService.deleteProject(id);
    res.json({ message: 'Project successfully deleted', project: deleted });
  } catch (error) {
    console.error('deleteProject Error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

export async function updateMilestone(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid milestone ID format' });
    }
    const updated = await projectService.updateMilestone(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('updateMilestone Error:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
}
