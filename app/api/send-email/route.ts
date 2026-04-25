import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json()

    const gmailUser = process.env.GMAIL_ADDRESS
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({ success: false, error: 'Gmail credentials not configured' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: gmailUser,
      to,
      subject,
      text: body,
    })

    return NextResponse.json({ success: true, message: `Email sent to ${to}` })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
