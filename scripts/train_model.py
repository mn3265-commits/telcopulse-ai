"""
TelcoPulse AI - Churn Prediction Model
Trains an XGBoost classifier on synthetic telecom data.
Outputs a trained model + performance metrics + feature importance.
"""

import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from xgboost import XGBClassifier

print("🤖 TelcoPulse AI - Churn Model Training\n" + "="*50)

# Load data
df = pd.read_csv('data/subscribers.csv')
print(f"📂 Loaded {len(df):,} subscribers")

# Feature engineering
df['usage_ratio'] = df['data_usage_gb'] / (df['data_quota_gb'] + 0.1)
df['engagement_score'] = df['app_logins_last_30d'] / 30
df['is_prepaid'] = (df['plan_type'] == 'prepaid').astype(int)

# Features for the model
FEATURES = [
    'age', 'tenure_months', 'monthly_spend_usd', 'data_quota_gb',
    'data_usage_gb', 'data_usage_pct', 'voice_minutes', 'sms_sent',
    'app_logins_last_30d', 'days_since_last_topup', 'complaints_last_90d',
    'support_tickets', 'nps_score', 'avg_speed_mbps', 'dropped_calls_last_30d',
    'usage_ratio', 'engagement_score', 'is_prepaid'
]

X = df[FEATURES]
y = df['churned']

print(f"📊 Features: {len(FEATURES)}")
print(f"⚖️  Class balance: {y.mean()*100:.1f}% churned")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train XGBoost
print("\n🚂 Training XGBoost classifier...")
model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='logloss',
    use_label_encoder=False
)
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Metrics
metrics = {
    'accuracy': round(accuracy_score(y_test, y_pred), 3),
    'precision': round(precision_score(y_test, y_pred), 3),
    'recall': round(recall_score(y_test, y_pred), 3),
    'f1_score': round(f1_score(y_test, y_pred), 3),
    'roc_auc': round(roc_auc_score(y_test, y_pred_proba), 3),
}

print("\n📈 Model Performance:")
for k, v in metrics.items():
    print(f"   {k:12s}: {v}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': FEATURES,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n🎯 Top 5 Most Important Features:")
for _, row in feature_importance.head().iterrows():
    print(f"   {row['feature']:28s} → {row['importance']:.3f}")

# Save model and metadata
joblib.dump(model, 'ml/churn_model.pkl')
print("\n💾 Model saved to ml/churn_model.pkl")

metadata = {
    'model_type': 'XGBClassifier',
    'features': FEATURES,
    'metrics': metrics,
    'feature_importance': feature_importance.to_dict('records'),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'trained_on': '10K synthetic telecom subscribers'
}

with open('ml/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("📝 Metadata saved to ml/model_metadata.json")

# Score entire dataset and save predictions for dashboard
print("\n🔮 Scoring all subscribers...")
df['predicted_churn_prob'] = model.predict_proba(X)[:, 1]
df['risk_tier'] = pd.cut(df['predicted_churn_prob'], 
                          bins=[0, 0.3, 0.7, 1.0], 
                          labels=['Low', 'Medium', 'High'])
df.to_csv('data/subscribers_scored.csv', index=False)

print(f"✅ Scored dataset saved to data/subscribers_scored.csv")
print(f"\n📊 Risk distribution:")
print(df['risk_tier'].value_counts().to_string())
print("\n" + "="*50)
print("🎉 Training complete!")
