export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { bizType, bizName, bizDesc } = req.body;
  if (!bizType || !bizName) return res.status(400).json({ error: 'Missing fields.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set.' });

  // Category-specific content presets
  const presets = {
    "dental clinic": {
      palette: { primary: "#0a2342", accent: "#1e7bb8", light: "#f0f7ff", highlight: "#2ecc71", text: "#1a1a2e", textLight: "#5a6a7a" },
      headline: "Your Perfect Smile Starts Here",
      subheadline: "Advanced Painless Dentistry with a Personal Touch",
      tagline: "15+ Years of Trusted Dental Care",
      services: ["Dental Implants","Teeth Whitening","Invisible Braces","Root Canal","Dental Crowns","Cosmetic Dentistry","Pediatric Dentistry","Gum Treatment"],
      stats: [["5000+","Happy Patients"],["15+","Years Experience"],["98%","Success Rate"],["24hr","Emergency Care"]],
      whyUs: [["🦷","Painless Treatment","Advanced sedation techniques ensure a completely comfortable experience"],["🔬","Latest Technology","CBCT 3D imaging, laser dentistry, and digital X-rays for precision care"],["👨‍⚕️","Expert Doctors","BDS & MDS qualified specialists with decades of combined experience"],["💳","Flexible EMI","No-cost EMI options starting ₹999/month. All insurance accepted"]],
      testimonials: [["Rahul Sharma","Dental Implants","⭐⭐⭐⭐⭐","The implants look and feel completely natural. Best decision of my life!"],["Priya Nair","Teeth Whitening","⭐⭐⭐⭐⭐","My teeth are 8 shades whiter in just one session. Absolutely magical results!"],["Arjun Das","Braces Treatment","⭐⭐⭐⭐⭐","Professional team, painless process. My confidence has completely transformed."]],
      cta: "Book Free Consultation",
      phone: "+91 98765 43210",
      offer: "🎁 FREE Dental Check-up + X-Ray worth ₹800 — This Month Only!"
    },
    "law firm": {
      palette: { primary: "#0f1923", accent: "#c9a84c", light: "#f5f3ee", highlight: "#c9a84c", text: "#1a1a2e", textLight: "#6b7280" },
      headline: "Justice. Integrity. Results.",
      subheadline: "India's Most Trusted Legal Counsel for Over Two Decades",
      tagline: "Fighting for your rights since 2003",
      services: ["Criminal Defense","Civil Litigation","Family Law & Divorce","Corporate Law","Property Disputes","Consumer Cases","Labour Law","High Court Matters"],
      stats: [["2000+","Cases Won"],["20+","Years Practice"],["500+","Corporate Clients"],["24/7","Legal Support"]],
      whyUs: [["⚖️","Proven Track Record","Over 2000 successful cases across High Courts and Supreme Court of India"],["🏛️","Expert Legal Team","Senior advocates with specialized expertise across all branches of law"],["🤝","Client-First Approach","Transparent communication, regular updates, and honest legal advice always"],["📞","24/7 Availability","Emergency legal assistance available round the clock. We're always there."]],
      testimonials: [["Vikram Mehta","Property Dispute","⭐⭐⭐⭐⭐","Won a 5-year property case in just 8 months. Outstanding legal strategy!"],["Sunita Rao","Divorce Settlement","⭐⭐⭐⭐⭐","Compassionate, professional, and thorough. Got the best possible outcome."],["TechCorp Ltd","Corporate Matter","⭐⭐⭐⭐⭐","Their corporate legal team saved us ₹2 crore in a contract dispute. Exceptional!"]],
      cta: "Get Free Consultation",
      phone: "+91 98765 43210",
      offer: "⚖️ FREE 30-Minute Legal Consultation — No Obligation, Complete Confidentiality"
    },
    "fitness coach": {
      palette: { primary: "#0d0d0d", accent: "#ff3d00", light: "#1a1a1a", highlight: "#ffd700", text: "#f5f5f5", textLight: "#aaaaaa" },
      headline: "Transform Your Body. Transform Your Life.",
      subheadline: "Science-Based Fitness Coaching That Delivers Real Results",
      tagline: "500+ transformations and counting",
      services: ["Personal Training","Weight Loss Program","Muscle Building","HIIT & Cardio","Nutrition Planning","Online Coaching","Group Classes","Athletic Performance"],
      stats: [["500+","Transformations"],["10+","Years Coaching"],["95%","Client Success"],["50+","Weekly Classes"]],
      whyUs: [["🔥","Proven Programs","Customized training plans backed by sports science and nutrition research"],["📊","Progress Tracking","Weekly body composition analysis, fitness assessments, and goal adjustments"],["🥗","Nutrition Guidance","Personalized meal plans, macro tracking, and supplement guidance included"],["💪","Certified Expertise","NSCA, ACE, and ISSA certified coaches with competition experience"]],
      testimonials: [["Ananya Singh","Weight Loss","⭐⭐⭐⭐⭐","Lost 18kg in 4 months! The nutrition plan + training combo is unbeatable."],["Rohit Kumar","Muscle Gain","⭐⭐⭐⭐⭐","Gained 8kg of lean muscle in 3 months. The results speak for themselves!"],["Meera Patel","Overall Fitness","⭐⭐⭐⭐⭐","From barely walking to running a 10K. This coach changed my entire life."]],
      cta: "Start Free Trial",
      phone: "+91 98765 43210",
      offer: "🔥 FREE 7-Day Trial + Body Composition Analysis worth ₹2000!"
    },
    "restaurant": {
      palette: { primary: "#1a0a00", accent: "#d4a017", light: "#fdf6ec", highlight: "#e05c2a", text: "#2d1500", textLight: "#7a6050" },
      headline: "Where Every Bite Tells a Story",
      subheadline: "Authentic Flavours, Unforgettable Dining Experiences",
      tagline: "Serving happiness since 2010",
      services: ["Fine Dining","Family Meals","Catering Services","Private Events","Corporate Lunch","Birthday Packages","Live Kitchen","Home Delivery"],
      stats: [["50000+","Guests Served"],["14+","Years of Excellence"],["4.9★","Google Rating"],["200+","Menu Items"]],
      whyUs: [["👨‍🍳","Master Chefs","Award-winning chefs trained in 5-star hotels across India and abroad"],["🌿","Fresh Ingredients","Farm-to-table philosophy with locally sourced organic produce daily"],["🏆","Award Winning","Best Restaurant award by Times Food Guide 3 years in a row"],["🎉","Private Events","Fully customizable private dining for up to 200 guests with dedicated host"]],
      testimonials: [["Deepa Krishnan","Anniversary Dinner","⭐⭐⭐⭐⭐","The ambiance, food, and service were absolutely magical. A night to remember!"],["Suresh Iyer","Corporate Event","⭐⭐⭐⭐⭐","Hosted our company dinner here. Every single guest was thoroughly impressed!"],["Neha Gupta","Birthday Party","⭐⭐⭐⭐⭐","The birthday cake and personalised menu were beyond our expectations. Fantastic!"]],
      cta: "Reserve a Table",
      phone: "+91 98765 43210",
      offer: "🍽️ Book a Table Today & Get Complimentary Dessert for the Table!"
    },
    "software agency": {
      palette: { primary: "#050510", accent: "#6c63ff", light: "#0d0d1a", highlight: "#00d4ff", text: "#f0f0ff", textLight: "#8888aa" },
      headline: "We Build Software That Scales",
      subheadline: "Full-Stack Development, AI Solutions & Digital Transformation",
      tagline: "Trusted by 200+ companies worldwide",
      services: ["Web Development","Mobile Apps","AI & ML Solutions","Cloud DevOps","UI/UX Design","API Development","E-Commerce","SaaS Products"],
      stats: [["200+","Projects Delivered"],["8+","Years Experience"],["50+","Tech Experts"],["98%","Client Retention"]],
      whyUs: [["🚀","Agile Delivery","2-week sprints with daily standups, transparent progress, and on-time delivery guaranteed"],["🔒","Enterprise Security","ISO 27001 compliant development with end-to-end encryption and security audits"],["📱","Cross-Platform","React, Flutter, Node.js, Python, AWS — we master every modern tech stack"],["🤖","AI-First Approach","Integrating GPT-4, computer vision, and ML models into real business applications"]],
      testimonials: [["Kiran Patel, CTO","SaaS Platform","⭐⭐⭐⭐⭐","Delivered a complex SaaS product in 3 months. Code quality is outstanding!"],["Riya Shah, CEO","Mobile App","⭐⭐⭐⭐⭐","Our app hit 100K downloads in the first month. Brilliant UX and rock-solid backend!"],["Dev Sharma, Founder","E-Commerce","⭐⭐⭐⭐⭐","Sales increased 400% after their redesign. Best tech investment we ever made."]],
      cta: "Get Free Estimate",
      phone: "+91 98765 43210",
      offer: "💻 FREE Technical Consultation + Project Roadmap worth ₹10,000!"
    },
    "real estate agency": {
      palette: { primary: "#0d1b2a", accent: "#c5a028", light: "#f5f0e8", highlight: "#1b4332", text: "#0d1b2a", textLight: "#5a6a7a" },
      headline: "Find Your Dream Home",
      subheadline: "Premium Properties, Trusted Guidance, Lifetime Investment",
      tagline: "₹500 Crore+ worth of properties sold",
      services: ["Residential Sales","Commercial Properties","Rental Management","Property Valuation","Investment Advisory","NRI Services","New Projects","Resale Properties"],
      stats: [["1500+","Properties Sold"],["18+","Years Experience"],["₹500Cr+","Deals Closed"],["5000+","Happy Families"]],
      whyUs: [["🏠","Exclusive Listings","Access to pre-launch and off-market properties before they hit the market"],["📊","Market Intelligence","Real-time price analytics, area growth trends, and investment ROI projections"],["🤝","End-to-End Support","Legal verification, home loans, interior design, and moving assistance included"],["🏆","Award-Winning","Best Real Estate Agency award by CREDAI Bengal for 3 consecutive years"]],
      testimonials: [["Amit Banerjee","3BHK in Newtown","⭐⭐⭐⭐⭐","Found our perfect home in just 2 weeks. The team handled everything seamlessly!"],["Shreya Chatterjee","Commercial Office","⭐⭐⭐⭐⭐","Got 18% ROI on our commercial investment in the first year. Brilliant advice!"],["NRI Client, Dubai","Investment Property","⭐⭐⭐⭐⭐","Handled everything remotely. Transparent process, no surprises. Highly trusted!"]],
      cta: "Schedule Free Visit",
      phone: "+91 98765 43210",
      offer: "🏠 FREE Property Valuation + Investment Advisory Session — Limited Slots!"
    },
    "yoga studio": {
      palette: { primary: "#1a2e1a", accent: "#8b6914", light: "#f5f0eb", highlight: "#7c9885", text: "#1a2e1a", textLight: "#5a6a5a" },
      headline: "Find Your Inner Peace",
      subheadline: "Holistic Yoga & Wellness for Mind, Body and Soul",
      tagline: "Transforming lives through yoga since 2012",
      services: ["Hatha Yoga","Vinyasa Flow","Yin Yoga","Hot Yoga","Prenatal Yoga","Kids Yoga","Meditation","Sound Healing"],
      stats: [["2000+","Students Trained"],["12+","Years Teaching"],["20+","Weekly Classes"],["8","Expert Instructors"]],
      whyUs: [["🧘","Certified Instructors","RYT-500 certified teachers trained in Rishikesh with 10+ years experience"],["🌿","Holistic Approach","Yoga, pranayama, meditation, Ayurveda nutrition and lifestyle coaching combined"],["🏛️","Premium Studio","AC studio with natural lighting, premium mats, props, and spa-like changing rooms"],["👨‍👩‍👧","All Levels Welcome","Separate beginner, intermediate, and advanced batches. Personal attention guaranteed"]],
      testimonials: [["Pooja Menon","6 Months Student","⭐⭐⭐⭐⭐","Chronic back pain gone in 2 months of practice. This studio literally healed me!"],["Rajesh Nair","Meditation Course","⭐⭐⭐⭐⭐","My anxiety levels dropped by 80%. The mindfulness techniques are life-changing."],["Kavitha Rao","Prenatal Yoga","⭐⭐⭐⭐⭐","The gentlest, most supportive prenatal classes. Had the most peaceful pregnancy!"]],
      cta: "Book Free Trial Class",
      phone: "+91 98765 43210",
      offer: "🧘 FREE First Class + Yoga Starter Kit worth ₹1500 for New Students!"
    },
    "photography studio": {
      palette: { primary: "#0d0d0d", accent: "#c9a84c", light: "#f5f5f5", highlight: "#c9a84c", text: "#1a1a1a", textLight: "#666666" },
      headline: "Moments Captured Forever",
      subheadline: "Where Art Meets Emotion — Premium Photography for Every Occasion",
      tagline: "10,000+ moments beautifully preserved",
      services: ["Wedding Photography","Portrait Sessions","Corporate Photography","Product Photography","Fashion Shoots","Newborn & Baby","Event Coverage","Album Design"],
      stats: [["1000+","Weddings Shot"],["10+","Years Experience"],["50K+","Photos Delivered"],["4.9★","Average Rating"]],
      whyUs: [["📸","Award-Winning","Featured in Vogue India, Times Wedding, and National Geographic Travel edition"],["🎬","Cinema-Grade Gear","Sony A1, Canon R5, Leica cameras with professional cinema lighting setups"],["🎨","Artistic Vision","Each photo is a work of art — we don't just document, we create visual poetry"],["💾","Quick Delivery","Edited photos delivered within 7 days. Wedding albums within 30 days, guaranteed"]],
      testimonials: [["Sneha & Arjun","Wedding","⭐⭐⭐⭐⭐","Every single photo looks like it's from a Bollywood film. Pure magic!"],["L'Oreal India","Product Shoot","⭐⭐⭐⭐⭐","Our most successful product campaign yet. The photography elevated our brand 10x!"],["Tata Consultancy","Corporate Event","⭐⭐⭐⭐⭐","Professional, unobtrusive, and the results were stunning. Will always use them!"]],
      cta: "Book Your Session",
      phone: "+91 98765 43210",
      offer: "📸 FREE Pre-Wedding Shoot worth ₹15,000 with Every Wedding Package!"
    },
    "coaching institute": {
      palette: { primary: "#003366", accent: "#ff6b00", light: "#f0f4ff", highlight: "#28a745", text: "#001a33", textLight: "#4a6a8a" },
      headline: "Your Success Story Starts Here",
      subheadline: "Expert Coaching for IIT-JEE, NEET, UPSC & All Competitive Exams",
      tagline: "5000+ students selected in top institutions",
      services: ["IIT-JEE Preparation","NEET Coaching","UPSC Foundation","CAT & MBA","Class 10 & 12","IELTS & TOEFL","Bank PO & SSC","Foundation Course"],
      stats: [["5000+","Selections Made"],["15+","Years Excellence"],["200+","Expert Faculty"],["95%","Success Rate"]],
      whyUs: [["📚","Expert Faculty","IIT/IIM alumni and retired IAS/IPS officers as guest faculty for real-world insights"],["📊","Smart Study System","AI-powered doubt clearing, adaptive tests, and personalized weekly progress reports"],["🏆","Proven Results","AIR 1 in NEET 2023, 3 IIT top-50 ranks, and 47 IAS selections in last 5 years"],["💰","Affordable Fees","Scholarships up to 90% for merit students. Easy EMI. No student left behind."]],
      testimonials: [["Aryan Gupta, AIR 47","IIT-JEE","⭐⭐⭐⭐⭐","The faculty here are exceptional. They teach concepts, not just formulas. Dream come true!"],["Priya Sharma, MBBS","NEET 2023","⭐⭐⭐⭐⭐","Scored 680/720 in NEET! The mock test series was exactly like the real exam."],["IAS Rohit Verma","UPSC 2022","⭐⭐⭐⭐⭐","The mentorship program is unmatched. Cleared UPSC in my first attempt thanks to them!"]],
      cta: "Enroll Now",
      phone: "+91 98765 43210",
      offer: "🎓 FREE Demo Class + Scholarship Test — Win Up to 90% Fee Waiver!"
    },
    "beauty salon": {
      palette: { primary: "#2d1b33", accent: "#e91e8c", light: "#fdf5ff", highlight: "#c9a0dc", text: "#2d1b33", textLight: "#7a5a8a" },
      headline: "Where Beauty Meets Luxury",
      subheadline: "Premium Salon Experiences That Leave You Glowing",
      tagline: "Kolkata's most loved luxury salon",
      services: ["Bridal Makeup","Hair Styling & Color","Keratin Treatment","Skin Facials","Nail Art & Extensions","Body Waxing","Eyebrow Threading","Spa & Massage"],
      stats: [["10000+","Happy Clients"],["8+","Years Excellence"],["50+","Beauty Experts"],["4.9★","Rated on Google"]],
      whyUs: [["💄","Master Artists","Celebrity makeup artists trained at VLCC, Shahnaz Husain, and L'Oreal Academy"],["✨","Premium Products","100% authentic MAC, Kérastase, Schwarzkopf, and Forest Essentials products only"],["👰","Bridal Specialists","600+ brides transformed. Dedicated bridal suite with HD lighting and trial sessions"],["🌸","Hygiene First","Hospital-grade sterilization, disposable tools, and allergen-tested products guaranteed"]],
      testimonials: [["Ritika Singh","Bridal Makeup","⭐⭐⭐⭐⭐","Looked like an absolute queen on my wedding day! Every guest complimented my look."],["Tanvi Ghosh","Keratin Treatment","⭐⭐⭐⭐⭐","My frizzy hair is now silky smooth for the first time in my life. Absolutely love it!"],["Monika Roy","Nail Art","⭐⭐⭐⭐⭐","The nail designs are absolutely stunning. People keep asking where I got them done!"]],
      cta: "Book Appointment",
      phone: "+91 98765 43210",
      offer: "💅 20% OFF on All Services for First-Time Visitors — Book Today!"
    }
  };

  const p = presets[bizType] || presets["software agency"];

  // Build the complete HTML server-side — guaranteed structure, zero blank sections
  const html = buildPage(bizName, bizType, bizDesc, p);
  return res.status(200).json({ html });
}

