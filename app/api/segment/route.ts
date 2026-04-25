import { NextRequest, NextResponse } from 'next/server'
import { segmentCustomersFromQuery } from '@/lib/claude'

const COLUMNS = [
  'age', 'gender', 'city', 'tenure_months', 'plan_type', 'plan_name',
  'monthly_spend_usd', 'data_quota_gb', 'data_usage_gb', 'data_usage_pct',
  'voice_minutes', 'sms_sent', 'app_logins_last_30d', 'days_since_last_topup',
  'complaints_last_90d', 'nps_score', 'avg_speed_mbps', 'dropped_calls_last_30d',
  'device_brand', 'predicted_churn_prob', 'risk_tier'
]

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    const segment = await segmentCustomersFromQuery(query, COLUMNS)
    return NextResponse.json({ success: true, segment })
  } catch (error: any) {
    console.error('Segmentation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
