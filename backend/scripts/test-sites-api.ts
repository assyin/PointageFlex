import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testSitesAPI() {
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

    // 3. Faire une requête à l'API /sites
    const response = await fetch('http://localhost:3000/api/v1/sites', {
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

    const sitesResponse = await response.json();
    const sites = sitesResponse.data || sitesResponse || [];

    console.log('\n=== API Response ===');
    console.log(`Total sites returned: ${sites.length}`);
    console.log('\nSites:');
    sites.forEach((site: any, idx: number) => {
      console.log(`  ${idx + 1}. ${site.name} (${site.code}) - ID: ${site.id}`);
    });

    // Vérifier que seuls CPT Rabat et CPT Marrakech sont retournés
    const expectedSiteIds = [
      'a750887b-8ab8-4efa-b8f1-9437deec2401', // CPT Rabat
      '1bd2d545-1d6d-4b28-90bb-94248fdedb15', // CPT Marrakech
    ];

    const allExpected = sites.every((site: any) => expectedSiteIds.includes(site.id));
    const correctCount = sites.length === 2;

    console.log('\n=== Validation ===');
    console.log(`Should return exactly 2 sites: ${correctCount ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`Should only return CPT Rabat and CPT Marrakech: ${allExpected ? 'PASS ✓' : 'FAIL ✗'}`);

    if (!allExpected || !correctCount) {
      console.log('\n⚠️  UNEXPECTED SITES FOUND:');
      sites.forEach((site: any) => {
        if (!expectedSiteIds.includes(site.id)) {
          console.log(`  - ${site.name} (${site.id}) should NOT be visible!`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSitesAPI();
