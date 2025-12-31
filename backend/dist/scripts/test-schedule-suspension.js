"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testSuspension() {
    try {
        console.log('Test de la fonctionnalité de suspension de planning par congé\n');
        const employee = await prisma.employee.findFirst({
            where: { matricule: 'TEMP-003' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                tenantId: true,
            },
        });
        if (!employee) {
            console.log('Employé non trouvé');
            return;
        }
        console.log('Employé:', employee.firstName, employee.lastName);
        console.log('ID:', employee.id);
        console.log('Tenant:', employee.tenantId);
        console.log();
        const shift = await prisma.shift.findFirst({
            where: {
                tenantId: employee.tenantId,
                code: 'NUIT',
            },
            select: {
                id: true,
                name: true,
                code: true,
            },
        });
        if (!shift) {
            console.log('Shift NUIT non trouvé');
            return;
        }
        console.log('Shift trouvé:', shift.name, '(', shift.code, ')');
        console.log('ID:', shift.id);
        console.log();
        const testDate = new Date(Date.UTC(2026, 0, 15, 0, 0, 0, 0));
        console.log('Création du planning de test pour:', testDate.toISOString().split('T')[0]);
        const existing = await prisma.schedule.findFirst({
            where: {
                employeeId: employee.id,
                date: testDate,
            },
        });
        if (existing) {
            console.log('\nUn planning existe déjà pour cette date');
            console.log('Status:', existing.status);
            console.log('Suspended by leave:', existing.suspendedByLeaveId || 'Non');
            console.log();
            if (existing.status === 'PUBLISHED' && !existing.suspendedByLeaveId) {
                console.log('Ce planning DEVRAIT être suspendu par le congé approuvé');
                console.log('ID du planning:', existing.id);
            }
            return;
        }
        const schedule = await prisma.schedule.create({
            data: {
                tenantId: employee.tenantId,
                employeeId: employee.id,
                shiftId: shift.id,
                date: testDate,
                status: 'PUBLISHED',
                publishedAt: new Date(),
            },
        });
        console.log('Planning créé avec succès');
        console.log('ID:', schedule.id);
        console.log('Date:', schedule.date.toISOString().split('T')[0]);
        console.log('Status:', schedule.status);
        console.log();
        const leave = await prisma.leave.findFirst({
            where: {
                employeeId: employee.id,
                status: 'APPROVED',
                startDate: { lte: testDate },
                endDate: { gte: testDate },
            },
            include: {
                leaveType: {
                    select: { name: true },
                },
            },
        });
        if (leave) {
            console.log('Congé approuvé trouvé qui couvre cette date:');
            console.log('Type:', leave.leaveType.name);
            console.log('Période:', leave.startDate.toISOString().split('T')[0], '->', leave.endDate.toISOString().split('T')[0]);
            console.log('ID:', leave.id);
            console.log();
            console.log('IMPORTANT: Le planning vient d\'être créé mais le congé était déjà approuvé.');
            console.log('Le système ne suspend automatiquement les plannings QUE lors de l\'approbation du congé.');
            console.log('Pour suspendre ce planning, vous devez:');
            console.log('  1. Rejeter puis ré-approuver le congé, OU');
            console.log('  2. Utiliser un script de migration pour suspendre rétroactivement');
        }
        else {
            console.log('Aucun congé approuvé ne couvre cette date');
        }
    }
    catch (error) {
        console.error('Erreur:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testSuspension();
//# sourceMappingURL=test-schedule-suspension.js.map