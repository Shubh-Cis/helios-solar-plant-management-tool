import * as aiService from '../services/aiService.js';

export async function chat(req, res) {
  try {
    const { message, history, apiKey } = req.body || {};
    if (!message && !history) {
      return res.status(400).json({ error: 'Message or history is required' });
    }

    const input = history || message;
    const responseText = await aiService.generateChatResponse(input, apiKey);
    res.json({ response: responseText });
  } catch (error) {
    console.error('AI chat route Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
}

export async function generateReport(req, res) {
  try {
    const { apiKey } = req.body || {};
    const reportText = await aiService.generateExecutiveReport(apiKey);
    res.json({ report: reportText });
  } catch (error) {
    console.error('AI report route Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

export async function getTopRisks(req, res) {
  try {
    const { apiKey } = req.body || {};
    const topRisks = await aiService.generateTopRisks(apiKey);
    res.json(topRisks);
  } catch (error) {
    console.error('AI top risks route Error:', error);
    res.status(500).json({ error: 'Failed to identify top risks' });
  }
}
