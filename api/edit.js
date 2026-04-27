export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;

  // Parse body if it's a string (some Vercel configs)
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      return res.status(400).json({ error: 'Invalid request body.' });
    }
  }

  const { html, instruction } = body || {};
  if (!html || !instruction) return res.status(400).json({ error: 'Missing html or instruction.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured in Vercel.' });

  const instr = instruction.trim();
  const low = instr.toLowerCase();
  let out = html;

  // ────────────────────────────────────────────────
  // INSTANT DIRECT EDITS — no AI, no timeout risk
  // ────────────────────────────────────────────────

  // PHONE NUMBER — any 10-digit Indian mobile number
  const phone = instr.match(/\b[6-9]\d{9}\b/);
  if (phone) {
    const n = phone[0];
    const fmt = `+91 ${n.slice(0,5)} ${n.slice(5)}`;
    out = out
      .replace(/\b[6-9]\d{9}\b/g, n)
      .replace(/\+91[\s-]?\d{5}[\s-]?\d{5}/g, fmt)
      .replace(/91[6-9]\d{9}/g, '91' + n);
    return res.status(200).json({ html: out });
  }

  // EMAIL ADDRESS
  const email = instr.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (email) {
    out = out.replace(/[\w.+-]+@[\w.-]+\.\w{2,}/g, email[0]);
    return res.status(200).json({ html: out });
  }

  // COLOR CHANGE — map colour names to hex
  const colorNames = {
    'dark green':'#065f46','forest green':'#14532d','emerald':'#059669','green':'#16a34a','lime':'#65a30d','olive':'#4d7c0f',
    'navy blue':'#1e3a8a','navy':'#1e3a8a','dark blue':'#1e40af','royal blue':'#1d4ed8','blue':'#2563eb','sky blue':'#0284c7','teal':'#0d9488','cyan':'#0891b2',
    'dark red':'#991b1b','crimson':'#b91c1c','red':'#dc2626','maroon':'#9f1239','rose':'#e11d48','pink':'#db2777',
    'dark purple':'#581c87','violet':'#7c3aed','purple':'#7c3aed','indigo':'#4338ca',
    'dark orange':'#c2410c','orange':'#ea580c','amber':'#d97706',
    'gold':'#b45309','golden':'#b45309','yellow':'#ca8a04',
    'brown':'#92400e','chocolate':'#78350f',
    'black':'#111827','charcoal':'#1f2937','dark':'#0f172a',
    'white':'#ffffff','cream':'#fefce8','ivory':'#fffbeb',
    'gray':'#6b7280','grey':'#6b7280','silver':'#9ca3af',
  };

  const isColorChange = low.includes('color') || low.includes('colour') || low.includes('theme') || low.includes('primary') || low.includes('accent');
  if (isColorChange) {
    // Find the color name in the instruction
    let foundHex = null;
    let foundName = '';
    // Sort by length descending so "dark green" matches before "green"
    const sortedNames = Object.keys(colorNames).sort((a,b) => b.length - a.length);
    for (const name of sortedNames) {
      if (low.includes(name)) {
        foundHex = colorNames[name];
        foundName = name;
        break;
      }
    }
    // Also support raw hex in instruction like "change to #ff0000"
    const rawHex = instr.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
    if (rawHex) { foundHex = rawHex[0]; foundName = 'custom'; }

    if (foundHex) {
      // Extract all hex colors from the HTML
      const hexRe = /#([0-9a-fA-F]{6})\b/g;
      const allHex = [...out.matchAll(hexRe)].map(m => m[0].toLowerCase());
      
      // Count frequency
      const freq = {};
      allHex.forEach(h => freq[h] = (freq[h]||0)+1);
      const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]);

      if (sorted.length > 0) {
        let targetHex;
        if (low.includes('accent') || low.includes('highlight') || low.includes('secondary')) {
          // Find the accent — look for a non-dark color with high frequency
          const accent = sorted.find(([h]) => {
            const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
            return r+g+b > 200 && r+g+b < 700; // mid-range brightness
          });
          targetHex = accent ? accent[0] : sorted[1]?.[0] || sorted[0][0];
        } else {
          // Primary — find the most frequent dark color (background/primary colors)
          const dark = sorted.find(([h]) => {
            const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
            return r+g+b < 300;
          });
          targetHex = dark ? dark[0] : sorted[0][0];
        }
        // Replace all occurrences (both lowercase and uppercase)
        const re = new RegExp(targetHex.replace('#','#'), 'gi');
        out = out.replace(re, foundHex);
        return res.status(200).json({ html: out });
      }
    }
  }

  // FONT SIZE
  if (low.includes('font') || low.includes('text size') || low.includes('type size')) {
    if (low.includes('bigger')||low.includes('larger')||low.includes('increase')||low.includes('bigger')) {
      out = out.replace(/font-size:([\d.]+)rem/g, (_,n)=>`font-size:${(parseFloat(n)*1.15).toFixed(2)}rem`);
      return res.status(200).json({ html: out });
    }
    if (low.includes('smaller')||low.includes('decrease')||low.includes('reduce')) {
      out = out.replace(/font-size:([\d.]+)rem/g, (_,n)=>`font-size:${(parseFloat(n)*0.88).toFixed(2)}rem`);
      return res.status(200).json({ html: out });
    }
  }

  // REMOVE SECTION
  if (low.includes('remove')||low.includes('delete')||low.includes('hide')) {
    const sections = ['gallery','testimonial','review','pricing','faq','team','about','contact','service','offer','footer'];
    for (const kw of sections) {
      if (low.includes(kw)) {
        // Match by id or class containing keyword
        out = out.replace(
          new RegExp(`<(section|div)[^>]*(?:id|class)=["'][^"']*${kw}[^"']*["'][^>]*>[\\s\\S]*?<\\/\\1>`, 'gi'),
          `<!-- ${kw} section removed -->`
        );
        return res.status(200).json({ html: out });
      }
    }
  }

  // ─────────────────────────────────────────────────────
  // AI EDIT — fast 8b model, compressed HTML, 8s timeout
  // ─────────────────────────────────────────────────────
  
  // Compress HTML to reduce tokens
  const compressed = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n\s*/g, '\n')
    .replace(/>\s+</g, '><')
    .trim()
    .substring(0, 9000); // ~2250 tokens — fits fast model

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000); // 8s — under Vercel's 10s limit

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 6000,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are an HTML editor. Return ONLY the complete modified HTML file starting with <!DOCTYPE html>. No markdown fences, no explanation, no preamble.'
          },
          {
            role: 'user',
            content: `HTML:\n${compressed}\n\nINSTRUCTION: ${instr}\n\nReturn the complete HTML with only that change made.`
          }
        ]
      }),
      signal: ac.signal
    });

    clearTimeout(timer);

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      if (resp.status === 429) return res.status(200).json({ html: out, note: 'Rate limited — no change made. Wait 30s.' });
      return res.status(200).json({ html: out, error: 'AI unavailable: ' + (err.error?.message || resp.status) });
    }

    const data = await resp.json();
    let result = (data.choices?.[0]?.message?.content || '').trim();
    result = result.replace(/^```html\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/,'').trim();

    if (result.length < 500 || !result.toLowerCase().startsWith('<!doctype')) {
      return res.status(200).json({ html: out, error: 'AI response incomplete — original preserved.' });
    }

    return res.status(200).json({ html: result });

  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      return res.status(200).json({
        html: out,
        error: 'AI timed out. Use direct commands: type a phone number, type your email, or say "change color to green".'
      });
    }
    return res.status(200).json({ html: out, error: 'Error: ' + e.message });
  }
}
