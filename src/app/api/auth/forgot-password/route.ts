// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto'; // Node.js crypto module for generating tokens
// In a real application, you would also import a mailer utility here

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // We don't want to expose whether an email exists in our system,
    // so we always send a success message if the email format is valid.
    if (!user) {
      // Simulate success for security reasons, even if user doesn't exist
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    // Generate a unique token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token and expiry to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In a real application, send an email to the user with the reset link:
    // const resetUrl = `${req.nextUrl.origin}/reset-password/${resetToken}`;
    // await sendEmail({ to: user.email, subject: 'Password Reset Request', text: `Please use this link to reset your password: ${resetUrl}` });

    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
