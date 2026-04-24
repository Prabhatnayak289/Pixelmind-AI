export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { bizType, bizName, bizDesc } = req.body;
  if (!bizType || !bizName) {
    return res.status(400).json({ error: 'bizType and bizName are required.' });
  }

  const prompt = `Generate a complete, beautiful, single-file HTML landing page for a ${bizType} called "${bizName}".
${bizDesc ? `Key selling points: ${bizDesc}` : ''}

Requirements:
- Modern professional design, warm trustworthy color palette (absolutely no purple gradients)
- Google Fonts imported inside the <style> tag
- Sections: sticky navbar, hero section with headline and CTA button, 3-4 service cards, Why Choose Us section with 3 points, 2-3 realistic testimonials, contact/appointment CTA at bottom
- Fully mobile responsive CSS with media queries
- Smooth CSS entrance animations (fade and slide up on load)
- Prominent CTA buttons with hover effects
- Everything in ONE single HTML file — no external JS files at all
- Realistic convincing content specific to a ${bizType}
- Overall quality and feel of a Rs.30000 professionally designed website
- Floating WhatsApp button fixed at bottom-right corner, linking to: https://wa.me/919876543210

Output ONLY the raw complete HTML code. No markdown code fences, no explanation text, no preamble. Start directly with <!DOCTYPE html>`;

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY environment variable is not set in Vercel.' });
    }

    // Groq API — OpenAI-compatible endpoint
    // Free tier: no credit card, just email signup at console.groq.com
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',   // Best free model on Groq
        max_tokens: 4096,
        temperature: 0.85,
        messages: [
          {
            role: 'system',
            content: 'You are an expert web designer and developer. You generate complete, beautiful, production-quality single-file HTML websites. You output ONLY raw HTML starting with <!DOCTYPE html>. Never use markdown fences or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq API error:', JSON.stringify(err));
      return res.status(response.status).json({
        error: err.error?.message || 'Groq API error. Please check your API key in Vercel settings.'
      });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || '';

    // Strip any accidental markdown fences
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    if (!html || html.length < 100) {
      return res.status(500).json({ error: 'Empty or too-short response from AI. Please try again.' });
    }

    return res.status(200).json({ html });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
