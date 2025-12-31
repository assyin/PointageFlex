"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkOvertime() {
    try {
        const employee = await prisma.employee.findFirst({
            where: { matricule: 'TEMP-004' },
            select: { id: true, firstName: true, lastName: true },
        });
        if (!employee) {
            console.log('Employé non trouvé');
            return;
        }
        console.log('Employé:', employee.firstName, employee.lastName);
        console.log();
        const targetDate = new Date(Date.UTC(2026, 0, 2, 0, 0, 0, 0));
        const schedule = await prisma.schedule.findFirst({
            where: {
                employeeId: employee.id,
                date: targetDate,
            },
            include: {
                shift: true,
            },
        });
        if (schedule) {
            console.log('Planning trouvé:');
            console.log('  Date:', schedule.date.toISOString().split('T')[0]);
            console.log('  Shift:', schedule.shift.name);
            console.log('  Horaires shift:', schedule.shift.startTime, '-', schedule.shift.endTime);
            console.log('  Custom horaires:', schedule.customStartTime || 'N/A', '-', schedule.customEndTime || 'N/A');
            console.log('  Pause:', schedule.shift.breakDuration, 'min');
            console.log();
        }
        else {
            console.log('Aucun planning trouvé pour cette date');
            console.log();
        }
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                timestamp: {
                    gte: new Date(Date.UTC(2026, 0, 2, 0, 0, 0, 0)),
                    lte: new Date(Date.UTC(2026, 0, 2, 23, 59, 59, 999)),
                },
            },
            orderBy: {
                timestamp: 'asc',
            },
        });
        console.log('Pointages:');
        attendances.forEach((a) => {
            const time = a.timestamp.toISOString();
            console.log('  ', a.type, ':', time.split('T')[1].substring(0, 8));
            if (a.type === 'OUT') {
                console.log('    hoursWorked:', a.hoursWorked?.toString());
                console.log('    overtimeMinutes:', a.overtimeMinutes);
            }
        });
        console.log();
        console.log('CALCUL ATTENDU:');
        if (schedule) {
            const startTime = schedule.customStartTime || schedule.shift.startTime;
            const endTime = schedule.customEndTime || schedule.shift.endTime;
            const breakDuration = schedule.shift.breakDuration || 0;
            console.log('  Horaires prévus:', startTime, '-', endTime);
            console.log('  Pause:', breakDuration, 'min');
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const expectedMinutes = (endH * 60 + endM) - (startH * 60 + startM) - breakDuration;
            const expectedHours = expectedMinutes / 60;
            console.log('  Durée prévue (sans pause):', expectedHours.toFixed(2), 'h');
            if (attendances.length === 2) {
                const inTime = attendances[0].timestamp;
                const outTime = attendances[1].timestamp;
                const actualMinutes = (outTime.getTime() - inTime.getTime()) / (1000 * 60);
                const actualHours = actualMinutes / 60;
                console.log();
                console.log('  Durée réelle (pointages):', actualHours.toFixed(2), 'h');
                console.log('  Différence:', (actualHours - expectedHours).toFixed(2), 'h');
                console.log('  Heures sup attendues:', Math.max(0, (actualHours - expectedHours) * 60).toFixed(0), 'min');
            }
        }
    }
    catch (error) {
        console.error('Erreur:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkOvertime();
//# sourceMappingURL=check-overtime-calculation.js.map