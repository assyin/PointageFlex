import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testSchedulesAPI() {
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

    // 3. Faire une requête à l'API /schedules avec une date range
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

    console.log('\n=== API Response ===');
    console.log(`Total schedules returned: ${schedules.length}`);

    // Extraire les sites uniques des employés
    const sitesSet = new Set<string>();
    schedules.forEach((schedule: any) => {
      if (schedule.employee?.site?.name) {
        sitesSet.add(schedule.employee.site.name);
      }
    });

    const sites = Array.from(sitesSet).sort();

    console.log('\nUnique sites in schedules:');
    sites.forEach((site, idx) => {
      console.log(`  ${idx + 1}. ${site}`);
    });

    // Vérifier que seuls CPT Rabat et CPT Marrakech sont présents
    const expectedSites = ['CPT Marrakech', 'CPT Rabat'];
    const unexpectedSites = sites.filter(site => !expectedSites.includes(site));

    console.log('\n=== Validation ===');
    if (unexpectedSites.length === 0) {
      console.log('✓ PASS - Only expected sites found (CPT Rabat, CPT Marrakech)');
    } else {
      console.log('✗ FAIL - Unexpected sites found:');
      unexpectedSites.forEach(site => {
        console.log(`  - ${site}`);
      });
    }

    // Compter les schedules par site
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

testSchedulesAPI();
