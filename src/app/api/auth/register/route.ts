import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 

export async function POST(req: NextRequest) {
  try {
    const { email, phone, password, name, role, idNumber, motorcyclePlateNumber, idCardUrl } = await req.json();

    // Basic validation for all users
    if (!email || !phone || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields: email, phone, password, name' }, { status: 400 });
    }

    // Additional validation for RIDER role
    if (role === 'RIDER' && !idNumber) {
      return NextResponse.json({ message: 'Riders must provide an ID Number' }, { status: 400 });
    }
    if (role === 'RIDER' && !motorcyclePlateNumber) {
      return NextResponse.json({ message: 'Riders must provide a Motorcycle Plate Number' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          ...(idNumber ? [{ idNumber }] : []),
          ...(motorcyclePlateNumber ? [{ motorcyclePlateNumber }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
      }
      if (existingUser.phone === phone) {
        return NextResponse.json({ message: 'User with this phone number already exists' }, { status: 409 });
      }
      if (idNumber && existingUser.idNumber === idNumber) {
        return NextResponse.json({ message: 'User with this ID Number already exists' }, { status: 409 });
      }
      if (motorcyclePlateNumber && existingUser.motorcyclePlateNumber === motorcyclePlateNumber) {
        return NextResponse.json({ message: 'User with this Motorcycle Plate Number already exists' }, { status: 409 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name,
        role: role || 'CLIENT',
        status: role === 'RIDER' ? 'PENDING' : 'APPROVED',
        idNumber: role === 'RIDER' ? idNumber : null,
        idCardUrl: role === 'RIDER' ? idCardUrl : null,
        motorcyclePlateNumber: role === 'RIDER' ? motorcyclePlateNumber : null,
      },
    });

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'kerugoya_fallback_secret_2026';

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, phone: user.phone, name: user.name, idNumber: user.idNumber, motorcyclePlateNumber: user.motorcyclePlateNumber }, 
      jwtSecret,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ ...userWithoutPassword, token }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: `Server error: ${error.message || 'Internal server error'}` }, { status: 500 });
  }
}
