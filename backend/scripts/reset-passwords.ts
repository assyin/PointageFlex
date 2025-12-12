import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log('🔄 Réinitialisation des mots de passe...\n');

  const users = [
    {
      email: 'admin@demo.com',
      password: 'Admin@123',
      name: 'Admin Demo',
    },
    {
      email: 'employee@demo.com',
      password: 'Employee@123',
      name: 'Mohamed Employee',
    },
    {
      email: 'manager@demo.com',
      password: 'Manager@123',
      name: 'Sara Manager',
    },
    {
      email: 'rh@demo.com',
      password: 'Rh@123',
      name: 'Fatima zahra RH',
    },
    {
      email: 'superadmin@pointaflex.com',
      password: 'SuperAdmin@2024',
      name: 'Super Administrateur',
    },
  ];

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword },
      });

      console.log(`✅ ${user.name} (${user.email}): Mot de passe réinitialisé`);
    } catch (error) {
      console.error(`❌ Erreur pour ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Réinitialisation terminée!');
}

resetPasswords()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
