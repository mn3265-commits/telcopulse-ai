# TelcoPulse AI: Technical Description (1-Page)

**Agung Nugroho, Columbia University SPS, AI Solution Design and Prototype Evaluation, April 2026**

## Problem

Indosat Ooredoo Hutchison (IOH) serves approximately 95 million subscribers in Indonesia and faces sustained churn pressure from SIM consolidation and aggressive competitor pricing. The current retention process is reactive: customer service teams respond only after a subscriber has already churned. There is no system to identify at-risk subscribers in advance, deliver personalized retention offers before they leave, or measure the effectiveness of outreach campaigns.

## AI Approach: Hybrid Architecture

TelcoPulse AI combines two AI techniques, each suited to a different part of the problem:

**Predictive AI (churn scoring).** An XGBoost classifier trained on 18 behavioral and demographic features per subscriber (tenure, monthly spend, data usage percentage, NPS score, complaint history, dropped calls, app engagement, and more). XGBoost was selected over deep learning because the data is structured and tabular, where tree-based models consistently outperform neural networks. The model scores each subscriber with a churn probability between 0 and 1, then assigns a risk tier (Low, Medium, High, Critical).

**Generative AI (campaign and content generation).** Anthropic Claude Sonnet 4.5 via API. When available, Claude generates personalized multi-channel campaign content (SMS, email, push notification, WhatsApp), performs natural language customer segmentation ("high-value postpaid users with declining usage"), and predicts campaign impact using industry benchmarks. When the API is unavailable, the system falls back to rule-based templates with smart query parsing.

## Prototype Features

The prototype is a Next.js 14 web application deployed on Vercel with 7 modules:

1. **Churn Radar**: Risk distribution across 10,000 subscribers with high-risk list and campaign generation.
2. **Subscriber Workflow**: Individual retention workflow with 4-step tracker (AI Scored, Reviewed, Contacted, Outcome), human-in-the-loop decision buttons (Approve, Escalate, Mark Safe), personalized email and voice call delivery.
3. **Smart Segments**: Natural language queries converted to SQL filters with subscriber counts and strategic recommendations.
4. **Campaign Writer**: Multi-channel message generation with tone and goal customization.
5. **Impact Predictor**: Revenue forecasting with conversion rate estimates, confidence levels, and risk assessment.
6. **What-If Simulator**: Interactive sliders to adjust subscriber features and observe churn predictions in real time.
7. **Model Evaluation**: Performance metrics, baseline comparison (XGBoost vs. Logistic Regression vs. rule-based), Go/No-Go assessment, business impact estimation ($46.4M annual impact), edge case stress tests, technology stack, and AI factory architecture diagram.

## Evaluation Results

| Metric | Target | Actual | Status |
|---|---|---|---|
| AUC-ROC | >= 0.60 | 0.65 | PASS |
| Recall (churn) | >= 0.50 | 0.58 | PASS |
| Precision (churn) | >= 0.60 | 0.71 | PASS |
| F1-score | >= 0.55 | 0.64 | PASS |
| Inference latency | < 5s | 0.3ms | PASS |

All pre-pilot thresholds passed. XGBoost outperforms Logistic Regression by 0.05 AUC and rule-based heuristic by 0.11 AUC.

## Technology Stack

Next.js 14 (React, Tailwind CSS), XGBoost (scikit-learn), Claude Sonnet 4.5 (Anthropic SDK), Recharts, PapaParse, nodemailer (Gmail SMTP), Twilio Voice API, Vercel (serverless deployment), GitHub (version control and CI/CD).

## Recommendation: Go

All technical thresholds met. Three conditions before full rollout: (1) data quality sprint to unify legacy subscriber IDs, (2) recalibration on real production data (expect AUC 0.60-0.70 range), (3) A/B pilot on 10,000 subscribers comparing model-targeted versus random retention outreach across two 30-day cycles. Proceed to production only if pilot shows at least 10% churn reduction with statistical significance.

## Live Demo and Code

- **App**: https://telcopulse-ai.vercel.app
- **GitHub**: https://github.com/mn3265-commits/telcopulse-ai
