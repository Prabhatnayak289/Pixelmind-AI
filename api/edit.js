export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { html, instruction, history } = req.body;
  if (!html || !instruction) return res.status(400).json({ error: 'Missing html or instruction.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel environment variables.' });

  // Determine edit type to choose best approach
  const instr = instruction.toLowerCase();
  const isSimple = 
    instr.includes('phone') || instr.includes('number') || instr.includes('mobile') ||
    instr.includes('email') || instr.includes('price') || instr.includes('pricing') ||
    instr.includes('name') || instr.includes('address') || instr.includes('hour') ||
    instr.includes('text') || instr.includes('change') && html.length > 15000;

  let modifiedHtml = html;

  // For simple text replacements, do it without AI
  if (isSimple && (instr.includes('phone') || instr.includes('number') || instr.includes('mobile'))) {
    const numMatch = instruction.match(/\d{10}/);
    if (numMatch) {
      const newNum = numMatch[0];
      modifiedHtml = html
        .replace(/\d{10}/g, newNum)
        .replace(/\+91\s?\d{5}\s?\d{5}/g, '+91 ' + newNum.slice(0,5) + ' ' + newNum.slice(5))
        .replace(/919\d{9}/g, '91' + newNum);
      return res.status(200).json({ html: modifiedHtml, note: 'Phone number updated directly.' });
    }
  }

  if (isSimple && instr.includes('email')) {
    const emailMatch = instruction.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      modifiedHtml = html.replace(/[\w.-]+@[\w.-]+\.\w+/g, emailMatch[0]);
      return res.status(200).json({ html: modifiedHtml, note: 'Email updated directly.' });
    }
  }

  // For AI edits: send a compressed version of HTML (remove comments, extra whitespace)
  // to stay within token limits
  const compressedHtml = html
    .replace(/<!--[\s\S]*?-->/g, '')  // remove HTML comments
    .replace(/\s{2,}/g, ' ')          // collapse whitespace
    .replace(/>\s+</g, '><')          // remove whitespace between tags
    .trim();

  // If still too large, send only CSS vars + body structure
  const htmlToSend = compressedHtml.length > 14000 
    ? compressedHtml.substring(0, 14000) + '\n... [rest of HTML preserved] ...'
    : compressedHtml;

  const systemPrompt = `You are an expert web developer editing a business landing page HTML file.
The user wants to make a specific change. You MUST return the COMPLETE modified HTML file.

CRITICAL RULES:
1. Return ONLY raw HTML starting with <!DOCTYPE html> — no markdown, no explanation
2. Make ONLY the change the user asked for — preserve everything else exactly  
3. If you received truncated HTML (ending with "... [rest preserved]"), reconstruct the full file based on what you know
4. Keep all phone numbers, WhatsApp links, and contact info UNLESS the user is changing them
5. Keep all CSS styles, animations, and scripts intact
6. Return a complete, valid, working HTML file — never truncate your response`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-4).map(h => ({ role: h.role, content: h.content.substring(0, 500) })),
    { role: 'user', content: `CURRENT HTML (may be compressed):\n${htmlToSend}\n\nINSTRUCTION: "${instruction}"\n\nReturn the complete modified HTML file starting with <!DOCTYPE html>.` }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 8000,
        temperature: 0.2,
        messages
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.json();
      const msg = err.error?.message || 'Groq API error';
      // Provide helpful error messages
      if (msg.includes('rate_limit') || msg.includes('quota')) {
        return res.status(429).json({ error: 'Rate limit reached. Please wait 30 seconds and try again.' });
      }
      return res.status(response.status).json({ error: msg });
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';
    
    // Clean response
    result = result
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    if (!result || result.length < 500) {
      return res.status(500).json({ error: 'AI returned an empty response. Please try a simpler instruction.' });
    }

    // Ensure it starts with DOCTYPE
    if (!result.toLowerCase().includes('<!doctype')) {
      return res.status(500).json({ error: 'AI response was incomplete. Please try again with a shorter instruction.' });
    }

    return res.status(200).json({ html: result });

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out. Try a simpler change like "change color to green" or "update phone number".' });
    }
    console.error('Edit API error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
