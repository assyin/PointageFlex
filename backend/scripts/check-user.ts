import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  console.log('🔍 Vérification de l\'utilisateur employee@demo.com...\n');

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'employee@demo.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('❌ Utilisateur employee@demo.com n\'existe pas!');
      console.log('\n💡 Exécutez: npx ts-node scripts/fix-all-passwords.ts');
    } else {
      console.log('✅ Utilisateur trouvé:');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Nom:', user.firstName, user.lastName);
      console.log('   - Rôle:', user.role);
      console.log('   - Tenant ID:', user.tenantId);
      console.log('   - Actif:', user.isActive);
      console.log('   - Créé le:', user.createdAt);
      
      if (!user.isActive) {
        console.log('\n⚠️  ATTENTION: L\'utilisateur est inactif!');
      }
      
      if (!user.tenantId) {
        console.log('\n⚠️  ATTENTION: L\'utilisateur n\'a pas de tenant!');
      }
    }

    // Vérifier tous les utilisateurs de test
    console.log('\n📋 Tous les utilisateurs de test:');
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@demo.com', 'employee@demo.com', 'manager@demo.com', 'rh@demo.com'],
        },
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenantId: true,
      },
    });

    if (allUsers.length === 0) {
      console.log('❌ Aucun utilisateur de test trouvé!');
    } else {
      allUsers.forEach((u) => {
        console.log(`   - ${u.email} (${u.role}) - Actif: ${u.isActive} - Tenant: ${u.tenantId ? 'Oui' : 'Non'}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

