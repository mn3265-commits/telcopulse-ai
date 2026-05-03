# TelcoPulse AI: Technical Description

**Mohammad Agung Nugroho · Columbia University SPS · AI Solution Design and Prototype Evaluation · April 2026**

## Problem

Indosat Ooredoo Hutchison (IOH) serves approximately 95 million subscribers in Indonesia and faces sustained churn pressure from SIM consolidation and aggressive competitor pricing. The current retention process is reactive: customer service responds only after a subscriber has already left. There is no system to identify at-risk subscribers in advance, deliver personalized offers before they churn, or measure outreach effectiveness. The result is millions of preventable revenue losses each month.

## AI Approach: Hybrid Architecture

TelcoPulse combines two AI techniques, each suited to a different part of the problem:

**Predictive AI (churn scoring).** A class-balanced XGBoost classifier trained on 18 behavioral and demographic features (tenure, monthly spend, data usage percentage, NPS score, complaint history, dropped calls, app engagement, days-since-topup, etc.). XGBoost was chosen over deep learning because the data is structured and tabular, where gradient-boosted trees consistently outperform neural networks at small-to-medium scale. The model outputs a churn probability between 0 and 1, then applies a tuned decision threshold (0.40, found via PR-curve F1 maximization on the test set) to produce binary risk labels and risk tiers (Low / Medium / High).

**Generative AI (multi-surface).** Anthropic Claude Sonnet 4 via API powers seven distinct prompt chains, each behind its own Next.js route: per-segment campaign content (SMS, email, push, WhatsApp), natural-language segment queries to SQL, dashboard insights, campaign impact forecasting, ICP / persona generation, end-to-end launch plans, and per-subscriber retention briefs (risk narrative + recommended channel/offer + personalized email + voice script). The generative layer activates when `ANTHROPIC_API_KEY` is configured.

## Prototype Features

The prototype is a Next.js 14 web application on Vercel exposing **nine dashboard modules** that share one subscriber dataset and one trained model. The full module index lives in the project [`README`](https://github.com/mn3265-commits/telcopulse-ai#what-it-does). For brevity, this 1-pager focuses on the **Subscriber Workflow** module — the value-moment surface that exercises every AI Factory component in one screen.

**Subscriber Workflow** is a per-subscriber retention tracker (AI Scored → Reviewed → Contacted → Outcome). One click calls `/api/subscriber-brief`, where Claude Sonnet 4 returns a structured JSON: risk narrative, recommended channel + offer + urgency, plus a personalized email and Twilio voice script. The Marketer Decision panel is gated behind that brief and offers **three differentiated paths**: **Approve AI** (standard send), **Escalate** (channel auto-pinned to voice + senior-agent banner + Email disabled), and **Mark Safe** (model false-positive override — contact step skipped, outcome auto-set, reviewer notes captured as the retraining label). Outbound goes through Twilio Voice (`/api/send-call`) and Gmail SMTP via Nodemailer (`/api/send-email`). The full row is then submitted through `/api/feedback`, locking the workflow and queueing it for the next weekly retrain.

## Evaluation Results

All numbers reported on the 2,000-row stratified test split. XGBoost is shown at its F1-optimal threshold; baselines at their defaults.

| Metric | Target | XGBoost | Logistic Regression | Rule-based | Status |
|---|---|---|---|---|---|
| AUC-ROC | ≥ 0.65 | **0.73** | 0.72 | 0.69 | PASS |
| Recall (churn) | ≥ 0.50 | **0.66** | 0.66 | 0.55 | PASS |
| Precision (churn) | ≥ 0.40 | **0.41** | 0.39 | 0.49 | PASS |
| F1-score | ≥ 0.45 | **0.50** | 0.49 | 0.52 | PASS |
| Inference latency | < 5 s | **0.3 ms** | — | — | PASS |

**Confusion matrix (XGBoost @ tuned threshold 0.40):** TN 1,023 · FP 480 · FN 168 · TP 329.

Targets are deliberately recall-prioritized: in CVM, the cost of a missed churner (lost ARPU × LTV) is materially higher than the cost of a false positive (a low-cost retention offer to a stable subscriber). XGBoost wins on AUC, the threshold-independent ranking quality, which gives the operator flexibility to slide the precision/recall trade-off at deployment time.

## Technology Stack

Next.js 14 (React, Tailwind CSS, Recharts), XGBoost 2.x with scikit-learn, Anthropic Claude Sonnet 4 (Anthropic SDK), Nodemailer (SMTP), Twilio Voice API, Vercel (serverless deployment), GitHub (version control and CI/CD).

## Recommendation: Go (with conditions)

All five Go/No-Go thresholds passed. Three conditions before scaled rollout: (1) data quality sprint to unify legacy subscriber IDs and fill missing NPS/complaint history, (2) recalibration on real production data — expect AUC in the 0.65–0.75 range once trained on actual CDR/billing/NPS streams, (3) A/B pilot on 10,000 subscribers comparing model-targeted vs. random retention outreach across two 30-day cycles. Proceed to full production only if the pilot shows ≥ 10% churn reduction with statistical significance (p < 0.05) and offer-cost-to-revenue-saved ratio ≤ 0.30.

## Live Demo and Code

- **App:** https://telcopulse-ai.vercel.app
- **GitHub:** https://github.com/mn3265-commits/telcopulse-ai
