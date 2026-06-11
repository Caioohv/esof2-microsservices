const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      id: 'plan-basic-001',
      name: 'Básico',
      price: 49.90,
      features: ['Até 5 produtos', 'Suporte por email', 'Agendamentos ilimitados'],
      duration_days: 30,
    },
    {
      id: 'plan-pro-001',
      name: 'Profissional',
      price: 99.90,
      features: ['Até 30 produtos', 'Suporte prioritário', 'Agendamentos ilimitados', 'Destaque na busca'],
      duration_days: 30,
    },
    {
      id: 'plan-premium-001',
      name: 'Premium',
      price: 199.90,
      features: ['Produtos ilimitados', 'Suporte 24/7', 'Agendamentos ilimitados', 'Destaque na busca', 'Analytics avançado'],
      duration_days: 30,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {},
      create: plan,
    });
    console.log(`[seed] plano criado/verificado: ${plan.name}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
