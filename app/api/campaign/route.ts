import { NextRequest, NextResponse } from 'next/server'
import { generateMultiChannelCampaign } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const campaign = await generateMultiChannelCampaign(body)
    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error('Campaign generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
