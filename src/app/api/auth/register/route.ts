import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, phone: rawPhone, password, name, role, idNumber, motorcyclePlateNumber, idCardUrl } = await req.json();
    const email = rawEmail?.toLowerCase().trim();
    const phone = rawPhone?.replace(/\D/g, '').trim();

    // Basic validation for all users
    if (!email || !phone || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields: email, phone, password, name' }, { status: 400 });
    }

    // Enforce 2 names validation
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return NextResponse.json({ message: 'Full Name must include at least two names.' }, { status: 400 });
    }

    // Additional validation for RIDER role
    if (role === 'RIDER') {
      if (!idNumber) {
        return NextResponse.json({ message: 'Riders must provide an ID Number' }, { status: 400 });
      }
      if (!motorcyclePlateNumber) {
        return NextResponse.json({ message: 'Riders must provide a Motorcycle Plate Number' }, { status: 400 });
      }
      if (!idCardUrl) {
        return NextResponse.json({ message: 'Riders must provide an ID Photo' }, { status: 400 });
      }
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
        status: 'APPROVED', // Automatic approval for all users including riders
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

    // Notify admin via Socket.IO
    const io = (global as any).io;
    if (io) {
      if (user.role === 'RIDER') {
        io.to('admin_room').emit('new_rider_registered', {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          motorcyclePlateNumber: user.motorcyclePlateNumber,
          createdAt: user.createdAt
        });
      }
    }

    return NextResponse.json({ ...userWithoutPassword, token }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: `Server error: ${error.message || 'Internal server error'}` }, { status: 500 });
  }
}
