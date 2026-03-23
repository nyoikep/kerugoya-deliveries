// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of PrismaClient in development
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Use SQLite only in development
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({
    url: 'file:./prisma/dev.db'
  });
  prisma = global.prisma || new PrismaClient({ adapter });
  global.prisma = prisma;
}

export default prisma;
