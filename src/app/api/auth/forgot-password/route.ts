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

    // In a development environment, we log the link to the console:
    const resetUrl = `${req.nextUrl.origin}/reset-password/${resetToken}`;
    console.log(`[PASSWORD RESET] Reset link for ${user.email}: ${resetUrl}`);

    // To send actual emails, you need to install nodemailer and provide SMTP credentials
    // import nodemailer from 'nodemailer';
    // const transporter = nodemailer.createTransport({ ...SMTP_CONFIG });
    // await transporter.sendMail({
    //   from: '"Kerugoya Deliveries" <noreply@kerugoya.com>',
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    // });

    return NextResponse.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      debug_link: process.env.NODE_ENV === 'development' ? resetUrl : undefined // Only for dev convenience
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