function buildPage(name, type, desc, p) {
  const servicesHTML = p.services.map((s,i) => `
    <div class="service-card" style="animation-delay:${i*0.08}s">
      <div class="service-icon">${getIcon(s)}</div>
      <h3>${s}</h3>
      <p>${getServiceDesc(s, type)}</p>
      <a href="#contact" class="service-link">Learn More →</a>
    </div>`).join('');

  const statsHTML = p.stats.map(([n,l]) => `
    <div class="stat-item">
      <div class="stat-num">${n}</div>
      <div class="stat-label">${l}</div>
    </div>`).join('');

  const whyHTML = p.whyUs.map(([icon,title,desc]) => `
    <div class="why-card">
      <div class="why-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>`).join('');

  const testiHTML = p.testimonials.map(([name,service,stars,quote]) => `
    <div class="testi-card">
      <div class="testi-stars">${stars}</div>
      <p class="testi-quote">"${quote}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${name.charAt(0)}</div>
        <div>
          <div class="testi-name">${name}</div>
          <div class="testi-service">${service}</div>
        </div>
      </div>
    </div>`).join('');

  const isDark = ['#0d0d0d','#050510','#0f1923','#0d0d0d'].includes(p.palette.primary);
  const navTextColor = isDark ? '#ffffff' : (p.palette.primary === '#003366' ? '#ffffff' : p.palette.primary === '#0d1b2a' ? '#f5f0e8' : p.palette.primary === '#1a0a00' ? '#fdf6ec' : p.palette.primary === '#2d1b33' ? '#ffffff' : p.palette.primary === '#1a2e1a' ? '#ffffff' : '#ffffff');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} — ${capitalize(type)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:${p.palette.light};color:${p.palette.text};overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 5%;height:70px;display:flex;align-items:center;justify-content:space-between;background:${p.palette.primary};transition:all .3s}
