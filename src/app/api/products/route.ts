// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET handler to fetch all products or products by businessId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    let products;
    if (businessId) {
      products = await prisma.product.findMany({
        where: { businessId },
      });
    } else {
      products = await prisma.product.findMany();
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for creating a new product (by a business owner)
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

    // Check if the user owns a business to create products
    const business = await prisma.business.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!business) {
      return NextResponse.json({ message: 'User does not own a business' }, { status: 403 });
    }

    const { name, description, price } = await req.json();

    if (!name || !price) {
      return NextResponse.json({ message: 'Missing required fields: name, price' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        businessId: business.id,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
