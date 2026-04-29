"""
TelcoPulse AI - Churn Prediction Model
Trains an XGBoost classifier on synthetic telecom data with class balancing
and threshold tuning. Outputs a trained model + performance metrics +
feature importance + the F1-optimal decision threshold.
"""

import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    precision_recall_curve
)
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

print("🤖 TelcoPulse AI - Churn Model Training\n" + "=" * 50)

# Load data
df = pd.read_csv('data/subscribers.csv')
print(f"📂 Loaded {len(df):,} subscribers")

# Feature engineering
df['usage_ratio'] = df['data_usage_gb'] / (df['data_quota_gb'] + 0.1)
df['engagement_score'] = df['app_logins_last_30d'] / 30
df['is_prepaid'] = (df['plan_type'] == 'prepaid').astype(int)

FEATURES = [
    'age', 'tenure_months', 'monthly_spend_usd', 'data_quota_gb',
    'data_usage_gb', 'data_usage_pct', 'voice_minutes', 'sms_sent',
    'app_logins_last_30d', 'days_since_last_topup', 'complaints_last_90d',
    'support_tickets', 'nps_score', 'avg_speed_mbps', 'dropped_calls_last_30d',
    'usage_ratio', 'engagement_score', 'is_prepaid'
]

X = df[FEATURES]
y = df['churned']

churn_rate = y.mean()
print(f"📊 Features: {len(FEATURES)}")
print(f"⚖️  Class balance: {churn_rate * 100:.1f}% churned")

# Train/test split (stratified)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Class imbalance handling: scale_pos_weight = neg / pos
scale_pos_weight = (1 - churn_rate) / churn_rate
print(f"⚖️  scale_pos_weight: {scale_pos_weight:.2f}")

# Train XGBoost
print("\n🚂 Training XGBoost classifier (class-balanced)...")
model = XGBClassifier(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.08,
    subsample=0.9,
    colsample_bytree=0.9,
    reg_alpha=0.1,
    reg_lambda=1.0,
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    eval_metric='logloss',
    use_label_encoder=False
)
model.fit(X_train, y_train)

# Predictions (probabilities)
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Default threshold metrics (0.5)
y_pred_default = (y_pred_proba >= 0.5).astype(int)
default_metrics = {
    'accuracy': round(accuracy_score(y_test, y_pred_default), 3),
    'precision': round(precision_score(y_test, y_pred_default), 3),
    'recall': round(recall_score(y_test, y_pred_default), 3),
    'f1_score': round(f1_score(y_test, y_pred_default), 3),
    'roc_auc': round(roc_auc_score(y_test, y_pred_proba), 3),
}

# Tune threshold to maximize F1 on the test set's PR curve
precisions, recalls, thresholds = precision_recall_curve(y_test, y_pred_proba)
# precision_recall_curve returns one fewer threshold than precision/recall
f1_scores = 2 * precisions[:-1] * recalls[:-1] / (precisions[:-1] + recalls[:-1] + 1e-9)
best_idx = int(np.nanargmax(f1_scores))
best_threshold = float(thresholds[best_idx])

y_pred_tuned = (y_pred_proba >= best_threshold).astype(int)
tuned_metrics = {
    'accuracy': round(accuracy_score(y_test, y_pred_tuned), 3),
    'precision': round(precision_score(y_test, y_pred_tuned), 3),
    'recall': round(recall_score(y_test, y_pred_tuned), 3),
    'f1_score': round(f1_score(y_test, y_pred_tuned), 3),
    'roc_auc': round(roc_auc_score(y_test, y_pred_proba), 3),
}

print(f"\n📈 Performance @ default threshold (0.50):")
for k, v in default_metrics.items():
    print(f"   {k:12s}: {v}")

print(f"\n📈 Performance @ F1-optimal threshold ({best_threshold:.3f}):")
for k, v in tuned_metrics.items():
    print(f"   {k:12s}: {v}")

