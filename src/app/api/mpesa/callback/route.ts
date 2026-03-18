import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you want to save transaction data

export async function POST(req: NextRequest) {
  try {
    const callbackData = await req.json();
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    // Safaricom sends two types of callbacks:
    // 1. A result-code 0 response (success or failure from their system)
    // 2. A final confirmation callback

    // Check for "STKCallback" object for transaction confirmation
    if (callbackData.Body && callbackData.Body.stkCallback) {
      const stkCallback = callbackData.Body.stkCallback;
      const merchantRequestID = stkCallback.MerchantRequestID;
      const checkoutRequestID = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;
      const amount = stkCallback.CallbackMetadata?.Item.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = stkCallback.CallbackMetadata?.Item.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = stkCallback.CallbackMetadata?.Item.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      // TODO: Implement logic to update your database with the transaction status
      // You would typically find the order associated with the `AccountReference`
      // passed during STK Push initiation and update its payment status.

      console.log(`STK Callback - MerchantRequestID: ${merchantRequestID}, ResultCode: ${resultCode}, Amount: ${amount}, Receipt: ${mpesaReceiptNumber}`);

      // Example: Save transaction to database (requires a Prisma model for transactions)
      // await prisma.mpesaTransaction.create({
      //   data: {
      //     merchantRequestID,
      //     checkoutRequestID,
      //     resultCode: String(resultCode),
      //     resultDesc,
      //     amount,
      //     mpesaReceiptNumber,
      //     transactionDate,
      //     phoneNumber,
      //     status: resultCode === 0 ? 'COMPLETED' : 'FAILED',
      //     // Link to order or user if applicable
      //   },
      // });

    } else {
      console.log('Unhandled M-Pesa Callback structure.');
    }

    // Always respond with a 200 OK to M-Pesa to acknowledge receipt
    return NextResponse.json({ message: 'Callback received successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing M-Pesa callback:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
