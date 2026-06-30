const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma');

// Prisma 7 exige um driver adapter — `new PrismaClient()` puro lança erro.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

module.exports = new PrismaClient({ adapter });

