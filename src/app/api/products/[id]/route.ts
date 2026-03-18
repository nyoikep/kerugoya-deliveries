// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET handler to fetch a single product by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update a product (by a business owner)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, description, price } = await req.json();

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (existingProduct.business.ownerId !== decoded.userId) {
      return NextResponse.json({ message: 'Forbidden: You do not own this product' }, { status: 403 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, description, price },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler to delete a product (by a business owner)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (existingProduct.business.ownerId !== decoded.userId) {
      return NextResponse.json({ message: 'Forbidden: You do not own this product' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}