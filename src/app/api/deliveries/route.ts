import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET handler to fetch all pending delivery requests
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let whereClause = {};
    if (decoded.role === 'CLIENT') {
      whereClause = { clientId: decoded.userId };
    } else if (decoded.role === 'RIDER') {
      whereClause = { riderId: decoded.userId };
    } else if (decoded.role === 'ADMIN') {
      whereClause = {}; // Admin sees all
    }

    const deliveryRequests = await prisma.deliveryRequest.findMany({
      where: whereClause,
      include: {
        client: { select: { name: true, phone: true, email: true } },
        rider: { select: { name: true, phone: true, motorcyclePlateNumber: true } },
        cartItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(deliveryRequests, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for creating a new delivery request
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { cartItems, clientLocation, destination, riderId, scheduledAt } = await req.json();

    if (!clientLocation || !destination) {
      return NextResponse.json({ message: 'Missing required fields: clientLocation, destination' }, { status: 400 });
    }

    const deliveryRequest = await prisma.deliveryRequest.create({
      data: {
        clientLocation: JSON.stringify(clientLocation),
        destination: JSON.stringify(destination),
        clientId: decoded.userId,
        riderId: riderId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: riderId ? 'ACCEPTED' : 'PENDING',
        cartItems: cartItems && cartItems.length > 0 ? {
          create: cartItems.map((item: { id: string; name: string; price: number; quantity: number }) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        } : undefined,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
        rider: true,
        client: true,
      },
    });

    // Access the Socket.IO instance from the global object
    const io = (global as any).io;

    if (io) {
        if (riderId) {
            // Notify the specific rider and the client
            io.emit('newDeliveryRequest', deliveryRequest); // Broadast or targeted
            io.to(deliveryRequest.id).emit('rideAccepted', {
                deliveryId: deliveryRequest.id,
                riderDetails: {
                    name: deliveryRequest.rider?.name,
                    phone: deliveryRequest.rider?.phone,
                    numberPlate: deliveryRequest.rider?.motorcyclePlateNumber,
                }
            });
        } else {
            // Emit a newDeliveryRequest event to all connected clients (riders)
            io.emit('newDeliveryRequest', deliveryRequest);
        }
    } 

    return NextResponse.json(deliveryRequest, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
