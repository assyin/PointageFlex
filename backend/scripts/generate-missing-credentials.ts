import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour générer un mot de passe sécurisé
function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  const allChars = lowercase + uppercase + numbers + special;
  let password = '';

  // Assurer au moins un caractère de chaque type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Remplir le reste
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function generateMissingCredentials() {
  console.log('🚀 Génération des credentials manquants pour les employés...\n');

  try {
    // Récupérer tous les employés qui ont un userId mais pas de UserCredentials
    const employees = await prisma.employee.findMany({
      where: {
        userId: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        credentials: true, // Charger les credentials existants
      },
    });

    console.log(`📊 Total employés avec compte: ${employees.length}`);

    // Filtrer ceux qui n'ont pas de credentials
    const employeesWithoutCredentials = employees.filter(emp => !emp.credentials);
    console.log(`❌ Employés sans credentials: ${employeesWithoutCredentials.length}\n`);

    if (employeesWithoutCredentials.length === 0) {
      console.log('✅ Tous les employés ont déjà des credentials!');
      return;
    }

    let created = 0;
    let errors = 0;

    for (const employee of employeesWithoutCredentials) {
      try {
        // Générer un mot de passe temporaire
        const password = generateSecurePassword(12);

        // Date d'expiration: 7 jours à partir de maintenant
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Créer les credentials
        await prisma.userCredentials.create({
          data: {
            userId: employee.userId!,
            employeeId: employee.id,
            email: employee.user!.email,
            password: password,
            expiresAt: expiresAt,
            viewCount: 0,
          },
        });

        created++;
        console.log(`✅ ${employee.matricule} - ${employee.firstName} ${employee.lastName}`);
        console.log(`   📧 Email: ${employee.user!.email}`);
        console.log(`   🔑 Password: ${password}`);
        console.log(`   ⏰ Expire le: ${expiresAt.toLocaleDateString('fr-FR')}\n`);

      } catch (error: any) {
        errors++;
        console.error(`❌ Erreur pour ${employee.matricule}: ${error.message}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Credentials créés: ${created}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log('='.repeat(60));

    if (created > 0) {
      console.log('\n⚠️  IMPORTANT:');
      console.log('Les mots de passe ci-dessus sont temporaires et expirent dans 7 jours.');
      console.log('Les employés devront les changer à leur première connexion.');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    throw error;
  }
}

generateMissingCredentials()
  .catch((error) => {
    console.error('Erreur lors de la génération:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
