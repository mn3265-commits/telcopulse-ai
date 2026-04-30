import { NextRequest, NextResponse } from 'next/server'
import { generatePersonaWithClaude } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { product, industry } = await req.json()
    if (!product || !industry) {
      return NextResponse.json(
        { success: false, error: 'product and industry are required' },
        { status: 400 }
      )
    }
    const persona = await generatePersonaWithClaude(product, industry)
    return NextResponse.json({ success: true, source: 'claude', persona })
  } catch (error: any) {
    if (error.message === 'NO_API_KEY') {
      return NextResponse.json(
        { success: false, error: 'NO_API_KEY' },
        { status: 503 }
      )
    }
    console.error('Persona generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
