"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jwt = require("jsonwebtoken");
const prisma = new client_1.PrismaClient();
async function testDepartmentsAPI() {
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
        console.log('User found:', user.email);
        const token = jwt.sign({
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: 'MANAGER_REGIONAL',
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        console.log('\nJWT Token generated');
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
        departments.forEach((dept, idx) => {
            console.log(`  ${idx + 1}. ${dept.name} (${dept.code}) - ID: ${dept.id}`);
        });
        const citDeptId = '566199d4-c3c6-4a55-8ace-a4687c1b513e';
        const onlyCIT = departments.every((dept) => dept.id === citDeptId);
        console.log('\n=== Validation ===');
        console.log(`Should only return CIT department: ${onlyCIT ? 'PASS ✓' : 'FAIL ✗'}`);
        console.log(`Expected department ID: ${citDeptId}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testDepartmentsAPI();
//# sourceMappingURL=test-departments-api.js.map