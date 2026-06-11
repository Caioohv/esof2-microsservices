const { PrismaClient } = require('@prisma/client');

// Singleton: evita múltiplas instâncias do PrismaClient em hot-reload (dev)
// e garante que apenas um pool de conexões seja criado em produção.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
