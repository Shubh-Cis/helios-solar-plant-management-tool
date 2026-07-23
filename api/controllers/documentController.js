import * as documentService from '../services/documentService.js';

export async function uploadDocument(req, res) {
  try {
    const { projectId, name, type, comments } = req.body;

    if (!projectId || !name || !type) {
      return res.status(400).json({ error: 'Project ID, document name, and type are required' });
    }

    const document = await documentService.createDocument({ projectId, name, type, comments });
    res.status(201).json(document);
  } catch (error) {
    console.error('uploadDocument Error:', error);
    res.status(550).json({ error: 'Failed to create document' });
  }
}

export async function updateStatus(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { status, comments } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    if (!status || !['Approved', 'Rejected', 'Under Review'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (Approved, Rejected, Under Review) is required' });
    }

    const updatedDoc = await documentService.updateDocumentStatus(id, { status, comments });
    if (!updatedDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error('updateStatus Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
