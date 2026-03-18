export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: "file:./prisma/dev.db",
  },
  migrations: {
    seed: "ts-node --project prisma/tsconfig.json prisma/seed.ts",
  },
};
