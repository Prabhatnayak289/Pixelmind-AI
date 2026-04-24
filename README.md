# PixelMind AI — Powered by Groq
## 100% Free · No Credit Card · No Billing · Just Email Signup

---

## WHY GROQ?
- Free tier: just sign up with email at console.groq.com
- No credit card ever needed
- No project setup, no billing, no quota issues
- 14,400+ free requests/day
- Extremely fast responses (300-500 tokens/second)

---

## STEP 1 — Get Free Groq API Key (2 minutes)

1. Open: https://console.groq.com
2. Click "Sign Up"
3. Sign up with your email OR "Continue with Google"
   (No credit card asked at any point)
4. After login, click "API Keys" in the left sidebar
5. Click "Create API Key"
6. Give it any name e.g. "PixelMind"
7. Copy the key — looks like: gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
8. Save it somewhere safe

That's it. Free forever. No billing page, no card needed.

---

## STEP 2 — Update Your Vercel Environment Variable

You previously deployed the site with GEMINI_API_KEY.
Now you need to ADD the Groq key:

1. Go to https://vercel.com → your project → Settings → Environment Variables
2. DELETE the old GEMINI_API_KEY variable
3. Click "Add New"
4. Name:  GROQ_API_KEY
5. Value: paste your gsk_... key
6. Click Save
7. Go to Deployments tab → click the 3 dots on latest deploy → Redeploy

Your site is now live with Groq. Test the Generate button — it will work!

---

## IF THIS IS A FRESH DEPLOY (GitHub + Vercel from scratch)

Step 1: Get Groq key from console.groq.com (email only, no card)

Step 2: Upload to GitHub
- Create repo: pixelmind-ai
- Upload these files:
    api/generate.js
    public/index.html
    vercel.json
    README.md

Step 3: Deploy on Vercel
- vercel.com → Add New Project → import pixelmind-ai
- Before deploying, add Environment Variable:
    Name:  GROQ_API_KEY
    Value: your gsk_... key
- Click Deploy → live in 60 seconds!

---

## GROQ FREE TIER LIMITS
- Model used: llama-3.3-70b-versatile (best quality free model)
- Free requests per day: 1,000 for 70B model (plenty for demos + clients)
- Speed: 300-500 tokens/second (very fast, ~5 second generation)
- No credit card ever required

---

## TROUBLESHOOTING

Error "GROQ_API_KEY environment variable is not set":
→ Go to Vercel → Settings → Environment Variables → add GROQ_API_KEY → Redeploy

Error "401 Unauthorized":
→ Your API key is wrong or expired. Create a new one at console.groq.com

Error "429 Rate limit":
→ You hit the daily limit. Wait until tomorrow OR sign up for a second free Groq account

---

PixelMind AI Studio · Kolkata · 2026
Powered by Groq + Llama 3.3 70B — Free forever
