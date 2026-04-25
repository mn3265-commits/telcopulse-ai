export interface Subscriber {
  user_id: string
  phone: string
  age: number
  gender: 'M' | 'F'
  city: string
  registration_date: string
  tenure_months: number
  plan_type: 'prepaid' | 'postpaid'
  plan_name: string
  monthly_spend_usd: number
  data_quota_gb: number
  data_usage_gb: number
  data_usage_pct: number
  voice_minutes: number
  sms_sent: number
  app_logins_last_30d: number
  days_since_last_topup: number
  complaints_last_90d: number
  support_tickets: number
  nps_score: number
  avg_speed_mbps: number
  dropped_calls_last_30d: number
  device_brand: string
  churn_probability: number
  churned: 0 | 1
  predicted_churn_prob?: number
  risk_tier?: 'Low' | 'Medium' | 'High'
}

export interface Segment {
  id: string
  name: string
  description: string
  count: number
  criteria: Record<string, any>
  avgSpend: number
  churnRate: number
}

export interface Campaign {
  id: string
  name: string
  segment: string
  channel: 'sms' | 'email' | 'push'
  content: string
  subject?: string
  status: 'draft' | 'scheduled' | 'sent'
  predictedReach: number
  predictedConversion: number
  predictedRevenue: number
}

export interface AIInsight {
  type: 'churn' | 'opportunity' | 'anomaly' | 'recommendation'
  title: string
  description: string
  impact: string
  action: string
  priority: 'high' | 'medium' | 'low'
}
