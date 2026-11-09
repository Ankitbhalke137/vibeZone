import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "test-mocks/server-only.ts"),
    },
  },
  test: {
    include: ["lib/__tests__/**/*.test.ts", "app/api/__tests__/**/*.test.ts"],
    globals: true,
    // Use the fork pool for isolation and stability. The threads pool can
    // intermittently crash the worker pool in Vitest 5 when modules import
    // "server-only" or use Node-only APIs (jose, prisma, etc.).
    pool: "forks",
    env: {
      SESSION_SECRET: "test-secret-key-for-testing-only",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
});
