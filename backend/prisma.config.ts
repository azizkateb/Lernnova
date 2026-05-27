import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Prisma CLI commands use DATABASE_URL even though app runtime uses
    // the PrismaMariaDb adapter with DB_* variables.
    url: env("DATABASE_URL"),
  },
});
