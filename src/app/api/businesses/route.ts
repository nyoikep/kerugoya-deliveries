
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('[API DEBUG] Fetching businesses...');
    const businesses = await prisma.business.findMany({
      include: {
        products: true,
      },
    });
    console.log(`[API DEBUG] Found ${businesses.length} businesses`);
    return NextResponse.json(businesses, { status: 200 });
  } catch (error: any) {
    console.error('[API DEBUG] BUSINESS FETCH ERROR:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
