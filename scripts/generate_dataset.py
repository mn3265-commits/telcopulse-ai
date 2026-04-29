"""
TelcoPulse AI - Synthetic Telecom Dataset Generator
Generates 10,000 realistic subscriber records based on real patterns
observed in Southeast Asian telecom markets.

Based on insights from managing CVM at Indosat Ooredoo Hutchison (100M+ subs),
Smartfren Telecom, and Hutchison 3 Indonesia.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

np.random.seed(42)
random.seed(42)

N_SUBSCRIBERS = 10000

# Real behavioral patterns from Indonesian telecom market
CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Denpasar']
PLAN_TYPES = ['prepaid', 'postpaid']
DEVICE_BRANDS = ['Samsung', 'Oppo', 'Xiaomi', 'Vivo', 'Apple', 'Realme', 'Infinix']

# Package tiers (in IDR, then converted to USD for display)
PREPAID_PACKAGES = {
    'mini_1gb': {'price_usd': 0.70, 'data_gb': 1},
    'daily_5gb': {'price_usd': 1.30, 'data_gb': 5},
    'weekly_10gb': {'price_usd': 3.30, 'data_gb': 10},
    'monthly_20gb': {'price_usd': 6.70, 'data_gb': 20},
    'monthly_50gb': {'price_usd': 13.30, 'data_gb': 50},
    'unlimited': {'price_usd': 20.00, 'data_gb': 100}
}

POSTPAID_PLANS = {
    'starter': {'price_usd': 10, 'data_gb': 15},
    'plus': {'price_usd': 20, 'data_gb': 50},
    'family': {'price_usd': 40, 'data_gb': 150},
    'premium': {'price_usd': 60, 'data_gb': 300}
}

def generate_subscriber(user_id):
    """Generate one realistic subscriber with correlated features."""
    
    # Demographics
    age = int(np.clip(np.random.normal(32, 10), 18, 70))
    gender = np.random.choice(['M', 'F'], p=[0.52, 0.48])
    city = np.random.choice(CITIES, p=[0.35, 0.15, 0.12, 0.08, 0.08, 0.07, 0.08, 0.07])
    
    # Plan type correlates with age (older = more postpaid)
    postpaid_prob = 0.15 + (age - 18) * 0.008
    plan_type = 'postpaid' if np.random.random() < postpaid_prob else 'prepaid'
    
    # Tenure (months as customer)
    tenure_months = int(np.clip(np.random.exponential(24), 1, 120))
    
    # Current plan details
    if plan_type == 'prepaid':
        plan_name = np.random.choice(list(PREPAID_PACKAGES.keys()),
                                      p=[0.15, 0.25, 0.25, 0.20, 0.10, 0.05])
        plan_info = PREPAID_PACKAGES[plan_name]
    else:
        plan_name = np.random.choice(list(POSTPAID_PLANS.keys()),
                                      p=[0.40, 0.35, 0.15, 0.10])
        plan_info = POSTPAID_PLANS[plan_name]
    
    monthly_spend = plan_info['price_usd']
    data_quota_gb = plan_info['data_gb']
    
    # Usage patterns (key churn signals from CVM experience)
    data_usage_gb = np.clip(np.random.normal(data_quota_gb * 0.65, data_quota_gb * 0.25), 0, data_quota_gb * 1.2)
    voice_minutes = int(np.clip(np.random.normal(150, 80), 0, 600))
    sms_sent = int(np.clip(np.random.exponential(20), 0, 200))
    
    # Engagement metrics
    app_logins_last_30d = int(np.clip(np.random.poisson(12), 0, 60))
    days_since_last_topup = int(np.clip(np.random.exponential(5), 0, 45))
    complaints_last_90d = int(np.clip(np.random.poisson(0.3), 0, 5))
    
    # Customer service interactions
    support_tickets = int(np.clip(np.random.poisson(0.5), 0, 10))
    nps_score = int(np.clip(np.random.normal(7, 2), 0, 10))
    
    # Network experience
    avg_speed_mbps = np.round(np.clip(np.random.normal(25, 10), 1, 100), 1)
    dropped_calls_last_30d = int(np.clip(np.random.poisson(2), 0, 20))
    
    device_brand = np.random.choice(DEVICE_BRANDS, p=[0.28, 0.20, 0.22, 0.12, 0.10, 0.05, 0.03])
    
    # CHURN LABEL - based on realistic signal combination
    # This is the INSIDER KNOWLEDGE from real CVM work
    churn_score = 0
    
    # Strong signals (from Smartfren retention work)
    if days_since_last_topup > 10: churn_score += 3
    if data_usage_gb < data_quota_gb * 0.2: churn_score += 2
    if app_logins_last_30d < 3: churn_score += 2
    if complaints_last_90d >= 2: churn_score += 3
    if nps_score <= 4: churn_score += 3
    if dropped_calls_last_30d > 8: churn_score += 2
    
    # Medium signals
    if tenure_months < 6: churn_score += 1
    if voice_minutes < 30: churn_score += 1
    if avg_speed_mbps < 10: churn_score += 1
    
    # Protective factors
    if tenure_months > 36: churn_score -= 2
    if plan_type == 'postpaid': churn_score -= 1
    if nps_score >= 9: churn_score -= 2
    
    # Add some randomness (real world is noisy, but signal should dominate)
    churn_score += np.random.normal(0, 0.9)

    # Churn probability via sigmoid — sharper slope so signal dominates noise
    churn_prob = 1 / (1 + np.exp(-0.55 * (churn_score - 3)))
    churned = 1 if np.random.random() < churn_prob else 0
    
    # Phone number (Indonesian format, masked for privacy)
    prefix = np.random.choice(['+62812', '+62813', '+62821', '+62822', '+62851', '+62853'])
    phone = f"{prefix}-{np.random.randint(1000,9999)}-****"
    
    # Registration date
    reg_date = datetime.now() - timedelta(days=tenure_months * 30 + np.random.randint(0, 29))
    
    return {
        'user_id': f'USR{user_id:06d}',
        'phone': phone,
        'age': age,
        'gender': gender,
        'city': city,
        'registration_date': reg_date.strftime('%Y-%m-%d'),
        'tenure_months': tenure_months,
        'plan_type': plan_type,
        'plan_name': plan_name,
        'monthly_spend_usd': round(monthly_spend, 2),
        'data_quota_gb': data_quota_gb,
        'data_usage_gb': round(data_usage_gb, 2),
        'data_usage_pct': round(data_usage_gb / data_quota_gb * 100, 1),
        'voice_minutes': voice_minutes,
        'sms_sent': sms_sent,
        'app_logins_last_30d': app_logins_last_30d,
        'days_since_last_topup': days_since_last_topup,
        'complaints_last_90d': complaints_last_90d,
        'support_tickets': support_tickets,
        'nps_score': nps_score,
        'avg_speed_mbps': avg_speed_mbps,
        'dropped_calls_last_30d': dropped_calls_last_30d,
        'device_brand': device_brand,
        'churn_probability': round(float(churn_prob), 3),
        'churned': churned
    }


def main():
    print(f"🚀 Generating {N_SUBSCRIBERS:,} realistic telecom subscribers...")
    
    data = [generate_subscriber(i+1) for i in range(N_SUBSCRIBERS)]
    df = pd.DataFrame(data)
    
    # Save
    output_path = 'data/subscribers.csv'
    df.to_csv(output_path, index=False)
    
    # Statistics
    print(f"\n✅ Dataset generated!")
    print(f"📊 Total subscribers: {len(df):,}")
    print(f"📉 Churn rate: {df['churned'].mean()*100:.1f}%")
    print(f"💰 Avg monthly spend: ${df['monthly_spend_usd'].mean():.2f}")
    print(f"📱 Prepaid: {(df['plan_type']=='prepaid').sum():,} | Postpaid: {(df['plan_type']=='postpaid').sum():,}")
    print(f"\n📁 Saved to: {output_path}")
    print(f"\n🎯 High-risk subscribers (churn_prob > 0.7): {(df['churn_probability']>0.7).sum():,}")
    print(f"💸 Revenue at risk: ${df[df['churn_probability']>0.7]['monthly_spend_usd'].sum():,.2f}/month")
    
    return df


if __name__ == '__main__':
    main()
