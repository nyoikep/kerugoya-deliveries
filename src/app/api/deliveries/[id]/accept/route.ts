// src/app/api/deliveries/[id]/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    if (!decoded || decoded.role !== 'RIDER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const deliveryId = id;
    const riderId = decoded.userId;

    const deliveryRequest = await prisma.deliveryRequest.update({
      where: { id: deliveryId },
      data: {
        riderId,
        status: 'ACCEPTED',
      },
      include: {
        rider: true,
        client: true,
      },
    });

    const rider = deliveryRequest.rider;

    if (rider) {
      const riderDetails = {
        name: rider.name,
        phone: rider.phone,
        numberPlate: rider.numberPlate,
      };

      const io = (global as any).io;
      if (io) {
        io.to(deliveryRequest.id).emit('rideAccepted', { 
            deliveryId: deliveryRequest.id, 
            riderDetails 
        });
      }
    }

    return NextResponse.json(deliveryRequest, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
