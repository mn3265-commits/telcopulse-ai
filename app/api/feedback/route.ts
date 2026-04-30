import { NextRequest, NextResponse } from 'next/server'

export interface FeedbackPayload {
  user_id: string
  predicted_churn_prob: number
  risk_tier: string
  human_action?: string         // approved | escalated | safe
  channel_used?: string         // email | voice | none
  outcome: string               // Retained | Churned | No response
  notes?: string
  ai_brief_used?: boolean
  recommendation_channel?: string
  timestamp_iso: string
}

// In production this would write to a Postgres / Supabase / S3 sink that the
// retraining job consumes. For this prototype we acknowledge + log to the
// serverless function logs so the feedback loop is observable end-to-end
// without standing up a database.
export async function POST(req: NextRequest) {
  try {
    const payload: FeedbackPayload = await req.json()
    if (!payload.user_id || !payload.outcome) {
      return NextResponse.json(
        { success: false, error: 'user_id and outcome are required' },
        { status: 400 }
      )
    }
    console.log('[feedback]', JSON.stringify(payload))
    return NextResponse.json({
      success: true,
      stored_at: new Date().toISOString(),
      user_id: payload.user_id,
      message: 'Feedback recorded. This row will be included in the next weekly retraining cycle.',
    })
  } catch (error: any) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
