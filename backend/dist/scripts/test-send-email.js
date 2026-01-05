"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const nodemailer = require("nodemailer");
const prisma = new client_1.PrismaClient();
const TEST_TENANT_ID = '340a6c2a-160e-4f4b-917e-6eea8fd5ff2d';
async function main() {
    console.log('📧 TEST ENVOI EMAIL RÉEL\n');
    console.log('='.repeat(50));
    try {
        const emailConfig = await prisma.emailConfig.findUnique({
            where: { tenantId: TEST_TENANT_ID },
        });
        if (!emailConfig) {
            console.log('❌ Aucune configuration EmailConfig trouvée');
            return;
        }
        console.log('\n📋 Configuration SMTP:');
        console.log(`   Provider: ${emailConfig.provider}`);
        console.log(`   Host: ${emailConfig.host}`);
        console.log(`   Port: ${emailConfig.port}`);
        console.log(`   Secure: ${emailConfig.secure}`);
        console.log(`   Username: ${emailConfig.username}`);
        console.log(`   From: ${emailConfig.fromName} <${emailConfig.fromEmail}>`);
        console.log(`   Enabled: ${emailConfig.enabled}`);
        if (!emailConfig.enabled) {
            console.log('\n⚠️ Les notifications sont désactivées');
            return;
        }
        console.log('\n🔧 Création du transporter SMTP...');
        const transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            auth: {
                user: emailConfig.username,
                pass: emailConfig.password,
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 15000,
        });
        console.log('🔍 Vérification de la connexion SMTP...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie!');
        console.log('\n📤 Envoi d\'un email de test...');
        const info = await transporter.sendMail({
            from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
            to: emailConfig.username,
            subject: '[TEST] Notification PointageFlex - Test automatisé',
            html: `
        <h2>🧪 Test de notification email</h2>
        <p>Ceci est un email de test envoyé automatiquement par le script de validation.</p>
        <hr>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Tenant:</strong> ${TEST_TENANT_ID}</p>
        <hr>
        <p style="color: green;">✅ Si vous recevez cet email, la configuration SMTP fonctionne correctement!</p>
      `,
        });
        console.log('✅ Email envoyé avec succès!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Accepted: ${info.accepted.join(', ')}`);
        await prisma.emailLog.create({
            data: {
                tenantId: TEST_TENANT_ID,
                to: emailConfig.username,
                subject: '[TEST] Notification PointageFlex - Test automatisé',
                type: 'TEST',
                status: 'sent',
            },
        });
        console.log('\n' + '='.repeat(50));
        console.log('✅ TEST RÉUSSI - Email envoyé et loggé');
        console.log('='.repeat(50));
    }
    catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.code)
            console.error(`   Code: ${error.code}`);
        if (error.command)
            console.error(`   Command: ${error.command}`);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-send-email.js.map