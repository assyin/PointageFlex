"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new client_1.PrismaClient();
const DEMO_ACCOUNTS = [
    { email: 'admin@demo.com', password: 'Admin@123' },
    { email: 'rh@demo.com', password: 'Test123!' },
    { email: 'employee@demo.com', password: 'Test123!' },
    { email: 'manager@demo.com', password: 'Test123!' },
];
async function testLogin(email, password) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                password: true,
                isActive: true,
                tenantId: true,
            },
        });
        if (!user) {
            return {
                success: false,
                error: 'Utilisateur non trouvé',
            };
        }
        if (!user.isActive) {
            return {
                success: false,
                error: 'Compte désactivé',
            };
        }
        if (!user.password) {
            return {
                success: false,
                error: 'Mot de passe non défini',
            };
        }
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return {
                success: false,
                error: 'Mot de passe incorrect',
            };
        }
        const userTenantRoles = user.tenantId
            ? await prisma.userTenantRole.findMany({
                where: {
                    userId: user.id,
                    tenantId: user.tenantId,
                    isActive: true,
                },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            })
            : [];
        const roles = new Set();
        const permissions = new Set();
        userTenantRoles.forEach((utr) => {
            roles.add(utr.role.code);
            utr.role.permissions.forEach((rp) => {
                permissions.add(rp.permission.code);
            });
        });
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
                roles: Array.from(roles),
                permissions: Array.from(permissions),
            },
            token: token.substring(0, 50) + '...',
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}
async function main() {
    console.log('🔐 Test de connexion pour les comptes de démo...\n');
    console.log('========================================\n');
    for (const account of DEMO_ACCOUNTS) {
        console.log(`📧 Email: ${account.email}`);
        console.log(`🔑 Password: ${account.password}`);
        const result = await testLogin(account.email, account.password);
        if (result.success) {
            console.log(`✅ Connexion réussie!`);
            console.log(`   Nom: ${result.user.firstName} ${result.user.lastName}`);
            console.log(`   Rôle Legacy: ${result.user.role}`);
            console.log(`   Rôles RBAC: ${result.user.roles.join(', ') || 'Aucun'}`);
            console.log(`   Permissions: ${result.user.permissions.length} permission(s)`);
            console.log(`   Tenant ID: ${result.user.tenantId || 'Aucun'}`);
            console.log(`   Token: ${result.token}`);
        }
        else {
            console.log(`❌ Échec de connexion: ${result.error}`);
        }
        console.log('');
    }
    console.log('========================================');
    console.log('✅ Tests terminés!\n');
}
main()
    .catch((e) => {
    console.error('❌ Erreur globale:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test-demo-login.js.map