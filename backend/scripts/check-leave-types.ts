import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT_ID = '90fab0cc-8539-4566-8da7-8742e9b6937b';

async function main() {
  console.log('📋 Types de congés existants:\n');

  const types = await prisma.leaveType.findMany({
    where: { tenantId: TENANT_ID },
    select: { id: true, name: true, code: true, isPaid: true }
  });

  if (types.length === 0) {
    console.log('Aucun type de congé trouvé.\n');
  } else {
    types.forEach(t => {
      console.log(`  - ${t.name} (code: ${t.code}, payé: ${t.isPaid ? 'Oui' : 'Non'})`);
    });
  }

  // Vérifier si TELETRAVAIL et MISSION existent
  const hasTeletravail = types.some(t =>
    t.code?.toUpperCase().includes('TELETRAVAIL') ||
    t.code?.toUpperCase().includes('REMOTE') ||
    t.name?.toUpperCase().includes('TÉLÉTRAVAIL')
  );

  const hasMission = types.some(t =>
    t.code?.toUpperCase().includes('MISSION') ||
    t.name?.toUpperCase().includes('MISSION')
  );

  console.log('\n📊 Statut:');
  console.log(`  Télétravail: ${hasTeletravail ? '✅ Existe' : '❌ À créer'}`);
  console.log(`  Mission: ${hasMission ? '✅ Existe' : '❌ À créer'}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
