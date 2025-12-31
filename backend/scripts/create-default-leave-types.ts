import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour créer des types de congé par défaut pour un tenant existant
 * 
 * Usage:
 *   npx ts-node scripts/create-default-leave-types.ts [tenantId]
 * 
 * Si tenantId n'est pas fourni, le script utilisera le premier tenant trouvé
 */
async function createDefaultLeaveTypes() {
  try {
    // Récupérer le tenantId depuis les arguments de ligne de commande
    const tenantIdArg = process.argv[2];
    
    let tenantId: string;
    
    if (tenantIdArg) {
      // Vérifier que le tenant existe
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantIdArg },
        select: { id: true, companyName: true },
      });
      
      if (!tenant) {
        console.error(`❌ Tenant avec l'ID "${tenantIdArg}" non trouvé.`);
        process.exit(1);
      }
      
      tenantId = tenantIdArg;
      console.log(`📋 Utilisation du tenant: ${tenant.companyName} (${tenantId})\n`);
    } else {
      // Récupérer le premier tenant disponible
      const tenant = await prisma.tenant.findFirst({
        select: { id: true, companyName: true },
        orderBy: { createdAt: 'asc' },
      });
      
      if (!tenant) {
        console.error('❌ Aucun tenant trouvé dans la base de données.');
        console.log('\n💡 Créez d\'abord un tenant ou spécifiez un tenantId:');
        console.log('   npx ts-node scripts/create-default-leave-types.ts <tenantId>\n');
        process.exit(1);
      }
      
      tenantId = tenant.id;
      console.log(`📋 Utilisation du premier tenant trouvé: ${tenant.companyName} (${tenantId})\n`);
    }

    // Vérifier les types de congé existants
    const existingLeaveTypes = await prisma.leaveType.findMany({
      where: { tenantId },
      select: { code: true, name: true },
    });

    console.log(`📊 Types de congé existants: ${existingLeaveTypes.length}`);
    if (existingLeaveTypes.length > 0) {
      console.log('   Types existants:');
      existingLeaveTypes.forEach(lt => {
        console.log(`   - ${lt.name} (${lt.code})`);
      });
      console.log('');
    }

    // Types de congé par défaut
    const defaultLeaveTypes = [
      {
        name: 'Congé Payé',
        code: 'CP',
        isPaid: true,
        requiresDocument: false,
        maxDaysPerYear: 18,
      },
      {
        name: 'Congé Maladie',
        code: 'CM',
        isPaid: true,
        requiresDocument: true,
        maxDaysPerYear: null,
      },
      {
        name: 'Congé Maternité',
        code: 'CMAT',
        isPaid: true,
        requiresDocument: true,
        maxDaysPerYear: 98,
      },
      {
        name: 'Congé sans Solde',
        code: 'CSS',
        isPaid: false,
        requiresDocument: false,
        maxDaysPerYear: null,
      },
      {
        name: 'Congé Paternité',
        code: 'CPAT',
        isPaid: true,
        requiresDocument: true,
        maxDaysPerYear: 3,
      },
      {
        name: 'Congé Exceptionnel',
        code: 'CE',
        isPaid: false,
        requiresDocument: false,
        maxDaysPerYear: null,
      },
    ];

    // Filtrer les types qui existent déjà (par code)
    const existingCodes = new Set(existingLeaveTypes.map(lt => lt.code));
    const typesToCreate = defaultLeaveTypes.filter(lt => !existingCodes.has(lt.code));

    if (typesToCreate.length === 0) {
      console.log('✅ Tous les types de congé par défaut existent déjà.\n');
      return;
    }

    console.log(`📝 Création de ${typesToCreate.length} type(s) de congé...\n`);

    // Créer les types de congé
    for (const leaveType of typesToCreate) {
      try {
        const created = await prisma.leaveType.create({
          data: {
            ...leaveType,
            tenantId,
          },
        });
        console.log(`   ✅ ${created.name} (${created.code})`);
      } catch (error: any) {
        console.error(`   ❌ Erreur lors de la création de ${leaveType.name}: ${error.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ Types de congé créés avec succès !');
    console.log('═══════════════════════════════════════════════════════\n');

    // Afficher le résumé
    const allLeaveTypes = await prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    console.log(`📊 Total des types de congé pour ce tenant: ${allLeaveTypes.length}\n`);
    console.log('Types de congé disponibles:');
    allLeaveTypes.forEach(lt => {
      console.log(`   - ${lt.name} (${lt.code}) - ${lt.isPaid ? 'Payé' : 'Non payé'}`);
    });
    console.log('');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultLeaveTypes();

