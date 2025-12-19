import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testDepartmentsAPI() {
  try {
    // 1. Récupérer l'utilisateur
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

    console.log('User found:', user.email);

    // 2. Créer un JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: 'MANAGER_REGIONAL',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('\nJWT Token generated');

    // 3. Faire une requête à l'API /departments
    const response = await fetch('http://localhost:3000/api/v1/departments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }

    const departments = await response.json();

    console.log('\n=== API Response ===');
    console.log(`Total departments returned: ${departments.length}`);
    console.log('\nDepartments:');
    departments.forEach((dept: any, idx: number) => {
      console.log(`  ${idx + 1}. ${dept.name} (${dept.code}) - ID: ${dept.id}`);
    });

    // Vérifier que seul le département CIT est retourné
    const citDeptId = '566199d4-c3c6-4a55-8ace-a4687c1b513e';
    const onlyCIT = departments.every((dept: any) => dept.id === citDeptId);

    console.log('\n=== Validation ===');
    console.log(`Should only return CIT department: ${onlyCIT ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`Expected department ID: ${citDeptId}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDepartmentsAPI();
