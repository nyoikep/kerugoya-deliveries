import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, password } = await req.json();

    if ((!email && !phone) || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let user;
    try {
      console.log(`[LOGIN DEBUG] Attempting login for email: ${email} or phone: ${phone}`);
      if (email) {
        user = await prisma.user.findUnique({
          where: { email },
        });
      } else if (phone) {
        user = await prisma.user.findUnique({
          where: { phone },
        });
      }
      console.log(`[LOGIN DEBUG] User found: ${user ? 'Yes' : 'No'}`);
    } catch (prismaError: any) {
      console.error('[LOGIN DEBUG] Prisma Query Error:', prismaError);
      throw prismaError;
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check account status
    if (user.status === 'PENDING') {
      return NextResponse.json({ message: 'Account pending approval. Please contact administrator.' }, { status: 403 });
    }
    if (user.status === 'REJECTED') {
      return NextResponse.json({ message: 'Account rejected. Please contact administrator.' }, { status: 403 });
    }

    // Generate JWT Token
    // Use fallback for development/demo safety
    const jwtSecret = process.env.JWT_SECRET || 'kerugoya_fallback_secret_2026';

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, phone: user.phone, name: user.name, idNumber: user.idNumber, motorcyclePlateNumber: user.motorcyclePlateNumber },
      jwtSecret,
      { expiresIn: '1d' },
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 200 });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: `Server error: ${error.message || 'Internal server error'}` }, { status: 500 });
  }
}
