import { defineConfig } from "prisma/config";

/**
 * Prisma CLI config (replaces the deprecated `package.json#prisma` block).
 * `npm run db:*` loads `.env.local` first via scripts/with-env.mjs.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
