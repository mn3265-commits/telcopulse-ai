<div align="center">

# 📡 TelcoPulse AI

### Marketing intelligence for subscription businesses — built by someone who managed it at scale.

**[Live Demo](https://telcopulse-ai.vercel.app)** · **[Video Walkthrough](#)** · **[Architecture](#architecture)**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4-E85D24?style=flat-square)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-2EC4B6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Why this exists

Most AI marketing tools are built by engineers guessing at what marketers need.

I spent 10 years in the trenches:
- **Indosat Ooredoo Hutchison** — Led pricing & bundling for 100M+ subscribers ($119M monthly data revenue)
- **Smartfren Telecom** — Built retention campaigns that lifted retention by 70%
- **Hutchison 3 Indonesia** — Drove product operations for an app with 10M+ downloads
- **Grab (GrabKios)** — Built lifecycle campaigns contributing 80%+ of company revenue

TelcoPulse is the tool I wished existed every Monday morning, staring at 10 dashboards that didn't talk to each other.

## What it does

Four AI modules, one platform, shared customer data:

| Module | What it does |
|---|---|
| 🧠 **Churn Radar** | Real XGBoost model scores every subscriber. Explains *why* they might churn. |
| 🎯 **Smart Segments** | Type in plain English ("young users who stopped buying data") → Claude generates SQL, runs it, suggests the campaign. |
| ⚡ **Campaign Writer** | One brief, four channels. SMS (160 char), push, email, WhatsApp — all on-brand. |
| 📊 **Impact Predictor** | Before you hit send, Claude estimates reach, conversion, and revenue based on telecom benchmarks. |

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend Layer                                 │
│  Next.js 14 + TypeScript + Tailwind + Recharts  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│  AI Reasoning Layer                              │
│  Claude Sonnet 4 (multi-step chains)             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│  ML Layer                                        │
│  XGBoost churn model (18 features, ROC-AUC 0.65) │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│  Data Layer                                      │
│  10K synthetic subscribers (realistic patterns)  │
└──────────────────────────────────────────────────┘
```

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Framer Motion
- **AI:** Claude Sonnet 4 via Anthropic SDK (4 distinct reasoning chains)
- **ML:** XGBoost classifier, scikit-learn, pandas, numpy
- **Deploy:** Vercel (edge runtime), GitHub Actions CI
- **Design:** Custom dark theme, Geist font, coral accent (nod to Indosat brand)

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/mohagungnugroho/telcopulse-ai.git
cd telcopulse-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY

# 4. Generate synthetic dataset (one-time)
python scripts/generate_dataset.py

# 5. Train the churn model (one-time)
python scripts/train_model.py

# 6. Run the dev server
npm run dev
```

Visit `http://localhost:3000`

## The synthetic dataset

10,000 subscribers with realistic patterns from Southeast Asian telecom markets:

- **Plan types:** prepaid (73%) vs postpaid (27%) — matches real market split
- **Cities:** weighted by actual Indonesian demographics
- **Usage patterns:** correlated with age, plan type, and lifecycle stage
- **Churn signals:** based on real CVM experience — topup recency, complaints, NPS, dropped calls

This isn't random noise. Every signal is a churn predictor I actually used managing 100M subscribers.

## The ML model

```python
Algorithm:    XGBoost Classifier
Features:     18 (behavioral + demographic)
Training:     80/20 split, stratified
Metrics:
  - Accuracy:    0.70
  - ROC-AUC:     0.65
  - Precision:   0.50
  - Recall:      0.26

Top features:
  1. NPS score                   (0.13)
  2. Complaints last 90d         (0.10)
  3. Days since last topup       (0.08)
  4. Plan type (prepaid/postpaid)(0.07)
  5. Tenure months               (0.06)
```

## Screenshots

> Landing page, dashboard, and feature views showcasing the Vercel/Linear-inspired aesthetic.

## Deployment

Deploys to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mohagungnugroho/telcopulse-ai)

Required environment variables:
- `ANTHROPIC_API_KEY` — Your Claude API key ([get one](https://console.anthropic.com))

## Roadmap

- [x] Churn Radar with real ML model
- [x] Natural language segmentation
- [x] Multi-channel campaign generation
- [x] Impact prediction
- [ ] A/B test framework
- [ ] Webhook integrations (Twilio, SendGrid)
- [ ] Multi-tenant SaaS version
- [ ] Real database (Supabase)

## About the author

**Mohammad Agung Nugroho** — Currently pursuing MS in Technology Management at **Columbia University** (GPA 4.08).

10+ years of experience in product, marketing, and CVM across telecom, e-commerce, and consulting. Built this as a portfolio project to demonstrate that domain expertise + modern AI/ML = tools that marketers actually want to use.

[LinkedIn](https://linkedin.com/in/mohagungnugroho) · [Email](mailto:agung.nugroho@columbia.edu)

## License

MIT — fork it, build on it, make it yours.

---

<div align="center">

*Built with real CVM experience, served with real ML, powered by Claude.*

⭐ If this project helped you think about AI for marketing, give it a star.

</div>
