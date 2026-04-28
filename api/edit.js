export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      return res.status(400).json({ error: 'Invalid request body.' });
    }
  }

  const { html, instruction } = body || {};
  if (!html || !instruction) return res.status(400).json({ error: 'Missing fields.' });

  // Clean the instruction:
  // - Remove any "Label: " prefix (e.g. "Colour: change..." -> "change...")
  // - Take only first item if slash-separated ("dark green/navy blue" -> "dark green")
  let instr = instruction.trim();
  if (instr.includes(': ')) {
    instr = instr.split(': ').slice(1).join(': ').trim();
  }
  instr = instr.split('/')[0].trim(); // take first option if multiple given
  const low = instr.toLowerCase();

  let out = html;

  // ── 1. PHONE NUMBER ──────────────────────────────────
  const phone = instr.match(/\b[6-9]\d{9}\b/);
  if (phone) {
    const n = phone[0];
    const fmt = `+91 ${n.slice(0,5)} ${n.slice(5)}`;
    out = out
      .replace(/\b[6-9]\d{9}\b/g, n)
      .replace(/\+91[\s-]?\d{5}[\s-]?\d{5}/g, fmt)
      .replace(/91[6-9]\d{9}/g, '91' + n);
    return res.status(200).json({ html: out, msg: `Phone updated to ${fmt}` });
  }

  // ── 2. EMAIL ─────────────────────────────────────────
  const email = instr.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (email) {
    out = out.replace(/[\w.+-]+@[\w.-]+\.\w{2,}/g, email[0]);
    return res.status(200).json({ html: out, msg: `Email updated to ${email[0]}` });
  }

  // ── 3. COLOR CHANGE ───────────────────────────────────
  const colorMap = {
    'dark green':'#065f46','forest green':'#14532d','olive green':'#4d7c0f',
    'emerald green':'#059669','bright green':'#16a34a','green':'#16a34a','lime':'#65a30d',
    'navy blue':'#1e3a8a','dark blue':'#1e40af','royal blue':'#1d4ed8',
    'sky blue':'#0284c7','blue':'#2563eb','teal':'#0d9488','cyan':'#0891b2',
    'dark red':'#991b1b','crimson':'#b91c1c','red':'#dc2626',
    'maroon':'#9f1239','rose':'#e11d48','pink':'#db2777','hot pink':'#ec4899',
    'dark purple':'#581c87','violet':'#7c3aed','purple':'#7c3aed','indigo':'#4338ca',
    'dark orange':'#c2410c','burnt orange':'#c2410c','orange':'#ea580c','amber':'#d97706',
    'gold':'#b45309','golden':'#b45309','dark gold':'#92400e','yellow':'#ca8a04',
    'brown':'#92400e','chocolate':'#78350f','coffee':'#6f4e37',
    'black':'#111827','dark':'#0f172a','charcoal':'#1f2937',
    'white':'#ffffff','cream':'#fefce8','ivory':'#fffbeb','off white':'#f9fafb',
    'gray':'#6b7280','grey':'#6b7280','silver':'#9ca3af','dark gray':'#374151',
    'navy':'#1e3a8a',
  };

  // Check if this is a color instruction
  const colorKeywords = ['color','colour','theme','primary','accent','background','bg','hue','tone','shade'];
  const isColorCmd = colorKeywords.some(k => low.includes(k));

  if (isColorCmd) {
    // Find which color name appears in the instruction (longest match first)
    const sortedNames = Object.keys(colorMap).sort((a,b) => b.length - a.length);
    let newHex = null;
    let matchedName = '';

    for (const name of sortedNames) {
      if (low.includes(name)) {
        newHex = colorMap[name];
        matchedName = name;
        break;
      }
    }

    // Also check for raw hex
    const rawHex = instr.match(/#[0-9a-fA-F]{6}\b/);
    if (rawHex) { newHex = rawHex[0].toLowerCase(); matchedName = newHex; }

    if (newHex) {
      // Find all unique hex colors in the HTML
      const allHex = [...new Set(
        (out.match(/#[0-9a-fA-F]{6}\b/gi) || []).map(h => h.toLowerCase())
      )];

      if (allHex.length === 0) {
        return res.status(200).json({ html: out, error: 'No colors found in page to replace.' });
      }

      // Score each hex by darkness (sum of RGB)
      const scored = allHex.map(h => {
        const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
        return { h, brightness: r+g+b };
      });

      let targetHex;
      if (low.includes('accent') || low.includes('highlight') || low.includes('secondary') || low.includes('link')) {
        // Find the most common mid-brightness color (accent/brand color)
        const mids = scored.filter(x => x.brightness > 150 && x.brightness < 600);
        // Count frequency
        const freq = {};
        (out.match(/#[0-9a-fA-F]{6}\b/gi) || []).forEach(h => {
          const lh = h.toLowerCase();
          freq[lh] = (freq[lh]||0) + 1;
        });
        const sortedMids = mids.sort((a,b) => (freq[b.h]||0) - (freq[a.h]||0));
        targetHex = sortedMids[0]?.h || scored[0].h;
      } else {
        // Primary color = darkest frequently used hex
        const freq = {};
        (out.match(/#[0-9a-fA-F]{6}\b/gi) || []).forEach(h => {
          const lh = h.toLowerCase();
          freq[lh] = (freq[lh]||0) + 1;
        });
        const darks = scored
          .filter(x => x.brightness < 350)
          .sort((a,b) => (freq[b.h]||0) - (freq[a.h]||0));
        targetHex = darks[0]?.h || scored.sort((a,b)=>a.brightness-b.brightness)[0].h;
      }

      // Replace: use regex that matches the exact hex (case-insensitive)
      const escapedTarget = targetHex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedTarget, 'gi');
      out = out.replace(pattern, newHex);

      return res.status(200).json({ html: out, msg: `Color changed to ${matchedName}` });
    }

    // Color keyword found but no color name matched
    return res.status(200).json({
      html: out,
      error: `Colour not recognised. Try: "change color to dark green", "change color to navy blue", "change color to red", "change color to gold", "change color to purple"`
    });
  }

  // ── 4. FONT SIZE ──────────────────────────────────────
  if (low.includes('font') || low.includes('text size') || low.includes('type')) {
    if (low.includes('bigger')||low.includes('larger')||low.includes('increase')) {
      out = out.replace(/font-size:([\d.]+)rem/g, (_,n)=>`font-size:${(parseFloat(n)*1.15).toFixed(2)}rem`);
      return res.status(200).json({ html: out, msg: 'Font size increased 15%' });
    }
    if (low.includes('smaller')||low.includes('decrease')||low.includes('reduce')) {
      out = out.replace(/font-size:([\d.]+)rem/g, (_,n)=>`font-size:${(parseFloat(n)*0.88).toFixed(2)}rem`);
      return res.status(200).json({ html: out, msg: 'Font size decreased 12%' });
    }
  }

  // ── 5. REMOVE SECTION ────────────────────────────────
  if (low.includes('remove')||low.includes('delete')||low.includes('hide')) {
    const sectionKeywords = ['gallery','testimonial','review','pricing','faq','offer','team','about','footer','nav','header'];
    for (const kw of sectionKeywords) {
      if (low.includes(kw)) {
        // Try to remove section by id or class
        const patterns = [
          new RegExp(`<section[^>]*(?:id|class)=["'][^"']*${kw}[^"']*["'][^>]*>[\\s\\S]*?<\\/section>`, 'gi'),
          new RegExp(`<div[^>]*(?:id|class)=["'][^"']*${kw}[^"']*["'][^>]*>[\\s\\S]*?<\\/div>`, 'gi'),
        ];
        let changed = false;
        for (const pat of patterns) {
          if (pat.test(out)) {
            out = out.replace(pat, `<!-- ${kw} removed -->`);
            changed = true;
            break;
          }
        }
        if (changed) return res.status(200).json({ html: out, msg: `${kw} section removed` });
      }
    }
  }

  // ── 6. BUSINESS NAME ─────────────────────────────────
  if (low.includes('name') || low.includes('rename') || low.includes('called')) {
    const nameMatch = instr.match(/(?:to|as|called|name\s+is)\s+["']?([A-Za-z0-9 &.,'-]{3,50})["']?/i);
    if (nameMatch) {
      const newName = nameMatch[1].trim();
      const titleMatch = out.match(/<title>([^<|—]+)/);
      if (titleMatch) {
        const oldName = titleMatch[1].trim();
        if (oldName && oldName.length > 2 && oldName !== newName) {
          out = out.split(oldName).join(newName);
          return res.status(200).json({ html: out, msg: `Business name changed to "${newName}"` });
        }
      }
    }
  }

  // ── 7. SPACING / PADDING ─────────────────────────────
  if (low.includes('spacing')||low.includes('padding')||low.includes('compact')||low.includes('spacious')) {
    if (low.includes('less')||low.includes('compact')||low.includes('reduce')||low.includes('tighter')) {
      out = out.replace(/padding:([\d.]+)px ([\d.]+)%/g, (_,a,b)=>`padding:${Math.round(parseFloat(a)*0.7)}px ${b}%`);
      return res.status(200).json({ html: out, msg: 'Spacing reduced' });
    }
    if (low.includes('more')||low.includes('spacious')||low.includes('increase')) {
      out = out.replace(/padding:([\d.]+)px ([\d.]+)%/g, (_,a,b)=>`padding:${Math.round(parseFloat(a)*1.3)}px ${b}%`);
      return res.status(200).json({ html: out, msg: 'Spacing increased' });
    }
  }

  // ── NO MATCH — return helpful message, NO AI, NO TIMEOUT ──
  return res.status(200).json({
    html: out,
    error: [
      'Command not recognised. Try these instant edits:',
      '',
      'PHONE: type 10 digits — e.g. 9321027740',
      'EMAIL: type it — e.g. you@gmail.com',
      'COLOUR: change color to dark green',
      'COLOUR: change color to navy blue',
      'COLOUR: change color to red',
      'COLOUR: change color to gold',
      'COLOUR: change color to purple',
      'COLOUR: change accent to gold',
      'FONT: make fonts bigger',
      'FONT: make fonts smaller',
      'REMOVE: remove gallery section',
      'NAME: rename to "My Business Name"',
    ].join('\n')
  });
}
