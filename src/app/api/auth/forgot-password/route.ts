// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendResetEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Simulate success for security
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${req.nextUrl.origin}/reset-password/${resetToken}`;
    
    // Attempt to send actual email
    await sendResetEmail(user.email, resetUrl);

    return NextResponse.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      debug_link: resetUrl // Always include for debugging as requested
    }, { status: 200 });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ message: `Failed to process request: ${error.message}` }, { status: 500 });
  }
}
