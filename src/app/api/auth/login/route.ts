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
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } else if (phone) {
      user = await prisma.user.findUnique({
        where: { phone },
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // --- Shopper exclusivity logic ---
    if (user.role === 'RIDER') {
      return NextResponse.json({ message: 'Riders must log in through the rider portal.' }, { status: 403 });
    }
    // ---------------------------------

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, phone: user.phone, name: user.name, idNumber: user.idNumber, motorcyclePlateNumber: user.motorcyclePlateNumber },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