nav.scrolled{box-shadow:0 4px 30px rgba(0,0,0,.25)}
.nav-brand{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:${p.palette.accent};white-space:nowrap}
.nav-links{display:flex;align-items:center;gap:8px;list-style:none}
.nav-links a{color:rgba(255,255,255,.85);text-decoration:none;font-size:.88rem;font-weight:500;padding:7px 14px;border-radius:6px;transition:all .2s;white-space:nowrap}
.nav-links a:hover{background:rgba(255,255,255,.12);color:#fff}
.nav-cta-btn{background:${p.palette.accent};color:${isDark || p.palette.primary.includes('0a2342') || p.palette.primary.includes('003366') || p.palette.primary.includes('0d1b2a') || p.palette.primary.includes('0f1923') || p.palette.primary.includes('1a0a00') || p.palette.primary.includes('1a2e1a') || p.palette.primary.includes('2d1b33') ? '#fff' : p.palette.primary}!important;padding:9px 22px!important;border-radius:8px!important;font-weight:600!important;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:.88rem;text-decoration:none;transition:all .2s!important}
.nav-cta-btn:hover{opacity:.9;transform:translateY(-1px)!important;background:${p.palette.accent}!important}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:5px;background:none;border:none}
.hamburger span{width:22px;height:2px;background:#fff;border-radius:2px;transition:.3s}
.mobile-menu{display:none;position:fixed;top:70px;left:0;right:0;background:${p.palette.primary};padding:20px 5%;flex-direction:column;gap:4px;z-index:999;border-top:1px solid rgba(255,255,255,.1)}
.mobile-menu.open{display:flex}
.mobile-menu a{color:rgba(255,255,255,.85);text-decoration:none;font-size:1rem;padding:12px 16px;border-radius:8px}
.mobile-menu a:hover{background:rgba(255,255,255,.1)}

/* OFFER BANNER */
.offer-banner{background:${p.palette.accent};color:${p.palette.primary};text-align:center;padding:10px 20px;font-size:.85rem;font-weight:600;position:relative;z-index:999;margin-top:70px}

/* HERO */
.hero{min-height:92vh;background:linear-gradient(135deg, ${p.palette.primary} 0%, ${adjustColor(p.palette.primary)} 60%, ${p.palette.accent}22 100%);display:flex;align-items:center;padding:60px 5% 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-50%;right:-10%;width:700px;height:700px;background:radial-gradient(circle, ${p.palette.accent}20 0%, transparent 65%);border-radius:50%;animation:pulse 6s ease-in-out infinite}
.hero::after{content:'';position:absolute;bottom:-20%;left:-5%;width:500px;height:500px;background:radial-gradient(circle, ${p.palette.highlight}15 0%, transparent 65%);border-radius:50%;animation:pulse 8s ease-in-out 2s infinite}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.15);opacity:1}}
.hero-content{max-width:650px;position:relative;z-index:1}
.hero-tag{display:inline-flex;align-items:center;gap:8px;background:${p.palette.accent}25;border:1px solid ${p.palette.accent}50;color:${p.palette.accent};padding:7px 18px;border-radius:50px;font-size:.8rem;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:24px}
.hero-tag::before{content:'●';animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,5.5vw,4.5rem);font-weight:900;line-height:1.1;letter-spacing:-1px;color:#fff;margin-bottom:20px}
.hero h1 span{color:${p.palette.accent}}
.hero-sub{font-size:1.15rem;color:rgba(255,255,255,.75);line-height:1.75;margin-bottom:14px;max-width:540px}
.hero-desc{font-size:.95rem;color:rgba(255,255,255,.55);margin-bottom:36px;max-width:480px}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:48px}
.btn-primary{background:${p.palette.accent};color:${p.palette.primary === '#0d0d0d' || p.palette.primary === '#0f1923' || p.palette.primary === '#050510' ? '#fff' : p.palette.primary};padding:15px 34px;border-radius:10px;font-size:1rem;font-weight:700;border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .25s;box-shadow:0 8px 32px ${p.palette.accent}50;font-family:'Inter',sans-serif}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 12px 40px ${p.palette.accent}70}
.btn-secondary{background:transparent;color:#fff;padding:15px 34px;border-radius:10px;font-size:1rem;font-weight:600;border:2px solid rgba(255,255,255,.35);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .25s;font-family:'Inter',sans-serif}
.btn-secondary:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.6);transform:translateY(-3px)}
.hero-phone{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.7);font-size:.95rem}
.hero-phone strong{color:#fff;font-size:1.1rem}

/* STATS BAR */
.stats-bar{background:${p.palette.primary};padding:40px 5%;display:flex;justify-content:center;gap:0}
.stat-item{text-align:center;padding:0 40px;border-right:1px solid rgba(255,255,255,.15);flex:1;max-width:220px}
.stat-item:last-child{border-right:none}
.stat-num{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:900;color:${p.palette.accent};line-height:1}
.stat-label{font-size:.82rem;color:rgba(255,255,255,.6);margin-top:6px;font-weight:500;text-transform:uppercase;letter-spacing:.5px}

/* SERVICES */
.services{padding:90px 5%;background:${p.palette.light}}
.section-header{text-align:center;margin-bottom:56px}
.section-tag{display:inline-block;background:${p.palette.accent}18;color:${p.palette.accent};padding:5px 16px;border-radius:50px;font-size:.75rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;border:1px solid ${p.palette.accent}30}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(2rem,3.5vw,2.8rem);font-weight:900;color:${p.palette.text};letter-spacing:-.5px;line-height:1.2;margin-bottom:14px}
.section-title span{color:${p.palette.accent}}
.section-sub{font-size:1rem;color:${p.palette.textLight};max-width:560px;margin:0 auto;line-height:1.75}
.services-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;max-width:1300px;margin:0 auto}
.service-card{background:#fff;border-radius:16px;padding:28px 24px;border:1px solid ${p.palette.accent}18;transition:all .3s;position:relative;overflow:hidden;opacity:0;transform:translateY(24px)}
.service-card.visible{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,box-shadow .3s}
.service-card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${p.palette.accent},${p.palette.highlight});transform:scaleX(0);transform-origin:left;transition:transform .3s}
.service-card:hover{transform:translateY(-6px)!important;box-shadow:0 20px 60px ${p.palette.accent}20}
.service-card:hover::before{transform:scaleX(1)}
.service-icon{font-size:2rem;margin-bottom:16px;display:block}
.service-card h3{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;margin-bottom:10px;color:${p.palette.text}}
.service-card p{font-size:.83rem;color:${p.palette.textLight};line-height:1.65}
.service-link{display:inline-block;margin-top:14px;color:${p.palette.accent};font-size:.82rem;font-weight:600;text-decoration:none;transition:gap .2s}
.service-link:hover{letter-spacing:.5px}

