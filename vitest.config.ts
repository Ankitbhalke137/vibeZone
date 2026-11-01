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
    include: ["lib/__tests__/**/*.test.ts"],
    globals: true,
    env: {
      SESSION_SECRET: "test-secret-key-for-testing-only",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
});
