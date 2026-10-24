import { PrismaClient } from "@prisma/client";

/** Prisma singleton — survives hot reload in dev. */
const globalForPrisma = globalThis as unknown as { __vzPrisma?: PrismaClient };

export const db =
  globalForPrisma.__vzPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__vzPrisma = db;