/* WHY US */
.why-section{padding:90px 5%;background:${p.palette.primary};position:relative;overflow:hidden}
.why-section::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse 70% 70% at 80% 50%, ${p.palette.accent}12 0%, transparent 60%)}
.why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;max-width:1300px;margin:0 auto;position:relative;z-index:1}
.why-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:32px 26px;transition:all .3s;backdrop-filter:blur(10px);opacity:0;transform:translateY(24px)}
.why-card.visible{opacity:1;transform:translateY(0);transition:opacity .6s ease,transform .6s ease,background .3s}
.why-card:hover{background:rgba(255,255,255,.1);transform:translateY(-4px)!important;border-color:${p.palette.accent}50}
.why-icon{font-size:2.2rem;margin-bottom:18px;display:block}
.why-card h3{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:10px}
.why-card p{font-size:.85rem;color:rgba(255,255,255,.6);line-height:1.7}
.why-section .section-title{color:#fff}
.why-section .section-sub{color:rgba(255,255,255,.55)}

/* TESTIMONIALS */
.testi-section{padding:90px 5%;background:${p.palette.light}}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1300px;margin:0 auto}
.testi-card{background:#fff;border-radius:18px;padding:32px;border:1px solid ${p.palette.accent}15;transition:all .3s;opacity:0;transform:translateY(24px)}
.testi-card.visible{opacity:1;transform:translateY(0)}
.testi-card:hover{transform:translateY(-4px)!important;box-shadow:0 16px 48px ${p.palette.accent}18}
.testi-stars{font-size:1.1rem;letter-spacing:2px;margin-bottom:16px;color:#f59e0b}
.testi-quote{font-size:.93rem;color:${p.palette.textLight};line-height:1.8;margin-bottom:22px;font-style:italic;position:relative;padding-left:20px}
.testi-quote::before{content:'"';position:absolute;left:0;top:-4px;font-size:2rem;color:${p.palette.accent};font-family:'Playfair Display',serif;line-height:1}
.testi-author{display:flex;align-items:center;gap:14px}
.testi-avatar{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,${p.palette.accent},${p.palette.highlight});display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;color:#fff;flex-shrink:0}
.testi-name{font-weight:700;font-size:.9rem;color:${p.palette.text}}
.testi-service{font-size:.78rem;color:${p.palette.accent};font-weight:600;margin-top:2px}

/* CTA SECTION */
.cta-section{background:linear-gradient(135deg,${p.palette.primary} 0%,${adjustColor(p.palette.primary)} 100%);padding:90px 5%;text-align:center;position:relative;overflow:hidden}
.cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,${p.palette.accent}18 0%,transparent 65%)}
.cta-section h2{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:#fff;margin-bottom:16px;position:relative;z-index:1}
.cta-section p{color:rgba(255,255,255,.65);font-size:1rem;max-width:500px;margin:0 auto 40px;line-height:1.75;position:relative;z-index:1}
.cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}

