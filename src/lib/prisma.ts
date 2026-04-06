// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  console.log(`[PRISMA DEBUG] Initializing with DB URL: ${dbUrl}`);
  
  // Since the schema is configured for SQLite, we should probably stick to it locally.
  // If the provided URL is NOT a file URL, but the schema is SQLite, Prisma will fail later.
  // However, Prisma 7 REQUIRES an adapter for SQLite.
  
  if (!dbUrl.startsWith('file:')) {
    console.warn(`[PRISMA WARNING] DATABASE_URL is not a file URL but the schema is SQLite: ${dbUrl}`);
    // We can fallback to the default SQLite if it's not a file URL
    dbUrl = 'file:./prisma/dev.db';
  }
  
  try {
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    return new PrismaClient({ adapter });
  } catch (e) {
    console.error('[PRISMA DEBUG] Failed to initialize SQLite adapter:', e);
    // In Prisma 7, this will fail if we don't provide an adapter or accelerateUrl
    return new PrismaClient({} as any);
  }
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
