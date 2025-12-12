import { PrismaClient, LegacyRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Get the existing tenant ID
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    console.error('No tenant found. Please create a tenant first.');
    return;
  }

  console.log(`Using tenant: ${tenant.companyName} (${tenant.id})`);

  // Default password for all test users
  const defaultPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Create test users
  const testUsers = [
    {
      email: 'employee@demo.com',
      firstName: 'Mohamed',
      lastName: 'Employee',
      role: LegacyRole.EMPLOYEE,
    },
    {
      email: 'manager@demo.com',
      firstName: 'Sara',
      lastName: 'Manager',
      role: LegacyRole.MANAGER,
    },
    {
      email: 'rh@demo.com',
      firstName: 'Fatima',
      lastName: 'RH',
      role: LegacyRole.ADMIN_RH,
    },
  ];

  console.log('\nCreating test users with password: Test123!');
  console.log('=========================================\n');

  for (const userData of testUsers) {
    // Check if user already exists
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

    // Create user
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

    // Create corresponding employee record for EMPLOYEE and MANAGER roles
    if (userData.role === LegacyRole.EMPLOYEE || userData.role === LegacyRole.MANAGER) {
      // Generate a unique matricule
      const matricule = `EMP${Date.now().toString().slice(-6)}`;

      await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          matricule: matricule,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          position: userData.role === LegacyRole.MANAGER ? 'Manager' : 'Employee',
          hireDate: new Date(),
          isActive: true,
        },
      });

      console.log(`✓ Created user and employee: ${userData.email} (${userData.role}) - Matricule: ${matricule}`);
    } else {
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