/* FOOTER */
footer{background:${p.palette.primary === '#f5f0eb' || p.palette.primary === '#f0f7ff' ? '#1a1a2e' : p.palette.primary};padding:50px 5% 30px;border-top:1px solid rgba(255,255,255,.08)}
.footer-inner{max-width:1300px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:40px}
.footer-brand{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:${p.palette.accent};margin-bottom:12px}
.footer-desc{font-size:.85rem;color:rgba(255,255,255,.45);line-height:1.75}
.footer-title{font-size:.78rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:10px}
.footer-links a{color:rgba(255,255,255,.6);text-decoration:none;font-size:.85rem;transition:color .2s}
.footer-links a:hover{color:${p.palette.accent}}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-copy{font-size:.78rem;color:rgba(255,255,255,.3)}

/* WHATSAPP */
.wa-fab{position:fixed;bottom:28px;right:28px;z-index:1100;width:58px;height:58px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 6px 24px rgba(37,211,102,.5);animation:waPulse 2.5s infinite}
.wa-fab:hover{transform:scale(1.1)}
.wa-fab svg{width:28px;height:28px;fill:white}
@keyframes waPulse{0%,100%{box-shadow:0 6px 24px rgba(37,211,102,.5)}50%{box-shadow:0 6px 36px rgba(37,211,102,.8)}}

