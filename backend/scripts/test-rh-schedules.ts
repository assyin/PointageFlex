import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testRHSchedules() {
  try {
    // 1. Récupérer l'utilisateur RH
    const user = await prisma.user.findUnique({
      where: { email: 'rh@demo.com' },
      select: {
        id: true,
        email: true,
        tenantId: true,
      },
    });

    if (!user) {
      console.log('RH user not found!');
      return;
    }

    console.log('RH User found:', user.email);

    // 2. Vérifier s'il a un Employee lié
    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    console.log('Has Employee record:', employee ? 'Yes' : 'No (NULL)');

    // 3. Créer un JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: 'ADMIN_RH',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('JWT Token generated\n');

    // 4. Faire une requête à l'API /schedules
    const response = await fetch('http://localhost:3000/api/v1/schedules?startDate=2025-12-15&endDate=2025-12-21&limit=10000', {
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

    const schedulesResponse = await response.json();
    const schedules = schedulesResponse.data || [];

    console.log('=== API Response ===');
    console.log(`Total schedules returned: ${schedules.length}`);

    // Extraire les sites uniques
    const sitesSet = new Set<string>();
    const deptsSet = new Set<string>();

    schedules.forEach((schedule: any) => {
      if (schedule.employee?.site?.name) {
        sitesSet.add(schedule.employee.site.name);
      }
      if (schedule.employee?.department?.name) {
        deptsSet.add(schedule.employee.department.name);
      }
    });

    const sites = Array.from(sitesSet).sort();
    const departments = Array.from(deptsSet).sort();

    console.log('\nUnique departments in schedules:');
    departments.forEach((dept, idx) => {
      console.log(`  ${idx + 1}. ${dept}`);
    });

    console.log('\nUnique sites in schedules:');
    sites.forEach((site, idx) => {
      console.log(`  ${idx + 1}. ${site}`);
    });

    // Validation
    console.log('\n=== Validation ===');
    if (schedules.length === 0) {
      console.log('✗ FAIL - RH Admin should see ALL schedules, but got 0!');
      console.log('  This means RH cannot manage schedules properly.');
    } else if (sites.length < 2) {
      console.log('✗ FAIL - RH Admin should see multiple sites, but only got:', sites.length);
    } else {
      console.log('✓ PASS - RH Admin can see schedules from multiple sites:');
      console.log(`  Total: ${schedules.length} schedules`);
      console.log(`  Sites: ${sites.length} different sites`);
      console.log(`  Departments: ${departments.length} different departments`);
    }

    // Compter par site
    console.log('\nSchedules count by site:');
    const siteCounts: Record<string, number> = {};
    schedules.forEach((schedule: any) => {
      const siteName = schedule.employee?.site?.name || 'Unknown';
      siteCounts[siteName] = (siteCounts[siteName] || 0) + 1;
    });

    Object.entries(siteCounts).sort(([a], [b]) => a.localeCompare(b)).forEach(([site, count]) => {
      console.log(`  ${site}: ${count} schedule(s)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRHSchedules();
