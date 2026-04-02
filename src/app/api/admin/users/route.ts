import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

async function isAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  
  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'kerugoya_fallback_secret_2026')
    );
    return payload.role === 'ADMIN';
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, phone, password, name, role } = await req.json();
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.replace(/\D/g, '').trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        name,
        role: role || 'CLIENT',
        status: 'APPROVED'
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'User ID required' }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