/* RESPONSIVE */
@media(max-width:1024px){.services-grid{grid-template-columns:repeat(2,1fr)}.why-grid{grid-template-columns:repeat(2,1fr)}.stats-bar{flex-wrap:wrap}.stat-item{border-right:none;border-bottom:1px solid rgba(255,255,255,.1);padding:20px}.footer-inner{grid-template-columns:1fr 1fr}}
@media(max-width:768px){.nav-links{display:none}.hamburger{display:flex}.hero{padding:40px 5% 60px;min-height:auto}.hero h1{font-size:2.5rem}.services-grid{grid-template-columns:1fr}.why-grid{grid-template-columns:1fr}.testi-grid{grid-template-columns:1fr}.footer-inner{grid-template-columns:1fr}.cta-btns{flex-direction:column;align-items:center}.hero-btns{flex-direction:column}.stats-bar{display:grid;grid-template-columns:1fr 1fr}}
</style>
</head>
<body>

<nav id="mainNav">
  <div class="nav-brand">${name}</div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#why-us">Why Us</a></li>
    <li><a href="#testimonials">Reviews</a></li>
    <li><a href="#contact">${p.cta}</a></li>
    <li><a href="tel:${p.phone.replace(/\s+/g,'')}" class="nav-cta-btn">${p.phone}</a></li>
  </ul>
  <button class="hamburger" onclick="toggleMobileMenu()"><span></span><span></span><span></span></button>
</nav>

