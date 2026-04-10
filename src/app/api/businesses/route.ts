
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('[API DEBUG] GET /api/businesses started');

    // Explicitly check prisma connection
    try {
      await prisma.$connect();
      console.log('[API DEBUG] Prisma connected successfully');
    } catch (connErr: any) {
      console.error('[API DEBUG] Prisma connection FAILED:', connErr);
      return NextResponse.json({ message: 'Database connection failed', error: connErr.message }, { status: 500 });
    }

    const businesses = await prisma.business.findMany({
      include: {
        products: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    console.log(`[API DEBUG] Query successful, found ${businesses.length} businesses`);
    return NextResponse.json(businesses, { status: 200 });
  } catch (error: any) {
    console.error('[API DEBUG] CRITICAL BUSINESS FETCH ERROR:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

