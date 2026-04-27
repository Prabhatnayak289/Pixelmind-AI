// WebClaw - generate.js
// Builds complete HTML landing pages server-side, no AI needed

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { bizType, bizName, bizDesc } = req.body;
  if (!bizType || !bizName) return res.status(400).json({ error: 'Missing fields.' });
  try {
    const html = buildPage(bizName, bizType, bizDesc || '');
    return res.status(200).json({ html });
  } catch (err) {
    console.error('Build error:', err);
    return res.status(500).json({ error: 'Failed to generate page: ' + err.message });
  }
}

// ── PRESETS ──
const PRESETS = {
  "dental clinic": {
    primary:"#0a2342",accent:"#1e7bb8",light:"#f0f7ff",highlight:"#2ecc71",text:"#1a1a2e",textLight:"#5a6a7a",
    headline:"Your Perfect Smile Starts Here",sub:"Advanced Painless Dentistry with a Personal Touch",tag:"15+ Years of Trusted Dental Care",
    services:[["🦷","Dental Implants","Permanent natural-looking tooth replacement with titanium implants."],["✨","Teeth Whitening","Up to 8 shades brighter in a single professional session."],["😁","Invisible Braces","Clear aligners for a perfect smile without metal brackets."],["🔬","Root Canal","Pain-free therapy to save infected teeth with modern rotary tech."],["👑","Dental Crowns","Custom ceramic crowns restoring damaged teeth to full strength."],["💎","Cosmetic Dentistry","Complete smile makeovers with veneers, whitening, and contouring."],["👶","Pediatric Dentistry","Child-friendly care in a fun, anxiety-free environment."],["🏥","Gum Treatment","Advanced periodontal therapy to restore full oral health."]],
    stats:[["5000+","Happy Patients"],["15+","Years Experience"],["98%","Success Rate"],["24hr","Emergency Care"]],
    why:[["🦷","Painless Treatment","Advanced sedation ensures a completely comfortable experience."],["🔬","Latest Technology","CBCT 3D imaging, laser dentistry, and digital X-rays."],["👨‍⚕️","Expert Doctors","BDS & MDS qualified specialists with decades of experience."],["💳","Flexible EMI","Zero-cost EMI from ₹999/month. All insurance accepted."]],
    testi:[["Rahul Sharma","Dental Implants","The implants look completely natural. Best decision of my life!"],["Priya Nair","Teeth Whitening","8 shades whiter in one session. Absolutely magical results!"],["Arjun Das","Invisible Braces","Professional, painless. My confidence has completely transformed."]],
    cta:"Book Free Consultation",offer:"🎁 FREE Dental Check-up + X-Ray worth ₹800 — This Month Only!",
    img:"https://images.unsplash.com/photo-1588776814546-1ffedcdc1f40?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80"
  },
  "law firm": {
    primary:"#0f1923",accent:"#c9a84c",light:"#f5f3ee",highlight:"#c9a84c",text:"#1a1a2e",textLight:"#6b7280",
    headline:"Justice. Integrity. Results.",sub:"India's Most Trusted Legal Counsel for Over Two Decades",tag:"Fighting for Your Rights Since 2003",
    services:[["⚖️","Criminal Defense","Aggressive representation in sessions courts and High Courts."],["🏛️","Civil Litigation","Experienced litigation for contract disputes and injunctions."],["👨‍👩‍👧","Family Law","Sensitive handling of divorce, custody, and matrimonial matters."],["🏢","Corporate Law","End-to-end services including formation, contracts, compliance."],["🏠","Property Disputes","Expert resolution of title disputes and builder fraud cases."],["📋","Consumer Cases","Fight for your rights against defective products and services."],["👷","Labour Law","Employment law advisory and litigation for employers and employees."],["🔨","High Court Matters","Specialized High Court and Supreme Court representation."]],
    stats:[["2000+","Cases Won"],["20+","Years Practice"],["500+","Corporate Clients"],["24/7","Legal Support"]],
    why:[["⚖️","Proven Track Record","2000+ successful cases across High Courts and Supreme Court."],["🏛️","Expert Legal Team","Senior advocates specialized across all branches of law."],["🤝","Client-First","Transparent communication and completely honest legal advice."],["📞","24/7 Available","Emergency legal assistance round the clock."]],
    testi:[["Vikram Mehta","Property Dispute","Won our 5-year case in 8 months. Outstanding legal strategy!"],["Sunita Rao","Divorce Settlement","Compassionate and professional. Best possible outcome."],["TechCorp Ltd","Corporate Matter","Saved us ₹2 crore in a contract dispute. Exceptional!"]],
    cta:"Get Free Consultation",offer:"⚖️ FREE 30-Min Legal Consultation — No Obligation, Full Confidentiality",
    img:"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&q=80"
  },
  "fitness coach": {
    primary:"#0d0d0d",accent:"#ff3d00",light:"#1a1a1a",highlight:"#ffd700",text:"#f5f5f5",textLight:"#aaaaaa",
    headline:"Transform Your Body. Transform Your Life.",sub:"Science-Based Fitness Coaching That Delivers Real Results",tag:"500+ Transformations and Counting",
    services:[["💪","Personal Training","One-on-one sessions designed around your specific goals."],["🎯","Weight Loss","Structured 8-12 week fat loss programs with nutrition support."],["🏋️","Muscle Building","Progressive overload training for maximum lean muscle gain."],["🔥","HIIT Training","High-intensity intervals for maximum calorie burn."],["🥗","Nutrition Planning","Custom macro-based meal plans for your body composition."],["💻","Online Coaching","Remote coaching with weekly check-ins and app support."],["👥","Group Classes","High-energy group fitness in a motivating environment."],["🏆","Athletic Performance","Sport-specific training for speed, strength, and agility."]],
    stats:[["500+","Transformations"],["10+","Years Coaching"],["95%","Client Success"],["50+","Weekly Classes"]],
    why:[["🔥","Proven Programs","Training plans backed by sports science and real results."],["📊","Progress Tracking","Weekly body composition analysis and goal adjustments."],["🥗","Nutrition Guidance","Personalized meal plans and supplement guidance included."],["💪","Certified Coaches","NSCA, ACE, and ISSA certified with competition experience."]],
    testi:[["Ananya Singh","Weight Loss","Lost 18kg in 4 months! The nutrition combo is unbeatable."],["Rohit Kumar","Muscle Building","Gained 8kg lean muscle in 3 months. Results speak for themselves."],["Meera Patel","Overall Fitness","From barely walking to running a 10K. Life completely changed!"]],
    cta:"Start Free Trial",offer:"🔥 FREE 7-Day Trial + Body Composition Analysis worth ₹2000!",
    img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&q=80"
  },
  "restaurant": {
    primary:"#1a0a00",accent:"#d4a017",light:"#fdf6ec",highlight:"#e05c2a",text:"#2d1500",textLight:"#7a6050",
    headline:"Where Every Bite Tells a Story",sub:"Authentic Flavours, Unforgettable Dining Experiences",tag:"Serving Happiness Since 2010",
    services:[["🍽️","Fine Dining","Elevated dining with artisan dishes and wine pairings."],["👨‍👩‍👧","Family Meals","Generous flavourful portions in a warm atmosphere."],["🎪","Catering","Full-service catering for weddings and corporate events."],["🎉","Private Events","Reserved dining rooms for up to 200 guests."],["💼","Corporate Lunch","Tailored packages with customized menus."],["🎂","Birthday Packages","Special celebrations with custom cakes and decorations."],["👨‍🍳","Live Kitchen","Watch our chefs craft your meal in our open kitchen."],["🛵","Home Delivery","Fresh meals delivered to your door within 45 minutes."]],
    stats:[["50000+","Guests Served"],["14+","Years Excellence"],["4.9★","Google Rating"],["200+","Menu Items"]],
    why:[["👨‍🍳","Master Chefs","Award-winning chefs trained in 5-star hotels."],["🌿","Fresh Ingredients","Farm-to-table philosophy with locally sourced produce."],["🏆","Award Winning","Best Restaurant by Times Food Guide 3 years running."],["🎉","Private Events","Customizable dining for up to 200 guests."]],
    testi:[["Deepa Krishnan","Anniversary Dinner","The ambiance, food, and service were absolutely magical!"],["Suresh Iyer","Corporate Event","Every single guest was thoroughly impressed."],["Neha Gupta","Birthday Party","The personalised menu was beyond our expectations!"]],
    cta:"Reserve a Table",offer:"🍽️ Book Today & Get Complimentary Dessert for the Table!",
    img:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=80"
  },
  "software agency": {
    primary:"#050510",accent:"#6c63ff",light:"#0d0d1a",highlight:"#00d4ff",text:"#f0f0ff",textLight:"#8888aa",
    headline:"We Build Software That Scales",sub:"Full-Stack Development, AI Solutions & Digital Transformation",tag:"Trusted by 200+ Companies Worldwide",
    services:[["🌐","Web Development","Modern responsive web apps with React, Next.js, Node.js."],["📱","Mobile Apps","Cross-platform iOS and Android apps with Flutter."],["🤖","AI & ML Solutions","Integrating GPT-4, computer vision, and ML into your product."],["☁️","Cloud DevOps","AWS, GCP, Docker, Kubernetes — scalable infrastructure."],["🎨","UI/UX Design","User-centred design that converts visitors into customers."],["🔌","API Development","Robust RESTful and GraphQL APIs for any platform."],["🛒","E-Commerce","High-converting online stores with payment integration."],["🚀","SaaS Products","End-to-end SaaS development from MVP to enterprise scale."]],
    stats:[["200+","Projects Delivered"],["8+","Years Experience"],["50+","Tech Experts"],["98%","Client Retention"]],
    why:[["🚀","Agile Delivery","2-week sprints with daily standups and on-time delivery."],["🔒","Enterprise Security","ISO 27001 compliant with end-to-end encryption."],["📱","Cross-Platform","React, Flutter, Node.js, Python — every modern stack."],["🤖","AI-First","GPT-4, vision, and ML integrated into real products."]],
    testi:[["Kiran Patel, CTO","SaaS Platform","Delivered complex SaaS in 3 months. Code quality outstanding!"],["Riya Shah, CEO","Mobile App","100K downloads in first month. Brilliant UX and solid backend!"],["Dev Sharma, Founder","E-Commerce","Sales up 400% after redesign. Best tech investment ever."]],
    cta:"Get Free Estimate",offer:"💻 FREE Technical Consultation + Project Roadmap worth ₹10,000!",
    img:"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
  },
  "real estate agency": {
    primary:"#0d1b2a",accent:"#c5a028",light:"#f5f0e8",highlight:"#1b4332",text:"#0d1b2a",textLight:"#5a6a7a",
    headline:"Find Your Dream Home",sub:"Premium Properties, Trusted Guidance, Lifetime Investment",tag:"₹500 Crore+ Worth of Properties Sold",
    services:[["🏡","Residential Sales","Find your perfect home from our exclusive listings."],["🏢","Commercial Properties","Offices, shops, and warehouses for businesses."],["🔑","Rental Management","End-to-end property rental and tenant management."],["📊","Property Valuation","Accurate market valuation for buy, sell, or loan purposes."],["💰","Investment Advisory","ROI analysis, area growth trends, and investment guidance."],["✈️","NRI Services","Full support for NRIs buying property in India remotely."],["🏗️","New Projects","Pre-launch access to the best upcoming developments."],["🔄","Resale Properties","Verified resale homes with clean legal title."]],
    stats:[["1500+","Properties Sold"],["18+","Years Experience"],["₹500Cr+","Deals Closed"],["5000+","Happy Families"]],
    why:[["🏠","Exclusive Listings","Pre-launch and off-market properties before they list."],["📊","Market Intelligence","Real-time price analytics and ROI projections."],["🤝","End-to-End Support","Legal, loans, interiors, and moving assistance included."],["🏆","Award-Winning","Best Agency by CREDAI Bengal 3 consecutive years."]],
    testi:[["Amit Banerjee","3BHK in Newtown","Found our perfect home in 2 weeks. Handled everything!"],["Shreya Chatterjee","Commercial Office","18% ROI in the first year. Brilliant advice!"],["NRI Client, Dubai","Investment Property","Transparent process, no surprises. Highly trusted!"]],
    cta:"Schedule Free Visit",offer:"🏠 FREE Property Valuation + Investment Advisory — Limited Slots!",
    img:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
  },
  "yoga studio": {
    primary:"#1a2e1a",accent:"#8b6914",light:"#f5f0eb",highlight:"#7c9885",text:"#1a2e1a",textLight:"#5a6a5a",
    headline:"Find Your Inner Peace",sub:"Holistic Yoga & Wellness for Mind, Body and Soul",tag:"Transforming Lives Through Yoga Since 2012",
    services:[["🧘","Hatha Yoga","Foundation yoga for strength, flexibility, and balance."],["🌊","Vinyasa Flow","Dynamic flowing sequences linked with breath."],["☯️","Yin Yoga","Deep passive stretches for connective tissue and relaxation."],["🔥","Hot Yoga","26-posture series in a heated room for deep detox."],["🤰","Prenatal Yoga","Gentle practice for expectant mothers at all stages."],["🧒","Kids Yoga","Fun, playful yoga building focus and confidence in children."],["🧠","Meditation","Mindfulness, pranayama, and guided meditation classes."],["🎵","Sound Healing","Tibetan bowls, gongs, and crystal healing sessions."]],
    stats:[["2000+","Students Trained"],["12+","Years Teaching"],["20+","Weekly Classes"],["8","Expert Instructors"]],
    why:[["🧘","Certified Instructors","RYT-500 certified teachers trained in Rishikesh."],["🌿","Holistic Approach","Yoga, pranayama, Ayurveda, and lifestyle coaching."],["🏛️","Premium Studio","AC studio with natural lighting and premium props."],["👨‍👩‍👧","All Levels Welcome","Separate beginner, intermediate, and advanced batches."]],
    testi:[["Pooja Menon","6 Months Student","Chronic back pain gone in 2 months. This studio healed me!"],["Rajesh Nair","Meditation Course","Anxiety levels dropped 80%. Mindfulness is life-changing."],["Kavitha Rao","Prenatal Yoga","Most peaceful pregnancy thanks to these gentle classes!"]],
    cta:"Book Free Trial Class",offer:"🧘 FREE First Class + Yoga Starter Kit worth ₹1500!",
    img:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80"
  },
  "photography studio": {
    primary:"#0d0d0d",accent:"#c9a84c",light:"#f5f5f5",highlight:"#c9a84c",text:"#1a1a1a",textLight:"#666666",
    headline:"Moments Captured Forever",sub:"Where Art Meets Emotion — Premium Photography for Every Occasion",tag:"10,000+ Moments Beautifully Preserved",
    services:[["💍","Wedding Photography","Cinematic wedding coverage that tells your love story."],["📸","Portrait Sessions","Professional portraits for individuals, couples, and families."],["🏢","Corporate Photography","Headshots, events, and brand imagery for businesses."],["📦","Product Photography","Clean, compelling product shots that drive online sales."],["👗","Fashion Shoots","Editorial and commercial fashion photography."],["👶","Newborn & Baby","Gentle, safe, and adorable newborn milestone photography."],["🎪","Event Coverage","Conferences, launches, parties, and cultural events."],["📖","Album Design","Heirloom quality printed albums and digital galleries."]],
    stats:[["1000+","Weddings Shot"],["10+","Years Experience"],["50K+","Photos Delivered"],["4.9★","Average Rating"]],
    why:[["📸","Award-Winning","Featured in Vogue India and Times Wedding."],["🎬","Cinema-Grade Gear","Sony A1, Canon R5 with professional lighting."],["🎨","Artistic Vision","We create visual poetry, not just documentation."],["💾","Quick Delivery","Edited photos within 7 days. Albums in 30 days."]],
    testi:[["Sneha & Arjun","Wedding","Every photo looks like it's from a Bollywood film. Pure magic!"],["L'Oreal India","Product Shoot","Our most successful campaign yet. Photography elevated our brand!"],["Tata Consultancy","Corporate Event","Professional and the results were stunning. Will always use them!"]],
    cta:"Book Your Session",offer:"📸 FREE Pre-Wedding Shoot worth ₹15,000 with Every Wedding Package!",
    img:"https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80"
  },
  "coaching institute": {
    primary:"#003366",accent:"#ff6b00",light:"#f0f4ff",highlight:"#28a745",text:"#001a33",textLight:"#4a6a8a",
    headline:"Your Success Story Starts Here",sub:"Expert Coaching for IIT-JEE, NEET, UPSC & All Competitive Exams",tag:"5000+ Students Selected in Top Institutions",
    services:[["⚗️","IIT-JEE Preparation","Comprehensive Physics, Chemistry, Maths coaching for IIT."],["🏥","NEET Coaching","Biology-focused preparation with medical college guidance."],["🎖️","UPSC Foundation","IAS/IPS preparation with current affairs and essay coaching."],["📈","CAT & MBA","Quantitative, verbal, and case study prep for top B-schools."],["📚","Class 10 & 12","Board exam preparation with concept-based learning."],["🌍","IELTS & TOEFL","English proficiency coaching for study abroad aspirants."],["🏦","Bank PO & SSC","Quantitative aptitude and reasoning for banking exams."],["🎓","Foundation Course","Early start program for students in classes 6 to 9."]],
    stats:[["5000+","Selections Made"],["15+","Years Excellence"],["200+","Expert Faculty"],["95%","Success Rate"]],
    why:[["📚","Expert Faculty","IIT/IIM alumni and retired IAS officers as guest faculty."],["📊","Smart Study System","AI-powered doubt clearing and adaptive weekly tests."],["🏆","Proven Results","AIR 1 NEET 2023, 3 IIT top-50 ranks, 47 IAS in 5 years."],["💰","Affordable Fees","Scholarships up to 90%. Easy EMI. No student left behind."]],
    testi:[["Aryan Gupta, AIR 47","IIT-JEE","Faculty teaches concepts not formulas. Dream come true!"],["Priya Sharma, MBBS","NEET 2023","Scored 680/720! Mock tests were exactly like the real exam."],["IAS Rohit Verma","UPSC 2022","Cleared UPSC in first attempt thanks to their mentorship!"]],
    cta:"Enroll Now",offer:"🎓 FREE Demo Class + Scholarship Test — Win Up to 90% Fee Waiver!",
    img:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1434030216411-0b793f4b6f7d?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80"
  },
  "beauty salon": {
    primary:"#2d1b33",accent:"#e91e8c",light:"#fdf5ff",highlight:"#c9a0dc",text:"#2d1b33",textLight:"#7a5a8a",
    headline:"Where Beauty Meets Luxury",sub:"Premium Salon Experiences That Leave You Glowing",tag:"Kolkata's Most Loved Luxury Salon",
    services:[["👰","Bridal Makeup","Complete bridal transformation with HD makeup and styling."],["💇","Hair Styling","Expert cuts, colour, highlights, and styling for all hair types."],["✨","Keratin Treatment","Frizz-free silky smooth hair with professional keratin."],["🌸","Skin Facials","Deep cleansing, brightening, and anti-aging facial treatments."],["💅","Nail Art","Custom nail art, gel extensions, and premium nail care."],["🌺","Body Waxing","Smooth, long-lasting waxing with gentle skin-friendly products."],["👁️","Eyebrow Threading","Precision eyebrow shaping by expert threading specialists."],["💆","Spa & Massage","Relaxing body massages and spa therapies for total wellness."]],
    stats:[["10000+","Happy Clients"],["8+","Years Excellence"],["50+","Beauty Experts"],["4.9★","Google Rating"]],
    why:[["💄","Master Artists","Celebrity makeup artists from VLCC and L'Oreal Academy."],["✨","Premium Products","100% authentic MAC, Kérastase, Schwarzkopf products."],["👰","Bridal Specialists","600+ brides transformed with dedicated bridal suite."],["🌸","Hygiene First","Hospital-grade sterilization and disposable tools guaranteed."]],
    testi:[["Ritika Singh","Bridal Makeup","Looked like a queen on my wedding day! Every guest complimented me."],["Tanvi Ghosh","Keratin Treatment","My frizzy hair is silky smooth for the first time ever!"],["Monika Roy","Nail Art","The designs are stunning. Everyone asks where I got them done!"]],
    cta:"Book Appointment",offer:"💅 20% OFF on All Services for First-Time Visitors — Book Today!",
    img:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80",
    img2:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    img3:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80"
  }
};

