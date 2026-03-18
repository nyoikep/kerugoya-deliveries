import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const riders = await prisma.user.findMany({
      where: {
        role: 'RIDER',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        motorcyclePlateNumber: true,
      },
    });
    return NextResponse.json(riders);
  } catch (error) {
    console.error('Error fetching riders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
