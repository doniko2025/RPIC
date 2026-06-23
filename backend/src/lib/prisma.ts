//backend/src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const g = global as unknown as { prisma: PrismaClient };

export const prisma =
  g.prisma ??
  new PrismaClient({
    log: process.env.APP_ENV === "development" ? ["query","error","warn"] : ["error"],
  });

if (process.env.APP_ENV !== "production") g.prisma = prisma;
