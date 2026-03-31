
import prisma from './src/lib/prisma';

async function diagnose() {
  console.log('--- Prisma Diagnosis ---');
  try {
    const userCount = await prisma.user.count();
    console.log('Connection successful. User count:', userCount);
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    if (admin) console.log('Admin role:', admin.role);
    
  } catch (error: any) {
    console.error('Prisma Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
