import { PrismaClient } from '@prisma/client';

// Initialize the Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Export the client
export default prisma;