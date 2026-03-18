// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Prevent multiple instances of PrismaClient in development
declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
});

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
