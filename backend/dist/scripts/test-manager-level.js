"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const manager_level_util_1 = require("../src/common/utils/manager-level.util");
const prisma = new client_1.PrismaClient();
async function testManagerLevel() {
    try {
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
            const managerLevel = await (0, manager_level_util_1.getManagerLevel)(prisma, user.id, user.tenantId);
            console.log('\nManager Level:', JSON.stringify(managerLevel, null, 2));
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
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testManagerLevel();
//# sourceMappingURL=test-manager-level.js.map