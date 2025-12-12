import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRoleValues() {
  console.log('🔍 Vérification des valeurs de rôle dans la table User...\n');

  // Récupérer toutes les valeurs de rôle distinctes
  const roles = await prisma.$queryRaw<Array<{ role: string; count: bigint }>>`
    SELECT role, COUNT(*) as count
    FROM "User"
    WHERE role IS NOT NULL
    GROUP BY role
    ORDER BY count DESC
  `;

  console.log('Valeurs de rôle trouvées :\n');
  for (const r of roles) {
    console.log(`   - ${r.role}: ${r.count} utilisateur(s)`);
  }

  // Vérifier les valeurs valides de LegacyRole
  const validRoles = ['SUPER_ADMIN', 'ADMIN_RH', 'MANAGER', 'EMPLOYEE'];
  const invalidRoles = roles.filter(r => !validRoles.includes(r.role));

  if (invalidRoles.length > 0) {
    console.log('\n⚠️  Valeurs de rôle invalides trouvées :\n');
    for (const r of invalidRoles) {
      console.log(`   - ${r.role}: ${r.count} utilisateur(s)`);
    }
    console.log('\n❌ Ces valeurs devront être corrigées avant la migration.\n');
  } else {
    console.log('\n✅ Toutes les valeurs de rôle sont valides pour LegacyRole.\n');
  }

  await prisma.$disconnect();
}

checkUserRoleValues()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  });

