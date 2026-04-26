export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { html, instruction, history } = req.body;
  if (!html || !instruction) return res.status(400).json({ error: 'Missing html or instruction.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set.' });

  // Build conversation history for multi-turn chat
  const messages = [
    {
      role: 'system',
      content: `You are an expert web developer and designer helping edit a business website.
You receive the current HTML and a user instruction. You return ONLY the complete modified HTML.

STRICT RULES:
1. Return ONLY raw HTML starting with <!DOCTYPE html> — no markdown, no explanation, no fences
2. Make ONLY the changes the user asked for — preserve everything else exactly
3. Keep all WhatsApp links, phone numbers, and contact info
4. Keep all existing sections unless user explicitly says to remove one
5. If user asks to change color, update ALL relevant CSS variables and color references
6. If user asks to add a section, add it in a logical place
7. If user asks to change text, find and replace only that text
8. Always return a complete, valid, working HTML file`
    },
    // Include previous turns for context
    ...(history || []).map(h => ({ role: h.role, content: h.content })),
    {
      role: 'user',
      content: `CURRENT HTML:\n${html.substring(0, 12000)}\n\nINSTRUCTION: ${instruction}\n\nReturn only the complete modified HTML.`
    }
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 8000,
        temperature: 0.3, // Lower temp for precise edits
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error.' });
    }

    const data = await response.json();
    let modifiedHtml = data.choices?.[0]?.message?.content || '';
    modifiedHtml = modifiedHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    if (!modifiedHtml || modifiedHtml.length < 200) {
      return res.status(500).json({ error: 'AI returned empty response. Please try again.' });
    }

    return res.status(200).json({ html: modifiedHtml });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
