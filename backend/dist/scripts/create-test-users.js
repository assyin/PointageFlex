"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error('No tenant found. Please create a tenant first.');
        return;
    }
    console.log(`Using tenant: ${tenant.companyName} (${tenant.id})`);
    const defaultPassword = 'Test123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const testUsers = [
        {
            email: 'employee@demo.com',
            firstName: 'Mohamed',
            lastName: 'Employee',
            role: client_1.LegacyRole.EMPLOYEE,
        },
        {
            email: 'manager@demo.com',
            firstName: 'Sara',
            lastName: 'Manager',
            role: client_1.LegacyRole.MANAGER,
        },
        {
            email: 'rh@demo.com',
            firstName: 'Fatima',
            lastName: 'RH',
            role: client_1.LegacyRole.ADMIN_RH,
        },
    ];
    console.log('\nCreating test users with password: Test123!');
    console.log('=========================================\n');
    for (const userData of testUsers) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: userData.email,
                tenantId: tenant.id,
            },
        });
        if (existingUser) {
            console.log(`✓ User ${userData.email} already exists (${userData.role})`);
            continue;
        }
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                tenantId: tenant.id,
                isActive: true,
            },
        });
        if (userData.role === client_1.LegacyRole.EMPLOYEE || userData.role === client_1.LegacyRole.MANAGER) {
            const matricule = `EMP${Date.now().toString().slice(-6)}`;
            await prisma.employee.create({
                data: {
                    tenantId: tenant.id,
                    userId: user.id,
                    matricule: matricule,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    position: userData.role === client_1.LegacyRole.MANAGER ? 'Manager' : 'Employee',
                    hireDate: new Date(),
                    isActive: true,
                },
            });
            console.log(`✓ Created user and employee: ${userData.email} (${userData.role}) - Matricule: ${matricule}`);
        }
        else {
            console.log(`✓ Created user: ${userData.email} (${userData.role})`);
        }
    }
    console.log('\n=========================================');
    console.log('Test users created successfully!');
    console.log('\nLogin credentials:');
    console.log('==================');
    console.log('Employee: employee@demo.com / Test123!');
    console.log('Manager:  manager@demo.com / Test123!');
    console.log('RH:       rh@demo.com / Test123!');
    console.log('Admin:    admin@demo.com / (your existing password)');
}
main()
    .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-test-users.js.map