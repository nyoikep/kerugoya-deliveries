// src/app/api/ratings/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { rating, comment, riderId, clientId } = await request.json();

    if (!rating || !riderId || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        comment,
        riderId,
        clientId,
      },
    });

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
