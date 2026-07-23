import * as riskService from '../services/riskService.js';

export async function getRisks(req, res) {
  try {
    const data = await riskService.getAllRisks();
    res.json(data);
  } catch (error) {
    console.error('getRisks Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createRisk(req, res) {
  try {
    const { projectId, type, description, severity, likelihood, owner, status } = req.body;
    if (!projectId || !type || !description || !owner || !status) {
      return res.status(400).json({ error: 'Project ID, type, description, owner, and status are required' });
    }

    const data = await riskService.createRaidEntry(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error('createRisk Error:', error);
    res.status(500).json({ error: 'Failed to create RAID entry' });
  }
}
