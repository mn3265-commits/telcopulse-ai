import { NextRequest, NextResponse } from 'next/server'
import { generateLaunchPlanWithClaude } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { product, audience, budget } = await req.json()
    const plan = await generateLaunchPlanWithClaude(
      product || '',
      audience || '',
      budget || '$10K - $50K'
    )
    return NextResponse.json({ success: true, source: 'claude', plan })
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return NextResponse.json(
        { success: false, error: 'NO_API_KEY' },
        { status: 503 }
      )
    }
    console.error('Launch plan generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
