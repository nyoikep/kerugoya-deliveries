import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      userCount,
      message: 'If you see this, the server is running the latest code with @@map("User") support.'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'failed',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
