import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Request received:', request);
    const { name, email, company, phone, message, budget } = await request.json();

    const webhookUrl = process.env.MATTERMOST_CONTACT_WEBHOOK_URL;

    const payload = {
      text: `New newsletter subscription:
      Email: ${email}`
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Form submission sent to Mattermost' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to send to Mattermost' }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

