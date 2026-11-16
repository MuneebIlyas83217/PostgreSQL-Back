import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI commands (migrations) should use the direct Neon URL when it
    // is available. `prisma generate` does not connect, so an empty string is
    // allowed there; runtime uses DATABASE_URL through the Neon adapter.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
