import { applyRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!applyRateLimit(req, res)) return;

  // BYOK: client sends their own key in Authorization header
  const authHeader = req.headers['authorization'] || '';
  const clientKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKey = clientKey || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      error: 'No API key provided. Add your Groq API key in the app settings.'
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
