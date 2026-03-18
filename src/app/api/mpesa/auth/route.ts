import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const oauthUrl = process.env.MPESA_SAFARICOM_OAUTH_URL;

    if (!consumerKey || !consumerSecret || !oauthUrl) {
      return NextResponse.json(
        { message: 'M-Pesa Consumer Key, Secret, or OAuth URL not configured.' },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetch(oauthUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get M-Pesa access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error getting M-Pesa access token:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
