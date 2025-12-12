"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function testLogin() {
    console.log('🔍 Test de connexion pour employee@demo.com...\n');
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'employee@demo.com' },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                role: true,
                tenantId: true,
                isActive: true,
            },
        });
        if (!user) {
            console.log('❌ Utilisateur employee@demo.com n\'existe pas!');
            return;
        }
        console.log('✅ Utilisateur trouvé:');
        console.log('   - ID:', user.id);
        console.log('   - Email:', user.email);
        console.log('   - Nom:', user.firstName, user.lastName);
        console.log('   - Rôle:', user.role);
        console.log('   - Tenant ID:', user.tenantId);
        console.log('   - Actif:', user.isActive);
        console.log('   - Password hash (premiers 20 caractères):', user.password.substring(0, 20) + '...');
        if (!user.isActive) {
            console.log('\n⚠️  PROBLÈME: L\'utilisateur est inactif!');
            return;
        }
        if (!user.tenantId) {
            console.log('\n⚠️  PROBLÈME: L\'utilisateur n\'a pas de tenant!');
            return;
        }
        console.log('\n🔐 Test du mot de passe "Test123!"...');
        const testPassword = 'Test123!';
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        if (isPasswordValid) {
            console.log('✅ Mot de passe VALIDE!');
        }
        else {
            console.log('❌ Mot de passe INVALIDE!');
            console.log('\n💡 Le hash dans la base de données ne correspond pas à "Test123!"');
            console.log('   Réinitialisation du mot de passe...');
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            console.log('✅ Mot de passe réinitialisé!');
            const isPasswordValidAfter = await bcrypt.compare(testPassword, hashedPassword);
            if (isPasswordValidAfter) {
                console.log('✅ Vérification: Le nouveau mot de passe fonctionne!');
            }
        }
        console.log('\n🔍 Vérification des doublons...');
        const allUsersWithEmail = await prisma.user.findMany({
            where: { email: 'employee@demo.com' },
            select: {
                id: true,
                email: true,
                tenantId: true,
                isActive: true,
            },
        });
        if (allUsersWithEmail.length > 1) {
            console.log(`⚠️  ATTENTION: ${allUsersWithEmail.length} utilisateurs trouvés avec cet email!`);
            allUsersWithEmail.forEach((u, index) => {
                console.log(`   ${index + 1}. ID: ${u.id}, Tenant: ${u.tenantId}, Actif: ${u.isActive}`);
            });
            console.log('\n💡 Le backend utilise findFirst() qui peut retourner le mauvais utilisateur!');
        }
        else {
            console.log('✅ Un seul utilisateur trouvé (pas de doublon)');
        }
        console.log('\n✅ Test terminé!');
        console.log('\n📋 Résumé:');
        console.log('   - Utilisateur existe:', user ? 'Oui' : 'Non');
        console.log('   - Utilisateur actif:', user?.isActive ? 'Oui' : 'Non');
        console.log('   - Tenant ID:', user?.tenantId || 'Manquant');
        console.log('   - Mot de passe valide:', isPasswordValid ? 'Oui' : 'Non');
    }
    catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error(error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testLogin();
//# sourceMappingURL=test-login.js.map