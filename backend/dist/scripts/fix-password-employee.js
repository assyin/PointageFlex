"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function fixPasswordEmployee() {
    console.log('🔧 Réinitialisation du mot de passe pour employee@demo.com...\n');
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'employee@demo.com' },
        });
        if (!user) {
            console.log('❌ Utilisateur employee@demo.com n\'existe pas!');
            console.log('💡 Création de l\'utilisateur...');
            const tenant = await prisma.tenant.findFirst();
            if (!tenant) {
                console.error('❌ Aucun tenant trouvé. Créez d\'abord un tenant.');
                return;
            }
            const hashedPassword = await bcrypt.hash('Test123!', 10);
            const newUser = await prisma.user.create({
                data: {
                    email: 'employee@demo.com',
                    password: hashedPassword,
                    firstName: 'Mohamed',
                    lastName: 'Employee',
                    role: 'EMPLOYEE',
                    tenantId: tenant.id,
                    isActive: true,
                },
            });
            console.log('✅ Utilisateur créé avec succès!');
            console.log('   - ID:', newUser.id);
            console.log('   - Email:', newUser.email);
            console.log('   - Mot de passe: Test123!');
            return;
        }
        console.log('✅ Utilisateur trouvé:', user.email);
        console.log('   - ID:', user.id);
        console.log('   - Actif:', user.isActive);
        console.log('   - Tenant:', user.tenantId);
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                isActive: true,
            },
        });
        console.log('✅ Mot de passe réinitialisé avec succès!');
        console.log('   - Nouveau mot de passe: Test123!');
        const verifyPassword = await bcrypt.compare('Test123!', hashedPassword);
        if (verifyPassword) {
            console.log('✅ Vérification: Le mot de passe fonctionne!');
        }
        else {
            console.log('❌ ERREUR: Le mot de passe ne fonctionne pas après réinitialisation!');
        }
        console.log('\n📋 Identifiants de connexion:');
        console.log('   Email: employee@demo.com');
        console.log('   Mot de passe: Test123!');
        console.log('\n💡 IMPORTANT: Redémarrez le backend après cette modification!');
    }
    catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error(error);
    }
    finally {
        await prisma.$disconnect();
    }
}
fixPasswordEmployee();
//# sourceMappingURL=fix-password-employee.js.map