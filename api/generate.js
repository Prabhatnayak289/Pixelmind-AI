export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { bizType, bizName, bizDesc } = req.body;
  if (!bizType || !bizName) return res.status(400).json({ error: 'Missing fields.' });

  // World-class design blueprints per category
  const blueprints = {
    "dental clinic": {
      colors: "#0a2342 (deep navy), #1e7bb8 (dental blue), #f8f4ef (warm cream), #e8f4f8 (light blue tint), #2ecc71 (trust green)",
      hero: "Full-width hero with a large smiling patient photo background (use CSS gradient overlay on a realistic background-color), big headline like 'Your Smile. Our Passion.' with appointment booking CTA and phone number prominently",
      sections: "1) Hero with video-overlay effect using CSS animation 2) 'Why Choose Us' with 4 icon cards: Painless Treatment, Advanced Technology, Experienced Doctors, Flexible EMI 3) Services grid: General Dentistry, Cosmetic Dentistry, Dental Implants, Orthodontics, Root Canal, Teeth Whitening — each with icon + brief desc + 'Learn More' link 4) Meet The Doctor section with photo placeholder (styled circle), credentials, years experience 5) Technology section: CBCT Scanning, Laser Dentistry, Digital X-Ray, Same-Day Crowns 6) Patient Testimonials: 3 cards with star ratings, patient name, treatment type 7) Before/After results teaser section with 'Book Free Consultation' CTA 8) Insurance/EMI section: 'No Insurance? No Problem. EMI from ₹999/month' 9) Appointment booking CTA section with phone + WhatsApp button",
      fonts: "Playfair Display for headings, Lato for body",
      accent: "Use tooth/smile emoji as decorative elements, clean medical aesthetic"
    },
    "law firm": {
      colors: "#1a1a2e (deep navy), #c9a84c (gold), #f5f5f0 (off white), #2c3e50 (dark slate)",
      hero: "Dark sophisticated hero with marble texture CSS background, gold accent headline 'Justice. Integrity. Results.' with 'Free Consultation' CTA button",
      sections: "1) Hero with dark overlay, firm tagline, 2 CTAs 2) Practice Areas: grid of 6 areas (Criminal Law, Civil Litigation, Family Law, Corporate Law, Property Law, Consumer Cases) with icon + brief desc 3) Why Our Firm: 4 trust pillars — Years Experience, Cases Won, 5-Star Reviews, Free Consultation 4) Attorney profiles: 2-3 cards with photo placeholder, specialization, bar enrollment year 5) Case Results/Victories: 3 highlighted wins with amount/outcome 6) Client Testimonials: 3 reviews with star rating 7) Legal Process: 4-step process (Consultation → Case Review → Strategy → Victory) 8) Urgent CTA: 'Available 24/7 for Emergency Legal Help' with phone number",
      fonts: "Cormorant Garamond for headings, Source Sans Pro for body",
      accent: "Scales of justice motif, gold dividers, formal authoritative tone"
    },
    "fitness coach": {
      colors: "#0d0d0d (black), #ff3d00 (fire orange), #1a1a1a (dark), #f5f5f5 (light), #ffd700 (gold)",
      hero: "Dark high-energy hero with CSS animated gradient background (dark to orange glow), bold headline 'Transform Your Body. Transform Your Life.' with 'Start Free Trial' CTA",
      sections: "1) Dark hero with energy gradient, bold stats (500+ Clients, 10 Years, 95% Success Rate) 2) Transformation Results: before/after style section with 'Real People Real Results' 3) Programs: 6 program cards (Weight Loss, Muscle Gain, HIIT Training, Nutrition Plan, Online Coaching, Group Classes) each with price tag 4) Training Methodology: 4 pillars with icons 5) Coach Profile: large photo area, certifications, achievements 6) Schedule/Timetable: weekly class schedule grid 7) Pricing Plans: 3 tiers (Basic/Pro/Elite) with features list 8) Testimonials: 3 transformation stories with before/after stats 9) Free Trial CTA: bold, urgent 'Claim Your Free Week Now'",
      fonts: "Oswald for headings, Open Sans for body",
      accent: "High energy, bold typography, fitness/fire imagery with CSS shapes"
    },
    "restaurant": {
      colors: "#1a0a00 (deep brown), #d4a017 (golden), #8b0000 (deep red), #f9f3e8 (warm cream), #2d5016 (herb green)",
      hero: "Warm atmospheric hero with CSS radial gradient simulating candlelight, headline 'Where Every Bite Tells a Story' with 'Reserve a Table' and 'View Menu' CTAs",
      sections: "1) Atmospheric hero with reservation CTA 2) Featured Dishes: 6 dish cards with CSS food color gradients, dish name, price, description 3) Our Story: chef photo area, founding story, philosophy 4) Menu Highlights: Starters, Mains, Desserts tabs (CSS only) 5) Ambiance gallery: 4 CSS-styled image placeholders showing different areas 6) Special Offers: Happy Hour, Weekend Brunch, Private Dining 7) Chef's Specials: rotating daily specials section 8) Testimonials: food critic style reviews 9) Reservation form section with date/time/party size 10) Opening hours + Google Maps embed placeholder",
      fonts: "Playfair Display for headings, Crimson Text for body",
      accent: "Warm candlelit colors, food emoji decorations, elegant restaurant feel"
    },
    "software agency": {
      colors: "#0a0a1a (deep dark), #6c63ff (electric purple), #00d4ff (cyan), #1a1a2e (dark navy), #f0f0ff (light lavender)",
      hero: "Tech dark hero with animated CSS grid/matrix background, headline 'We Build Software That Scales' with 'Get Free Estimate' and 'View Our Work' CTAs",
      sections: "1) Dark tech hero with floating code elements (CSS pseudo-elements) 2) Services: Web Development, Mobile Apps, AI/ML Solutions, Cloud DevOps, UI/UX Design, API Integration — hexagonal or card grid 3) Tech Stack logos: React, Node.js, Python, AWS, Flutter etc. (text badges styled) 4) Process: Agile 5-step workflow (Discovery, Design, Develop, Test, Deploy) 5) Portfolio: 4 project showcase cards with tech tags 6) Why Us: 4 differentiators with animated number counters (CSS) 7) Client Testimonials from CTOs/Founders 8) Pricing/Engagement models: Fixed, Retainer, Dedicated Team 9) Team section: developer profiles 10) Contact form with project type selector",
      fonts: "Space Grotesk for headings, JetBrains Mono for code elements, Inter for body",
      accent: "Terminal-style code snippets, tech grid overlays, electric color accents"
    },
    "real estate agency": {
      colors: "#0d1b2a (deep navy), #c5a028 (gold), #e8e0d0 (warm sand), #1b4332 (forest green), #ffffff",
      hero: "Luxury real estate hero with CSS gradient simulating a premium property, headline 'Find Your Dream Home' with property search bar (non-functional but beautiful) and 'Browse Properties' CTA",
      sections: "1) Hero with property search bar design 2) Featured Properties: 6 property cards with price, beds/baths, location, CSS image placeholder styled as property photo 3) Why Choose Us: 4 stats — Properties Sold, Happy Families, Years Experience, Awards Won 4) Services: Buy, Sell, Rent, Invest, Property Management, Valuation 5) Area/Neighborhood Guide: 4 area cards with key metrics 6) Client Testimonials: happy homeowner stories 7) Meet The Agents: 3 agent cards with photo, specialization, listings count 8) Market Insights: current market stats section 9) Process: 5-step buying journey 10) Free Valuation CTA",
      fonts: "Cormorant Garamond for headings, Raleway for body",
      accent: "Premium property feel, gold accents, spacious layouts"
    },
    "yoga studio": {
      colors: "#f5f0eb (warm cream), #8b6914 (earthy gold), #2d4a3e (deep sage), #e8d5b7 (warm sand), #7c9885 (sage green)",
      hero: "Serene natural hero with CSS organic gradient (sage to cream), headline 'Find Your Inner Peace' with 'Book a Class' CTA and class schedule teaser",
      sections: "1) Serene hero with breathing animation (CSS pulse) 2) Class Types: 8 yoga styles (Hatha, Vinyasa, Yin, Restorative, Hot Yoga, Prenatal, Kids, Meditation) with difficulty level 3) Weekly Schedule: beautiful timetable grid 4) Instructor Profiles: 3 teachers with certifications, specialty, photo placeholder 5) Studio Tour: 4 space cards (Main Hall, Hot Room, Meditation Room, Lounge) 6) Pricing: Drop-in, Monthly, Annual with class pass bundles 7) Wellness Philosophy: brand story + values 8) Community Testimonials: transformation stories 9) Workshops & Events: upcoming special events 10) First Class Free CTA",
      fonts: "Lora for headings, Nunito for body",
      accent: "Organic shapes, lotus/leaf motifs, breathing space, zen aesthetic"
    },
    "photography studio": {
      colors: "#0d0d0d (near black), #f5f5f5 (near white), #c9a84c (gold), #2c2c2c (dark grey)",
      hero: "Dramatic dark hero with CSS masonry-style image grid placeholders, headline 'Moments Captured Forever' with 'View Portfolio' and 'Book a Session' CTAs",
      sections: "1) Dark cinematic hero with CSS film-strip animation 2) Portfolio Gallery: masonry CSS grid with 9 styled placeholder divs in different aspect ratios, categorized 3) Photography Packages: Portrait, Wedding, Corporate, Product, Fashion, Events — card grid with starting price 4) Our Process: Consultation, Planning, Shoot Day, Editing, Delivery 5) Equipment & Style: gear highlights, editing style description 6) Client Love: testimonials with photo thumbnails 7) Behind The Lens: photographer bio, awards, publications 8) Booking Calendar: styled availability section 9) Package Pricing: 3 tiers with deliverables 10) Inquiry form CTA",
      fonts: "Cormorant Garamond for headings, Montserrat for body",
      accent: "Cinematic black/white/gold, film grain CSS texture, dramatic shadows"
    },
    "coaching institute": {
      colors: "#003366 (deep blue), #ff6b00 (energetic orange), #f8f9fa (light grey), #28a745 (success green), #ffffff",
      hero: "Bright motivational hero with CSS gradient, headline 'Your Success Starts Here' with batch enrollment CTA and free demo class offer",
      sections: "1) Hero with success stats (Students, Selections, Years, Batches) 2) Courses Offered: grid of 8-10 courses (IIT-JEE, NEET, UPSC, CAT, Bank PO, SSC, Class 10, Class 12, IELTS, Foundation) with batch dates 3) Why Join Us: 5 differentiators — Expert Faculty, Small Batches, Study Material, Mock Tests, Placement Support 4) Results/Selections: toppers section with ranks and photos (styled placeholders) 5) Faculty Profiles: 3-4 teacher cards with qualifications, experience 6) Fee Structure: 3 plans with EMI options 7) Student Testimonials: video testimonial style cards 8) Study Resources: test series, books, online portal features 9) Free Demo Class CTA: urgency-based enrollment 10) Center/Branch info",
      fonts: "Poppins for headings, Roboto for body",
      accent: "Academic achievement feel, trophy/star motifs, success-oriented colors"
    },
    "beauty salon": {
      colors: "#2d1b33 (deep plum), #e91e8c (rose pink), #f9f3fb (light lavender), #c9a0dc (soft purple), #f5e6c8 (champagne)",
      hero: "Glamorous hero with CSS shimmer/glitter animation, headline 'Where Beauty Meets Luxury' with 'Book Appointment' CTA and special offer banner",
      sections: "1) Glamorous hero with shimmer CSS animation, special offer 2) Services Menu: Hair (Cut, Color, Keratin, Extensions), Skin (Facial, Cleanup, Bleach), Nails (Manicure, Pedicure, Nail Art), Makeup (Bridal, Party, Everyday), Body (Waxing, Threading, Massage) — tabbed or grid 3) Signature Treatments: 4 premium services with price and duration 4) Our Stylists: 3 expert profiles with specializations 5) Before/After Gallery: CSS-styled transformation showcases 6) Product Brands: premium brands used (styled text badges) 7) Bridal Packages: wedding beauty packages with price 8) Client Reviews: 3 detailed testimonials 9) Loyalty Program: membership benefits section 10) Appointment booking CTA with WhatsApp",
      fonts: "Playfair Display for headings, Raleway for body",
      accent: "Feminine luxury, shimmer effects, rose-gold accents, elegant curves"
    }
  };

  const bp = blueprints[bizType] || blueprints["software agency"];

  const prompt = `You are a world-class web designer. Create a STUNNING, production-quality single-file HTML landing page for a ${bizType} called "${bizName}".
${bizDesc ? `Business details: ${bizDesc}` : ''}

DESIGN BLUEPRINT TO FOLLOW EXACTLY:
- Color palette: ${bp.colors}
- Hero section: ${bp.hero}
- Sections required: ${bp.sections}
- Typography: ${bp.fonts} (import from Google Fonts)
- Design accent: ${bp.accent}

MANDATORY QUALITY REQUIREMENTS — this must look like a $10,000 website:
1. HERO: Full-viewport height. Large bold headline. Atmospheric background using CSS gradients/pseudo-elements (no external images needed). Prominent CTA buttons. Visible phone number.
2. TYPOGRAPHY: Import the specified Google Fonts. Use dramatic size contrast (hero h1 minimum 3.5rem). Line heights and letter spacing must be refined.
3. COLORS: Use the exact color palette. CSS custom properties for consistency. Rich, deep backgrounds — NOT plain white. Multiple sections with alternating background colors.
4. CARDS: All service/feature cards must have: hover animations (transform + box-shadow), icons (use relevant emojis styled beautifully), and micro-interactions.
5. LAYOUT: CSS Grid and Flexbox. Asymmetric layouts where appropriate. Full-width sections alternating with contained content. No boring equal-column grids only.
6. ANIMATIONS: Entrance animations on scroll (use IntersectionObserver JS). Hover state animations on all interactive elements. Smooth transitions everywhere.
7. TRUST SIGNALS: Statistics/numbers section with large bold numbers. Testimonials with star ratings. Years of experience badge.
8. CTA BUTTONS: At least 4 prominent CTAs throughout the page. Primary (filled) and secondary (outline) button styles.
9. FLOATING WHATSAPP: Fixed bottom-right WhatsApp button linking to https://wa.me/919876543210 with pulse animation.
10. FOOTER: Dark footer with links, contact info, social media icons, copyright.
11. MOBILE RESPONSIVE: Complete CSS media queries. Hamburger menu for mobile.
12. STICKY NAV: Fixed navbar that changes style on scroll (add class with JS).
13. NO EXTERNAL IMAGES: Use CSS gradients, shapes, emoji, and creative CSS to simulate rich visual content. Make colored placeholder divs look intentional and beautiful.
14. RICH CONTENT: Fill with realistic, detailed content specific to ${bizType} in India. Real-sounding service names, prices in ₹, Indian context.

Output ONLY the complete HTML starting with <!DOCTYPE html>. No markdown fences, no explanation. Make it EXTRAORDINARY.`;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel environment variables.' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 8000,
        temperature: 0.85,
        messages: [
          {
            role: 'system',
            content: 'You are the world\'s best web designer and developer. You create jaw-dropping, conversion-optimized landing pages. You write complete, self-contained HTML files with inline CSS and JS. You never use placeholder text like "Lorem ipsum" — always write real, compelling, industry-specific content. Your output starts directly with <!DOCTYPE html> and contains no markdown.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error.' });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || '';
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    if (!html || html.length < 500) return res.status(500).json({ error: 'Response too short. Please try again.' });

    return res.status(200).json({ html });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
