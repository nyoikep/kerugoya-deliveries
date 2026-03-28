import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const jwtSecret = process.env.JWT_SECRET || 'kerugoya_fallback_secret_2026';
    const decoded = jwt.verify(token, jwtSecret) as { role: string };
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: { in: ['RIDER', 'CLIENT'] },
        status: { in: ['PENDING', 'REJECTED'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        idNumber: true,
        motorcyclePlateNumber: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const jwtSecret = process.env.JWT_SECRET || 'kerugoya_fallback_secret_2026';
    const decoded = jwt.verify(token, jwtSecret) as { role: string };
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
