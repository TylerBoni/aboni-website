import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('Request received:', request)
    const { name, email, company, phone, message, budget } =
      await request.json()

    const webhookUrl = process.env.DISCORD_CONTACT_WEBHOOK_URL

    if (!webhookUrl) {
      console.error(
        'DISCORD_CONTACT_WEBHOOK_URL environment variable is not set.',
      )
      return NextResponse.json(
        { message: 'Webhook URL not configured' },
        { status: 500 },
      )
    }

    const payload = {
      content: `**New contact form submission**
**Name:** ${name}
**Email:** ${email}
**Company:** ${company || '—'}
**Phone:** ${phone || '—'}
**Budget:** ${budget || '—'}
**Message:**
${message || '—'}`,
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      return NextResponse.json(
        { message: 'Form submission sent' },
        { status: 200 },
      )
    }

    const errText = await response.text().catch(() => '')
    console.error('Discord webhook error:', response.status, errText)
    return NextResponse.json(
      { message: 'Failed to send notification' },
      { status: 500 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
