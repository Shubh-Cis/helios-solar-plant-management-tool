import * as erpCrmService from '../services/erpCrmService.js';

export async function syncSystem(req, res) {
  try {
    const { system } = req.body;

    if (!system || !['ERP', 'CRM'].includes(system)) {
      return res.status(400).json({ error: 'Valid system (ERP, CRM) is required' });
    }

    let result;
    if (system === 'ERP') {
      result = await erpCrmService.syncERP();
    } else {
      result = await erpCrmService.syncCRM();
    }

    if (!result) {
      return res.status(500).json({ error: 'System sync failed' });
    }

    res.json(result);
  } catch (error) {
    console.error('syncSystem Error:', error);
    res.status(500).json({ error: 'System sync processing failed' });
  }
}
