import { NextRequest, NextResponse } from 'next/server'
import { generateSubscriberBriefWithClaude } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json()
    if (!sub || !sub.user_id) {
      return NextResponse.json(
        { success: false, error: 'subscriber payload is required' },
        { status: 400 }
      )
    }
    const brief = await generateSubscriberBriefWithClaude(sub)
    return NextResponse.json({ success: true, source: 'claude', brief })
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return NextResponse.json(
        { success: false, error: 'NO_API_KEY' },
        { status: 503 }
      )
    }
    console.error('Subscriber brief generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
