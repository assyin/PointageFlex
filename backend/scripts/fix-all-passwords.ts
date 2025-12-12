import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixAllPasswords() {
  console.log('🔄 Réinitialisation de tous les mots de passe...\n');

  const users = [
    {
      email: 'admin@demo.com',
      password: 'Admin@123',
      name: 'Admin Demo (SUPER_ADMIN)',
    },
    {
      email: 'employee@demo.com',
      password: 'Test123!',
      name: 'Mohamed Employee (EMPLOYEE)',
    },
    {
      email: 'manager@demo.com',
      password: 'Test123!',
      name: 'Sara Manager (MANAGER)',
    },
    {
      email: 'rh@demo.com',
      password: 'Test123!',
      name: 'Fatima RH (ADMIN_RH)',
    },
  ];

  for (const user of users) {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        console.log(`⚠️  Utilisateur ${user.email} n'existe pas. Création...`);
        
        // Trouver le tenant
        const tenant = await prisma.tenant.findFirst();
        if (!tenant) {
          console.error('❌ Aucun tenant trouvé. Créez d\'abord un tenant.');
          continue;
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Déterminer le rôle
        let role = 'EMPLOYEE';
        if (user.email === 'admin@demo.com') role = 'SUPER_ADMIN';
        else if (user.email === 'rh@demo.com') role = 'ADMIN_RH';
        else if (user.email === 'manager@demo.com') role = 'MANAGER';

        const firstName = user.name.split(' ')[0];
        const lastName = user.name.split(' ').slice(1).join(' ') || 'User';
        
        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            role: role as any,
            tenantId: tenant.id,
            isActive: true,
          },
        });

        console.log(`✅ ${user.name} créé avec succès`);
      } else {
        // Mettre à jour le mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 10);

        await prisma.user.update({
          where: { email: user.email },
          data: { password: hashedPassword },
        });

        console.log(`✅ ${user.name} (${user.email}): Mot de passe réinitialisé`);
      }
    } catch (error: any) {
      console.error(`❌ Erreur pour ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Réinitialisation terminée!');
  console.log('\n📋 Identifiants de connexion:');
  console.log('============================');
  console.log('SUPER_ADMIN: admin@demo.com / Admin@123');
  console.log('EMPLOYEE:    employee@demo.com / Test123!');
  console.log('MANAGER:     manager@demo.com / Test123!');
  console.log('ADMIN_RH:    rh@demo.com / Test123!');
  console.log('============================\n');
}

fixAllPasswords()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

