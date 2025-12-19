import { PrismaClient } from '@prisma/client';
import { getManagerLevel } from '../src/common/utils/manager-level.util';

const prisma = new PrismaClient();

async function testManagerLevel() {
  try {
    // Récupérer l'utilisateur emp0025@demo.local
    const user = await prisma.user.findUnique({
      where: { email: 'emp0025@demo.local' },
      select: {
        id: true,
        email: true,
        tenantId: true,
      },
    });

    if (!user) {
      console.log('User not found!');
      return;
    }

    console.log('User:', user);

    // Récupérer l'employé lié
    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.id,
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        tenantId: true,
      },
    });

    console.log('\nEmployee:', employee);

    if (user.tenantId && employee) {
      console.log('\n=== Testing getManagerLevel ===');
      const managerLevel = await getManagerLevel(
        prisma as any,
        user.id,
        user.tenantId,
      );
      console.log('\nManager Level:', JSON.stringify(managerLevel, null, 2));

      // Vérifier les SiteManager entries
      const siteManagers = await prisma.siteManager.findMany({
        where: {
          managerId: employee.id,
        },
        include: {
          site: {
            select: {
              name: true,
              code: true,
            },
          },
          department: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      console.log('\nSiteManager entries:', siteManagers.length);
      siteManagers.forEach((sm, idx) => {
        console.log(`\n  ${idx + 1}. Site: ${sm.site.name} (${sm.site.code})`);
        console.log(`     Department: ${sm.department.name} (${sm.department.code})`);
        console.log(`     SiteId: ${sm.siteId}`);
        console.log(`     DepartmentId: ${sm.departmentId}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testManagerLevel();