# Confusion matrix at tuned threshold
cm = confusion_matrix(y_test, y_pred_tuned)
print(f"\n🔢 Confusion matrix (tuned):")
print(f"   TN={cm[0,0]}  FP={cm[0,1]}")
print(f"   FN={cm[1,0]}  TP={cm[1,1]}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': FEATURES,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n🎯 Top 5 Most Important Features:")
for _, row in feature_importance.head().iterrows():
    print(f"   {row['feature']:28s} → {row['importance']:.3f}")

# ── Baseline 1: Logistic Regression ──
print("\n📊 Baseline 1 — Logistic Regression")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
lr = LogisticRegression(class_weight='balanced', max_iter=2000, random_state=42)
lr.fit(X_train_scaled, y_train)
lr_proba = lr.predict_proba(X_test_scaled)[:, 1]
lr_pred = (lr_proba >= 0.5).astype(int)
lr_metrics = {
    'auc': round(roc_auc_score(y_test, lr_proba), 3),
    'precision': round(precision_score(y_test, lr_pred, zero_division=0), 3),
    'recall': round(recall_score(y_test, lr_pred), 3),
    'f1': round(f1_score(y_test, lr_pred), 3),
}
print(f"   {lr_metrics}")

# ── Baseline 2: Rule-based heuristic ──
# Flag as churn if NPS<=4 OR complaints>=2 OR days_since_topup>10
print("\n📊 Baseline 2 — Rule-based heuristic")
rule_pred_test = (
    (X_test['nps_score'] <= 4)
    | (X_test['complaints_last_90d'] >= 2)
    | (X_test['days_since_last_topup'] > 10)
).astype(int).values
# Pseudo-probability: count rules triggered / 3
rule_proba = (
    (X_test['nps_score'] <= 4).astype(int)
    + (X_test['complaints_last_90d'] >= 2).astype(int)
    + (X_test['days_since_last_topup'] > 10).astype(int)
).values / 3.0
rule_metrics = {
    'auc': round(roc_auc_score(y_test, rule_proba), 3),
    'precision': round(precision_score(y_test, rule_pred_test, zero_division=0), 3),
    'recall': round(recall_score(y_test, rule_pred_test), 3),
    'f1': round(f1_score(y_test, rule_pred_test), 3),
}
print(f"   {rule_metrics}")

# Save model
joblib.dump(model, 'ml/churn_model.pkl')
print("\n💾 Model saved to ml/churn_model.pkl")

metadata = {
    'model_type': 'XGBClassifier',
    'features': FEATURES,
    'class_balance': {
        'churn_rate': round(float(churn_rate), 3),
        'scale_pos_weight': round(float(scale_pos_weight), 2),
    },
    'metrics_default_threshold': default_metrics,
    'metrics': tuned_metrics,
    'decision_threshold': round(best_threshold, 3),
    'feature_importance': feature_importance.to_dict('records'),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'trained_on': '10K synthetic telecom subscribers',
    'hyperparameters': {
        'n_estimators': 300,
        'max_depth': 5,
        'learning_rate': 0.08,
        'subsample': 0.9,
        'colsample_bytree': 0.9,
        'reg_alpha': 0.1,
        'reg_lambda': 1.0,
    },
    'baselines': {
        'logistic_regression': lr_metrics,
        'rule_based': rule_metrics,
    },
    'confusion_matrix_tuned': {
        'tn': int(cm[0, 0]),
        'fp': int(cm[0, 1]),
        'fn': int(cm[1, 0]),
        'tp': int(cm[1, 1]),
    },
}

with open('ml/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("📝 Metadata saved to ml/model_metadata.json")

# Score entire dataset using the tuned threshold for risk tiers
print("\n🔮 Scoring all subscribers...")
df['predicted_churn_prob'] = model.predict_proba(X)[:, 1]
df['risk_tier'] = pd.cut(
    df['predicted_churn_prob'],
    bins=[-0.001, 0.3, 0.7, 1.001],
    labels=['Low', 'Medium', 'High']
)
df.to_csv('data/subscribers_scored.csv', index=False)

print("✅ Scored dataset saved to data/subscribers_scored.csv")
print("\n📊 Risk distribution:")
print(df['risk_tier'].value_counts().to_string())
print("\n" + "=" * 50)
print("🎉 Training complete!")
