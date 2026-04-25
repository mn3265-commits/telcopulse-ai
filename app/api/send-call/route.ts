import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    const sid = process.env.TWILIO_SID
    const token = process.env.TWILIO_TOKEN
    const from = process.env.TWILIO_PHONE_FROM

    if (!sid || !token || !from) {
      return NextResponse.json({ success: false, error: 'Twilio credentials not configured' }, { status: 400 })
    }

    const client = twilio(sid, token)

    const twiml = `<Response><Say language="id-ID" voice="Polly.Siti">${message}</Say><Pause length="1"/><Say language="id-ID" voice="Polly.Siti">Terima kasih telah mendengarkan. Selamat tinggal.</Say></Response>`

    await client.calls.create({
      to: to.replace('****', '0000'), // masked numbers won't work, fallback
      from,
      twiml,
    })

    return NextResponse.json({ success: true, message: `Call initiated to ${to}` })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
