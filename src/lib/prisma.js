import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot-reloads in dev to avoid
// exhausting SQLite connections.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // SECURITY (2026-10-10): Prisma's own logger prints the full
    // invocation on validation errors — including submitted input,
    // which can be personal data — and raw error text. It is disabled
    // at the driver level. Failure visibility comes from the redacted
    // structured diagnostics in src/lib/api-errors.js, which log only
    // the error class, the Prisma code (a stable enum like "P2025")
    // and a request reference — never the message, stack or query.
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
