import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET handler to fetch all available (unassigned) delivery requests
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
    if (!decoded || (decoded.role !== 'RIDER' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized access. Only riders can view available deliveries.' }, { status: 403 });
    }

    const availableRequests = await prisma.deliveryRequest.findMany({
      where: { 
        status: 'PENDING',
        riderId: null 
      },
      include: {
        client: { select: { name: true, phone: true, email: true } },
        cartItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(availableRequests, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
