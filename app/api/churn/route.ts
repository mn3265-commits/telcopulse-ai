import { NextRequest, NextResponse } from 'next/server'
import { predictCampaignImpact } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { campaign, segment } = await req.json()
    const prediction = await predictCampaignImpact(campaign, segment)
    return NextResponse.json({ success: true, prediction })
  } catch (error: any) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
