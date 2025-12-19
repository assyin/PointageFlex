"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config({ path: '.env' });
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🗑️  Suppression des pointages de pause des 7 derniers jours...\n');
    try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        console.log(`📅 Période: ${sevenDaysAgo.toISOString().split('T')[0]} au ${today.toISOString().split('T')[0]}\n`);
        const breakStartCount = await prisma.attendance.count({
            where: {
                type: client_1.AttendanceType.BREAK_START,
                timestamp: {
                    gte: sevenDaysAgo,
                    lte: today,
                },
            },
        });
        const breakEndCount = await prisma.attendance.count({
            where: {
                type: client_1.AttendanceType.BREAK_END,
                timestamp: {
                    gte: sevenDaysAgo,
                    lte: today,
                },
            },
        });
        const totalToDelete = breakStartCount + breakEndCount;
        console.log(`📊 Pointages à supprimer:`);
        console.log(`   - Début pause (BREAK_START): ${breakStartCount}`);
        console.log(`   - Fin pause (BREAK_END): ${breakEndCount}`);
        console.log(`   - Total: ${totalToDelete}\n`);
        if (totalToDelete === 0) {
            console.log('✅ Aucun pointage de pause à supprimer.\n');
            return;
        }
        const deletedBreakStart = await prisma.attendance.deleteMany({
            where: {
                type: client_1.AttendanceType.BREAK_START,
                timestamp: {
                    gte: sevenDaysAgo,
                    lte: today,
                },
            },
        });
        console.log(`✅ ${deletedBreakStart.count} pointages de début de pause supprimés`);
        const deletedBreakEnd = await prisma.attendance.deleteMany({
            where: {
                type: client_1.AttendanceType.BREAK_END,
                timestamp: {
                    gte: sevenDaysAgo,
                    lte: today,
                },
            },
        });
        console.log(`✅ ${deletedBreakEnd.count} pointages de fin de pause supprimés`);
        const totalDeleted = deletedBreakStart.count + deletedBreakEnd.count;
        console.log(`\n✅ Total supprimé: ${totalDeleted} pointages\n`);
        console.log('✅ Suppression terminée avec succès!\n');
    }
    catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=delete-break-punches.js.map