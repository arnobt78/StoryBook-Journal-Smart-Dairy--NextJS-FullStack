/**
 * @file lib/db.ts
 *
 * WALKTHROUGH — Prisma PostgreSQL client singleton
 * ───────────────────────────────────────────────
 * Import `prisma` anywhere server-side needs DB access (pages, API routes, auth).
 * Dev hot-reload stores the client on `globalThis` so we don't exhaust connections.
 * Production: one client per serverless instance (Fluid Compute reuse).
 */
/**
 * Prisma singleton — reused across hot reloads in dev to avoid connection exhaustion.
 * All server data access (pages, API routes, auth) imports this single client.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
