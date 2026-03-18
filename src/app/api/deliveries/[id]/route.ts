// src/app/api/deliveries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const deliveryId = id;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: 'Missing required field: status' }, { status: 400 });
    }

    const deliveryRequest = await prisma.deliveryRequest.findUnique({
        where: { id: deliveryId },
        include: {
            cartItems: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!deliveryRequest) {
        return NextResponse.json({ message: 'Delivery request not found' }, { status: 404 });
    }

    if (status === 'DELIVERED') {
        const totalCost = deliveryRequest.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const pointsToAdd = Math.floor(totalCost / 100);

        await prisma.user.update({
            where: { id: deliveryRequest.clientId },
            data: {
                loyaltyPoints: {
                    increment: pointsToAdd,
                },
            },
        });
    }

    const updatedDeliveryRequest = await prisma.deliveryRequest.update({
      where: { id: deliveryId },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedDeliveryRequest, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
