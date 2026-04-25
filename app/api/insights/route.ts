import { NextRequest, NextResponse } from 'next/server'
import { generateInsights } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { stats } = await req.json()
    const result = await generateInsights(stats)
    return NextResponse.json({ success: true, insights: result.insights })
  } catch (error: any) {
    console.error('Insights error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