<div class="mobile-menu" id="mobileMenu">
  <a href="#services" onclick="closeMobileMenu()">Services</a>
  <a href="#why-us" onclick="closeMobileMenu()">Why Choose Us</a>
  <a href="#testimonials" onclick="closeMobileMenu()">Client Reviews</a>
  <a href="#contact" onclick="closeMobileMenu()" style="color:${p.palette.accent};font-weight:700">${p.cta}</a>
  <a href="tel:${p.phone.replace(/\s+/g,'')}" style="color:${p.palette.accent};font-weight:700">${p.phone}</a>
</div>

<div class="offer-banner">${p.offer}</div>

<section class="hero">
  <div class="hero-content">
    <div class="hero-tag">${p.tagline}</div>
    <h1>${p.headline.includes('.') ? p.headline.replace(/\./g, '.<br>').replace(/<br>$/, '') : p.headline} <span>${name}</span></h1>
    <p class="hero-sub">${p.subheadline}</p>
    <p class="hero-desc">${desc || 'Serving our community with excellence, dedication, and unmatched expertise. Your satisfaction is our highest priority.'}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-primary">📅 ${p.cta}</a>
      <a href="tel:${p.phone.replace(/\s+/g,'')}" class="btn-secondary">📞 Call Now</a>
    </div>
    <div class="hero-phone">
      <span>📱</span>
      <span>Talk to us directly: <strong>${p.phone}</strong></span>
    </div>
  </div>
</section>

<div class="stats-bar">
  ${statsHTML}
</div>

<section class="services" id="services">
  <div class="section-header">
    <div class="section-tag">Our Services</div>
    <h2 class="section-title">Everything You Need,<br><span>All in One Place</span></h2>
    <p class="section-sub">Comprehensive solutions tailored to your needs with the highest standards of quality and expertise.</p>
  </div>
  <div class="services-grid">${servicesHTML}</div>
</section>

<section class="why-section" id="why-us">
  <div class="section-header">
    <div class="section-tag" style="background:rgba(255,255,255,.12);color:${p.palette.accent};border-color:rgba(255,255,255,.2)">Why Choose Us</div>
    <h2 class="section-title">The ${name} <span style="color:${p.palette.accent}">Difference</span></h2>
    <p class="section-sub">We don't just promise — we deliver. Here's what sets us apart from everyone else.</p>
  </div>
  <div class="why-grid">${whyHTML}</div>
</section>

<section class="testi-section" id="testimonials">
  <div class="section-header">
    <div class="section-tag">Client Reviews</div>
    <h2 class="section-title">What Our <span>Clients Say</span></h2>
    <p class="section-sub">Real stories from real people whose lives we've had the privilege of impacting.</p>
  </div>
  <div class="testi-grid">${testiHTML}</div>
</section>

