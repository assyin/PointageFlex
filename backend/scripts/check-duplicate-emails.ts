import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateEmails() {
  console.log('🔍 Vérification des emails en double...\n');

  // Requête SQL pour trouver les emails en double
  const duplicates = await prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
    SELECT email, COUNT(*) as count
    FROM "User"
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length === 0) {
    console.log('✅ Aucun email en double trouvé. La contrainte unique peut être ajoutée en toute sécurité.\n');
  } else {
    console.log(`⚠️  ${duplicates.length} email(s) en double trouvé(s):\n`);
    for (const dup of duplicates) {
      console.log(`   - ${dup.email}: ${dup.count} occurrence(s)`);
    }
    console.log('\n❌ Vous devez corriger ces doublons avant d\'ajouter la contrainte unique.\n');
  }

  // Vérifier aussi les emails par tenant (ancienne contrainte unique)
  const duplicatesByTenant = await prisma.$queryRaw<Array<{ email: string; tenantId: string; count: bigint }>>`
    SELECT email, "tenantId", COUNT(*) as count
    FROM "User"
    WHERE "tenantId" IS NOT NULL
    GROUP BY email, "tenantId"
    HAVING COUNT(*) > 1
  `;

  if (duplicatesByTenant.length > 0) {
    console.log(`⚠️  ${duplicatesByTenant.length} email(s) en double par tenant trouvé(s):\n`);
    for (const dup of duplicatesByTenant) {
      console.log(`   - ${dup.email} dans tenant ${dup.tenantId}: ${dup.count} occurrence(s)`);
    }
  }

  await prisma.$disconnect();
}

checkDuplicateEmails()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  });

