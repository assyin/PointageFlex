import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetDemoPasswords() {
  console.log('Reinitialisation des mots de passe de demonstration...\n');

  const users = [
    {
      email: 'admin@demo.com',
      password: 'Admin@123',
      name: 'Admin Demo',
    },
    {
      email: 'rh@demo.com',
      password: 'RH@12345',
      name: 'RH Demo',
    },
    {
      email: 'manager@demo.com',
      password: 'Manager@123',
      name: 'Manager Demo',
    },
    {
      email: 'employee@demo.com',
      password: 'Employee@123',
      name: 'Employee Demo',
    },
  ];

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const updated = await prisma.user.updateMany({
        where: { email: user.email },
        data: { password: hashedPassword },
      });

      if (updated.count > 0) {
        console.log(`OK ${user.email}: mot de passe reinitialise -> "${user.password}"`);
      } else {
        console.log(`WARN ${user.email}: utilisateur non trouve`);
      }
    } catch (error) {
      console.error(`ERR ${user.email}:`, error.message);
    }
  }

  console.log('\nReinitialisation terminee!');
  console.log('\nIdentifiants de connexion:');
  console.log('-------------------------------------');
  users.forEach((user) => {
    console.log(`Email: ${user.email}`);
    console.log(`Mot de passe: ${user.password}`);
    console.log('-------------------------------------');
  });
}

resetDemoPasswords()
  .catch((error) => {
    console.error('Erreur lors de la reinitialisation:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