<section class="cta-section" id="contact">
  <h2>Ready to Get Started?</h2>
  <p>Join thousands of satisfied clients who chose ${name}. Take the first step today — it's completely free.</p>
  <div class="cta-btns">
    <a href="https://wa.me/919876543210?text=Hi! I want to book an appointment with ${encodeURIComponent(name)}" class="btn-primary" target="_blank">💬 WhatsApp Us Now</a>
    <a href="tel:${p.phone.replace(/\s+/g,'')}" class="btn-secondary">📞 ${p.phone}</a>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-brand">${name}</div>
      <p class="footer-desc">${p.subheadline}. Trusted by thousands across India for exceptional ${type} services.</p>
    </div>
    <div>
      <div class="footer-title">Services</div>
      <ul class="footer-links">
        ${p.services.slice(0,4).map(s => `<li><a href="#services">${s}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <div class="footer-title">Contact</div>
      <ul class="footer-links">
        <li><a href="tel:${p.phone.replace(/\s+/g,'')}">${p.phone}</a></li>
        <li><a href="https://wa.me/919876543210" target="_blank">WhatsApp</a></li>
        <li><a href="#services">Our Services</a></li>
        <li><a href="#why-us">About Us</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">© ${new Date().getFullYear()} ${name}. All rights reserved.</div>
    <div class="footer-copy">Built with WebClaw</div>
  </div>
</footer>

<a class="wa-fab" href="https://wa.me/919876543210?text=Hi! I want to know more about ${encodeURIComponent(name)}" target="_blank" aria-label="WhatsApp">
  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>

<script>
window.addEventListener('scroll',()=>{
  document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>20);
});
function toggleMobileMenu(){document.getElementById('mobileMenu').classList.toggle('open')}
function closeMobileMenu(){document.getElementById('mobileMenu').classList.remove('open')}
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
},{threshold:0.1});
document.querySelectorAll('.service-card,.why-card,.testi-card').forEach(el=>observer.observe(el));
</script>
</body>
</html>`;
}

function adjustColor(hex) {
  // Darken/shift color slightly for gradient
  const shifts = {
    '#0a2342':'#0d2d56','#0f1923':'#152535','#050510':'#0a0a20',
    '#0d0d0d':'#1a0505','#1a0a00':'#2d1200','#003366':'#004488',
    '#0d1b2a':'#102236','#1a2e1a':'#0d1f0d','#2d1b33':'#3d2045',
    '#1a1a2e':'#252540'
  };
  return shifts[hex] || hex;
}

function capitalize(str){return str.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}

function getIcon(service){
  const icons={'Dental Implants':'🦷','Teeth Whitening':'✨','Invisible Braces':'😁','Root Canal':'🔬','Dental Crowns':'👑','Cosmetic Dentistry':'💎','Pediatric Dentistry':'👶','Gum Treatment':'🏥','Criminal Defense':'⚖️','Civil Litigation':'🏛️','Family Law & Divorce':'👨‍👩‍👧','Corporate Law':'🏢','Property Disputes':'🏠','Consumer Cases':'📋','Labour Law':'👷','High Court Matters':'🔨','Personal Training':'💪','Weight Loss Program':'🎯','Muscle Building':'🏋️','HIIT & Cardio':'🔥','Nutrition Planning':'🥗','Online Coaching':'💻','Group Classes':'👥','Athletic Performance':'🏆','Fine Dining':'🍽️','Family Meals':'👨‍👩‍👧','Catering Services':'🎪','Private Events':'🎉','Corporate Lunch':'💼','Birthday Packages':'🎂','Live Kitchen':'👨‍🍳','Home Delivery':'🛵','Web Development':'🌐','Mobile Apps':'📱','AI & ML Solutions':'🤖','Cloud DevOps':'☁️','UI/UX Design':'🎨','API Development':'🔌','E-Commerce':'🛒','SaaS Products':'🚀','Residential Sales':'🏡','Commercial Properties':'🏢','Rental Management':'🔑','Property Valuation':'📊','Investment Advisory':'💰','NRI Services':'✈️','New Projects':'🏗️','Resale Properties':'🔄','Hatha Yoga':'🧘','Vinyasa Flow':'🌊','Yin Yoga':'☯️','Hot Yoga':'🔥','Prenatal Yoga':'🤰','Kids Yoga':'🧒','Meditation':'🧠','Sound Healing':'🎵','Wedding Photography':'💍','Portrait Sessions':'📸','Corporate Photography':'🏢','Product Photography':'📦','Fashion Shoots':'👗','Newborn & Baby':'👶','Event Coverage':'🎪','Album Design':'📖','IIT-JEE Preparation':'⚗️','NEET Coaching':'🏥','UPSC Foundation':'🎖️','CAT & MBA':'📈','Class 10 & 12':'📚','IELTS & TOEFL':'🌍','Bank PO & SSC':'🏦','Foundation Course':'🎓','Bridal Makeup':'👰','Hair Styling & Color':'💇','Keratin Treatment':'✨','Skin Facials':'🌸','Nail Art & Extensions':'💅','Body Waxing':'🌺','Eyebrow Threading':'👁️','Spa & Massage':'💆'};
  return icons[service]||'⭐';
}

function getServiceDesc(service, type){
  const descs={'Dental Implants':'Permanent, natural-looking tooth replacement with titanium implants and porcelain crowns.','Teeth Whitening':'Professional whitening treatments for up to 8 shades brighter smile in one visit.','Invisible Braces':'Clear, removable aligners for a perfectly straight smile without metal brackets.','Root Canal':'Pain-free root canal therapy to save infected teeth with modern rotary endodontics.','Dental Crowns':'Custom ceramic crowns that restore damaged teeth to full strength and beauty.','Cosmetic Dentistry':'Complete smile makeovers combining veneers, whitening, and contouring procedures.','Pediatric Dentistry':'Child-friendly dental care in a fun, anxiety-free environment for all ages.','Gum Treatment':'Advanced periodontal therapy to treat gum disease and restore oral health.','Criminal Defense':'Aggressive criminal defense representation in sessions courts and High Courts.','Civil Litigation':'Experienced civil litigation for contract disputes, property matters, and injunctions.','Family Law & Divorce':'Sensitive, efficient handling of divorce, custody, and matrimonial property matters.','Corporate Law':'End-to-end corporate legal services including formation, contracts, and compliance.','Property Disputes':'Expert resolution of property title disputes, encroachment, and builder fraud cases.','Consumer Cases':'Fight for your consumer rights against defective products and deficient services.','Labour Law':'Employment law advisory and litigation for both employers and employees.','High Court Matters':'Specialized High Court and Supreme Court representation by senior advocates.','Personal Training':'One-on-one training sessions designed around your specific goals and fitness level.','Weight Loss Program':'Structured 8-12 week fat loss programs combining training, nutrition, and accountability.','Muscle Building':'Progressive overload training programs with nutrition coaching for maximum hypertrophy.','HIIT & Cardio':'High-intensity interval training for maximum calorie burn and cardiovascular fitness.','Nutrition Planning':'Custom macro-based meal plans tailored to your body composition and fitness goals.','Online Coaching':'Remote coaching with weekly check-ins, video form reviews, and 24/7 app support.','Group Classes':'High-energy group fitness sessions in a motivating, community-driven environment.','Athletic Performance':'Sport-specific training to enhance speed, strength, agility, and endurance.','Fine Dining':'An elevated dining experience with artisan dishes and sommelier wine pairings.','Family Meals':'Generous, flavourful family portions in a warm and welcoming atmosphere.','Catering Services':'Full-service catering for weddings, corporate events, and private celebrations.','Private Events':'Exclusively reserved dining rooms for birthdays, anniversaries, and corporate dinners.','Corporate Lunch':'Tailored corporate lunch packages with customized menus and dedicated service teams.','Birthday Packages':'Special celebration packages with customized cakes, decorations, and menus.','Live Kitchen':'Watch our chefs craft your meal in our open kitchen for a theatrical experience.','Home Delivery':'Fresh restaurant-quality meals delivered to your doorstep within 45 minutes.'};
  return descs[service]||`Professional ${service.toLowerCase()} services delivered with expertise and dedication to quality.`;
}
