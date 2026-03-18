import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
  try {
    const { amount, phoneNumber, accountReference, transactionDesc } = await req.json();

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    const stkPushUrl = process.env.MPESA_STKPUSH_URL;
    const oauthUrl = process.env.MPESA_SAFARICOM_OAUTH_URL;

    if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl || !stkPushUrl || !oauthUrl) {
      return NextResponse.json(
        { message: 'M-Pesa credentials or URLs not fully configured in environment.' },
        { status: 500 }
      );
    }

    // 1. Get Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(oauthUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get M-Pesa access token: ${tokenResponse.status} - ${errorText}`);
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Initiate STK Push
    const timestamp = dayjs().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    const stkPushPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline', // Or 'CustomerBuyGoodsOnline'
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference, // e.g., order ID, user ID
      TransactionDesc: transactionDesc, // e.g., 'Payment for order XYZ'
    };

    const stkPushResponse = await fetch(stkPushUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(stkPushPayload),
    });

    const stkPushData = await stkPushResponse.json();

    if (stkPushData.ResponseCode === '0') {
      return NextResponse.json({ message: 'STK Push initiated successfully', data: stkPushData }, { status: 200 });
    } else {
      console.error('STK Push initiation failed:', stkPushData);
      return NextResponse.json(
        { message: 'STK Push initiation failed', error: stkPushData.ResponseDescription || 'Unknown error' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error initiating STK Push:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