// ── BUILD PAGE ──
function buildPage(name, type, desc) {
  const p = PRESETS[type] || PRESETS["software agency"];
  const isDark = ["#0d0d0d","#050510","#0f1923","#1a2e1a","#2d1b33","#1a0a00","#003366"].includes(p.primary);
  const btnColor = isDark ? '#ffffff' : p.primary;

  const servicesHtml = p.services.map(([icon,title,text],i) => `
    <div class="sc" style="animation-delay:${i*0.07}s">
      <div class="si">${icon}</div>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>`).join('');

  const statsHtml = p.stats.map(([n,l]) => `
    <div class="stat"><div class="sn">${n}</div><div class="sl">${l}</div></div>`).join('');

  const whyHtml = p.why.map(([icon,title,text]) => `
    <div class="wc">
      <div class="wi">${icon}</div>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>`).join('');

  const testiHtml = p.testi.map(([author,service,quote]) => `
    <div class="tc">
      <div class="ts">★★★★★</div>
      <p class="tq">"${quote}"</p>
      <div class="ta"><div class="tav">${author[0]}</div>
      <div><div class="tn">${author}</div><div class="tsv">${service}</div></div></div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:${p.light};color:${p.text};overflow-x:hidden}
nav{position:sticky;top:0;z-index:100;height:66px;background:${p.primary};display:flex;align-items:center;justify-content:space-between;padding:0 5%;box-shadow:0 2px 20px rgba(0,0,0,.3)}
.nb{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:${p.accent}}
.nl{display:flex;align-items:center;gap:4px;list-style:none}
.nl a{color:rgba(255,255,255,.8);text-decoration:none;font-size:.85rem;padding:7px 14px;border-radius:8px;transition:.2s}
.nl a:hover{background:rgba(255,255,255,.1);color:#fff}
.nc{background:${p.accent};color:${btnColor};padding:9px 20px;border-radius:8px;font-weight:700;font-size:.85rem;text-decoration:none}
.offer{background:${p.accent};color:${btnColor};text-align:center;padding:11px;font-size:.84rem;font-weight:700}
.hero{min-height:90vh;background:linear-gradient(135deg,${p.primary}f0 0%,${p.primary}cc 60%,${p.accent}22 100%),url('${p.img}') center/cover no-repeat;display:flex;align-items:center;padding:60px 5%;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-20%;right:-5%;width:500px;height:500px;background:radial-gradient(circle,${p.accent}25 0%,transparent 65%);border-radius:50%}
.hc{max-width:640px;position:relative;z-index:1}
.htag{display:inline-flex;align-items:center;gap:8px;background:${p.accent}22;border:1px solid ${p.accent}44;color:${p.accent};padding:7px 18px;border-radius:50px;font-size:.75rem;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:22px}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.6rem,5vw,4.2rem);font-weight:900;line-height:1.08;color:#fff;margin-bottom:18px}
.hero h1 span{color:${p.accent}}
.hs{font-size:1.08rem;color:rgba(255,255,255,.72);line-height:1.75;margin-bottom:12px}
.hd{font-size:.9rem;color:rgba(255,255,255,.5);margin-bottom:34px}
.hb{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px}
.bp{background:${p.accent};color:${btnColor};padding:15px 32px;border-radius:10px;font-size:.93rem;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 8px 28px ${p.accent}50;transition:.25s}
.bp:hover{transform:translateY(-3px)}
.bs{background:transparent;color:#fff;padding:15px 32px;border-radius:10px;font-size:.93rem;font-weight:600;border:2px solid rgba(255,255,255,.3);text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:.25s}
.bs:hover{background:rgba(255,255,255,.08)}
.hp{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.6);font-size:.9rem}
.hp strong{color:#fff}
/* Stats */
.sb{background:${p.primary};padding:36px 5%;display:flex;justify-content:center}
.si2{display:flex;max-width:1100px;width:100%;justify-content:space-around;flex-wrap:wrap;gap:20px}
.stat{text-align:center;padding:0 20px}
.sn{font-family:'Playfair Display',serif;font-size:2.3rem;font-weight:900;color:${p.accent};line-height:1}
.sl{font-size:.76rem;color:rgba(255,255,255,.55);margin-top:6px;text-transform:uppercase;letter-spacing:.5px}
/* Services */
.svs{padding:72px 5%;background:${p.light}}
.sh{text-align:center;margin-bottom:48px}
.stag{display:inline-block;background:${p.accent}18;color:${p.accent};padding:5px 16px;border-radius:50px;font-size:.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;border:1px solid ${p.accent}30}
.st{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:900;color:${p.text};letter-spacing:-.5px;line-height:1.2;margin-bottom:12px}
.st span{color:${p.accent}}
.ss{font-size:.96rem;color:${p.textLight};max-width:520px;margin:0 auto;line-height:1.75}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1200px;margin:0 auto}
.sc{background:#fff;border-radius:16px;padding:26px 22px;border:1px solid ${p.accent}18;transition:.3s;cursor:default}
.sc:hover{transform:translateY(-6px);box-shadow:0 20px 60px ${p.accent}20;border-color:${p.accent}40}
.si{font-size:1.9rem;margin-bottom:14px;display:block}
.sc h3{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:8px;color:${p.text}}
.sc p{font-size:.8rem;color:${p.textLight};line-height:1.65}
/* Why */
.why{padding:72px 5%;background:${p.primary};position:relative;overflow:hidden}
.why::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 70% at 80% 50%,${p.accent}12 0%,transparent 60%)}
.wg{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
.wc{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:30px 24px;transition:.3s}
.wc:hover{background:rgba(255,255,255,.1);transform:translateY(-4px);border-color:${p.accent}50}
.wi{font-size:2rem;margin-bottom:16px}
.wc h3{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:#fff;margin-bottom:8px}
.wc p{font-size:.82rem;color:rgba(255,255,255,.55);line-height:1.7}
/* Gallery */
.gal{padding:72px 5%;background:${p.light}}
.gg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;max-width:1200px;margin:0 auto}
.gi{border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12);position:relative;aspect-ratio:4/3}
.gi img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}
.gi:hover img{transform:scale(1.06)}
.gl{position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-size:.85rem;font-weight:600}
/* Testimonials */
.tes{padding:72px 5%;background:${p.light === '#1a1a1a' || p.light === '#0d0d1a' ? p.primary : '#fff'}}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;max-width:1200px;margin:0 auto}
.tc{background:${p.light};border-radius:18px;padding:30px;border:1px solid ${p.accent}18;transition:.3s}
.tc:hover{transform:translateY(-4px);box-shadow:0 16px 48px ${p.accent}18}
.ts{font-size:1rem;letter-spacing:2px;margin-bottom:14px;color:#f59e0b}
.tq{font-size:.9rem;color:${p.textLight};line-height:1.8;margin-bottom:20px;font-style:italic;position:relative;padding-left:18px}
.tq::before{content:'"';position:absolute;left:0;top:-4px;font-size:1.8rem;color:${p.accent};font-family:'Playfair Display',serif;line-height:1}
.ta{display:flex;align-items:center;gap:12px}
.tav{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,${p.accent},${p.highlight});display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;color:#fff;flex-shrink:0}
.tn{font-weight:700;font-size:.87rem;color:${p.text}}
.tsv{font-size:.74rem;color:${p.accent};font-weight:600;margin-top:2px}
/* CTA */
.cta{background:linear-gradient(135deg,${p.primary},${p.primary}ee);padding:80px 5%;text-align:center;position:relative;overflow:hidden}
.cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,${p.accent}18 0%,transparent 65%)}
.cta h2{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:900;color:#fff;margin-bottom:14px;position:relative;z-index:1}
.cta p{color:rgba(255,255,255,.6);font-size:.96rem;max-width:460px;margin:0 auto 36px;line-height:1.75;position:relative;z-index:1}
.cb{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
/* Footer */
footer{background:${p.primary};padding:44px 5% 28px;border-top:1px solid rgba(255,255,255,.08)}
.fi{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:36px;margin-bottom:36px}
.fb{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:${p.accent};margin-bottom:10px}
.fd{font-size:.82rem;color:rgba(255,255,255,.4);line-height:1.75}
.ft{font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px}
.fl{list-style:none;display:flex;flex-direction:column;gap:9px}
.fl a{color:rgba(255,255,255,.55);text-decoration:none;font-size:.83rem}
.fl a:hover{color:${p.accent}}
.fo{border-top:1px solid rgba(255,255,255,.07);padding-top:22px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.fc{font-size:.75rem;color:rgba(255,255,255,.28)}
/* WhatsApp */
.wa{position:fixed;bottom:26px;right:26px;width:56px;height:56px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(37,211,102,.5);text-decoration:none;z-index:200;animation:wap 3s ease-in-out infinite}
@keyframes wap{0%,100%{box-shadow:0 6px 24px rgba(37,211,102,.5)}50%{box-shadow:0 6px 36px rgba(37,211,102,.85)}}
.wa svg{width:26px;height:26px;fill:#fff}
@media(max-width:900px){
  .nl{display:none}.sg,.wg,.tg,.gg{grid-template-columns:1fr 1fr}.fi{grid-template-columns:1fr}
  .hero h1{font-size:2.4rem}.hb{flex-direction:column}
}
@media(max-width:600px){.sg,.wg,.tg,.gg,.si2{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav>
  <div class="nb">${name}</div>
  <ul class="nl">
    <li><a href="#services">Services</a></li>
    <li><a href="#why">Why Us</a></li>
    <li><a href="#reviews">Reviews</a></li>
    <li><a href="#contact" class="nc">${p.cta}</a></li>
  </ul>
</nav>
<div class="offer">${p.offer}</div>
<section class="hero">
  <div class="hc">
    <div class="htag">● ${p.tag}</div>
    <h1>${p.headline.replace(/\. /g,'.<br>')} <span>${name}</span></h1>
    <p class="hs">${p.sub}</p>
    <p class="hd">${desc || 'Serving our community with excellence, dedication, and unmatched expertise.'}</p>
    <div class="hb">
      <a href="#contact" class="bp">📅 ${p.cta}</a>
      <a href="tel:+919321027740" class="bs">📞 Call Now</a>
    </div>
    <div class="hp">📱 Talk to us: <strong>+91 93210 27740</strong></div>
  </div>
</section>
<div class="sb"><div class="si2">${statsHtml}</div></div>
<section class="svs" id="services">
  <div class="sh">
    <div class="stag">Our Services</div>
    <h2 class="st">Everything You Need,<br><span>All in One Place</span></h2>
    <p class="ss">Comprehensive solutions with the highest standards of quality and expertise.</p>
  </div>
  <div class="sg">${servicesHtml}</div>
</section>
<section class="why" id="why">
  <div class="sh">
    <div class="stag" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)">Why Choose Us</div>
    <h2 class="st" style="color:#fff">The ${name} <span>Difference</span></h2>
    <p class="ss" style="color:rgba(255,255,255,.5)">We don't just promise — we deliver every single day.</p>
  </div>
  <div class="wg">${whyHtml}</div>
</section>
<section class="gal">
  <div class="sh">
    <div class="stag">Our Gallery</div>
    <h2 class="st">See the <span>Difference We Make</span></h2>
  </div>
  <div class="gg">
    <div class="gi"><img src="${p.img}" alt="${name} facility" loading="lazy"><div class="gl">Our Facility</div></div>
    <div class="gi"><img src="${p.img2}" alt="${name} services" loading="lazy"><div class="gl">Our Services</div></div>
    <div class="gi"><img src="${p.img3}" alt="${name} team" loading="lazy"><div class="gl">Our Team</div></div>
  </div>
</section>
<section class="tes" id="reviews">
  <div class="sh">
    <div class="stag">Client Reviews</div>
    <h2 class="st">What Our <span>Clients Say</span></h2>
    <p class="ss">Real stories from people whose lives we've had the privilege of impacting.</p>
  </div>
  <div class="tg">${testiHtml}</div>
</section>
<section class="cta" id="contact">
  <h2>Ready to Get Started?</h2>
  <p>Join thousands of satisfied clients who chose ${name}. Take the first step today — it's completely free.</p>
  <div class="cb">
    <a href="https://wa.me/919321027740?text=Hi! I want to book with ${encodeURIComponent(name)}" class="bp" target="_blank">💬 WhatsApp Us Now</a>
    <a href="tel:+919321027740" class="bs">📞 +91 93210 27740</a>
  </div>
</section>
<footer>
  <div class="fi">
    <div>
      <div class="fb">${name}</div>
      <p class="fd">${p.sub}. Trusted by thousands across India.</p>
    </div>
    <div>
      <div class="ft">Services</div>
      <ul class="fl">${p.services.slice(0,4).map(([,t])=>`<li><a href="#services">${t}</a></li>`).join('')}</ul>
    </div>
    <div>
      <div class="ft">Contact</div>
      <ul class="fl">
        <li><a href="tel:+919321027740">+91 93210 27740</a></li>
        <li><a href="https://wa.me/919321027740" target="_blank">WhatsApp</a></li>
        <li><a href="mailto:prabhat3.nayak@gmail.com">prabhat3.nayak@gmail.com</a></li>
      </ul>
    </div>
  </div>
  <div class="fo">
    <div class="fc">© 2026 ${name}. All rights reserved.</div>
    <div class="fc">Built with WebClaw AI</div>
  </div>
</footer>
<a class="wa" href="https://wa.me/919321027740?text=Hi! I want to know more about ${encodeURIComponent(name)}" target="_blank">
  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
</body>
</html>`;
}
