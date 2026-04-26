export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { html, instruction } = req.body;
  if (!html || !instruction) return res.status(400).json({ error: 'Missing fields.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set.' });

  const instr = instruction.trim();
  const instrLower = instr.toLowerCase();
  let modified = html;

  // ══════════════════════════════════════════════════════
  // DIRECT REPLACEMENTS — no AI, instant, never times out
  // ══════════════════════════════════════════════════════

  // 1. Phone number — detect any 10-digit number in instruction
  const phoneMatch = instr.match(/\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    const newPhone = phoneMatch[0];
    const formatted = `+91 ${newPhone.slice(0,5)} ${newPhone.slice(5)}`;
    modified = modified
      .replace(/\b[6-9]\d{9}\b/g, newPhone)
      .replace(/\+91\s?\d{5}\s?\d{5}/g, formatted)
      .replace(/91[6-9]\d{9}/g, '91' + newPhone);
    return res.status(200).json({ html: modified });
  }

  // 2. Email address
  const emailMatch = instr.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) {
    const newEmail = emailMatch[0];
    modified = modified.replace(/[\w.+-]+@[\w.-]+\.\w{2,}/g, newEmail);
    return res.status(200).json({ html: modified });
  }

  // 3. Color changes — direct CSS variable swap
  const colorMap = {
    'red': '#dc2626', 'dark red': '#991b1b', 'crimson': '#b91c1c',
    'blue': '#1d4ed8', 'dark blue': '#1e3a8a', 'navy': '#1e3a8a', 'navy blue': '#1e3a8a',
    'sky blue': '#0284c7', 'royal blue': '#1a56db',
    'green': '#059669', 'dark green': '#065f46', 'emerald': '#059669', 'forest green': '#166534',
    'olive': '#4d7c0f', 'lime': '#65a30d',
    'purple': '#7c3aed', 'violet': '#7c3aed', 'indigo': '#4338ca', 'dark purple': '#581c87',
    'orange': '#ea580c', 'dark orange': '#c2410c',
    'yellow': '#ca8a04', 'gold': '#b45309', 'golden': '#b45309',
    'pink': '#db2777', 'rose': '#e11d48', 'maroon': '#9f1239',
    'teal': '#0d9488', 'cyan': '#0891b2', 'turquoise': '#0d9488',
    'brown': '#92400e', 'chocolate': '#92400e',
    'black': '#111827', 'charcoal': '#1f2937', 'dark': '#0f172a',
    'white': '#f9fafb', 'cream': '#fefce8', 'ivory': '#fffbeb',
    'gray': '#6b7280', 'grey': '#6b7280', 'silver': '#9ca3af',
  };

  for (const [colorName, hex] of Object.entries(colorMap)) {
    if (instrLower.includes(colorName) &&
        (instrLower.includes('color') || instrLower.includes('colour') ||
         instrLower.includes('theme') || instrLower.includes('background') ||
         instrLower.includes('primary') || instrLower.includes('accent'))) {

      // Replace the primary/accent color — find first hex color in CSS and replace
      // Strategy: replace all occurrences of the dominant color
      const hexMatches = modified.match(/#[0-9a-fA-F]{6}/g) || [];
      if (hexMatches.length > 0) {
        // Find most common hex (the primary color)
        const freq = {};
        hexMatches.forEach(h => { freq[h.toLowerCase()] = (freq[h.toLowerCase()] || 0) + 1; });
        const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
        const primaryHex = sorted[0][0];

        if (instrLower.includes('accent') || instrLower.includes('highlight')) {
          // Replace second most common
          const accentHex = sorted[1]?.[0] || primaryHex;
          modified = modified.split(accentHex).join(hex);
          modified = modified.split(accentHex.toUpperCase()).join(hex);
        } else {
          // Replace primary (most common dark color)
          const darkColors = sorted.filter(([h]) => {
            const r = parseInt(h.slice(1,3),16);
            const g = parseInt(h.slice(3,5),16);
            const b = parseInt(h.slice(5,7),16);
            return r+g+b < 400; // dark colors
          });
          const targetHex = darkColors[0]?.[0] || primaryHex;
          modified = modified.split(targetHex).join(hex);
          modified = modified.split(targetHex.toUpperCase()).join(hex);
        }
        return res.status(200).json({ html: modified });
      }
    }
  }

  // 4. Business name change
  if (instrLower.includes('business name') || instrLower.includes('company name') ||
      instrLower.includes('rename') || instrLower.includes('change name')) {
    const nameMatch = instr.match(/(?:to|as|called|name)\s+"?([^"'\n]+)"?/i);
    if (nameMatch) {
      const newName = nameMatch[1].trim();
      // Find current business name in title tag and replace throughout
      const titleMatch = modified.match(/<title>([^<]+)<\/title>/);
      if (titleMatch) {
        const oldName = titleMatch[1].split('|')[0].split('—')[0].trim();
        if (oldName && oldName.length > 2) {
          modified = modified.split(oldName).join(newName);
        }
      }
      return res.status(200).json({ html: modified });
    }
  }

  // 5. Font size changes
  if (instrLower.includes('font') && instrLower.includes('size')) {
    if (instrLower.includes('bigger') || instrLower.includes('larger') || instrLower.includes('increase')) {
      modified = modified.replace(/font-size:([\d.]+)rem/g, (m, n) => `font-size:${(parseFloat(n)*1.15).toFixed(2)}rem`);
      return res.status(200).json({ html: modified });
    }
    if (instrLower.includes('smaller') || instrLower.includes('decrease')) {
      modified = modified.replace(/font-size:([\d.]+)rem/g, (m, n) => `font-size:${(parseFloat(n)*0.88).toFixed(2)}rem`);
      return res.status(200).json({ html: modified });
    }
  }

  // 6. Remove section keywords
  const removable = ['testimonial','review','gallery','pricing','faq','about','team','service','contact'];
  for (const kw of removable) {
    if (instrLower.includes('remove') && instrLower.includes(kw)) {
      const sectionRe = new RegExp(`<section[^>]*id=["'][^"']*${kw}[^"']*["'][^>]*>[\\s\\S]*?<\\/section>`, 'gi');
      modified = modified.replace(sectionRe, '');
      return res.status(200).json({ html: modified });
    }
  }

  // ══════════════════════════════════════════════════════
  // AI EDITS — for complex changes, use fastest model
  // ══════════════════════════════════════════════════════

  // Aggressively compress HTML to fit in context
  const compressed = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
    .substring(0, 8000); // hard limit - fits in 8B model context

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // FAST: 2-4 sec vs 70b's 20-40 sec
        max_tokens: 6000,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You edit HTML websites. Return ONLY complete HTML starting with <!DOCTYPE html>. No markdown, no explanation. Make only the requested change.'
          },
          {
            role: 'user',
            content: `HTML:\n${compressed}\n\nCHANGE: ${instr}\n\nReturn complete modified HTML.`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${response.status}`;
      if (response.status === 429) return res.status(429).json({ error: 'Rate limit. Please wait 30 seconds.' });
      return res.status(500).json({ error: 'AI error: ' + msg });
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';
    result = result.replace(/^```html\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();

    if (!result || !result.toLowerCase().includes('<!doctype')) {
      return res.status(500).json({ error: 'AI could not complete the edit. Try a simpler instruction.' });
    }

    return res.status(200).json({ html: result });

  } catch (err) {
    return res.status(500).json({ error: 'Request failed: ' + (err.message || 'unknown error') });
  }
}
