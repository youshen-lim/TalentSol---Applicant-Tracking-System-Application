import { PrismaClient } from '@prisma/client';

// Create a global variable to store the Prisma client
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a single instance of Prisma client
export const prisma = globalThis.__prisma || new PrismaClient();

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
