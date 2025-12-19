"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
const TENANT_SLUG = 'demo';
const SCHEDULE_START_DATE = '2025-12-10';
const SCHEDULE_END_DATE = '2025-12-25';
const ATTENDANCE_START_DATE = '2025-12-11';
const ATTENDANCE_END_DATE = '2025-12-20';
const DEPARTMENTS = [
    'SECURITE',
    'CIT',
    'CPT',
    'GAB',
    'IT',
    'TECHNIQUE',
    'FLEET',
    'RH',
    'ACHAT',
    'FINANCE',
    'DIRECTION',
];
const DEPARTMENT_FUNCTIONS = {
    SECURITE: [
        'INSPECTEUR GAB',
        'ADJOINT RESPONSABLE SECURITE',
        'AGENT BACK OFFICE INSPECTION C',
        'AGENT DE GARDE',
        'SUPERVISEUR SECURITE',
        'AGENT DE SECURITE',
        'INSPECTEUR TF',
        'Controleur ATM',
        'TECHNICIEN DE SURFACE',
    ],
    CPT: [
        'CHEF D\'EQUIPE',
        'ASSISTANTE CPT',
        'OPERATRICE DE SAISIE CPT',
        'RESPONSABLE CHAMBRE FORTE',
        'OPERATRICE',
        'ASSISTANT(E) CHEF D\'EQUIPE',
        'OPERATEUR',
    ],
    CIT: [
        'AGENT DE RECEPTION',
        'RESPONSABLE REGIONAL TF',
        'ASSISTANT TF',
        'AGENT TRANSPORT DE FONDS',
        'ASSISTANT GASOIL',
        'DISPATCH TF',
    ],
    GAB: [
        'SUPERVISEUR GAB',
        'AGENT GAB',
        'MAGASINIER',
    ],
    IT: [
        'INFORMATICIEN',
    ],
    TECHNIQUE: [
        'TECHNICIEN',
    ],
    FLEET: [
        'TECHNICIEN DE MAINTENANCE',
    ],
    RH: [
        'Asistant(E) RH',
    ],
    ACHAT: [],
    FINANCE: [],
    DIRECTION: [],
};
const FIRST_NAMES = [
    'Ahmed', 'Fatima', 'Mohamed', 'Aicha', 'Hassan', 'Sanae', 'Youssef', 'Khadija',
    'Omar', 'Nadia', 'Ali', 'Samira', 'Karim', 'Leila', 'Amine', 'Salma',
    'Mehdi', 'Nour', 'Rachid', 'Houda', 'Bilal', 'Imane', 'Said', 'Meriem',
    'Tarik', 'Souad', 'Nabil', 'Zineb', 'Reda', 'Asma', 'Anass', 'Hafsa',
];
const LAST_NAMES = [
    'BENALI', 'ALAMI', 'IDRISSI', 'BENNANI', 'AMRANI', 'CHAKIR', 'EL FASSI',
    'BERRADA', 'LAHLOU', 'EL OUAZZANI', 'BENJELLOUN', 'TAZI', 'EL ALAOUI',
    'BENNIS', 'EL KHATIB', 'BOUAZZA', 'CHERKAOUI', 'EL HAMDAOUI', 'FADILI',
    'GHANNOUM', 'HADRI', 'JAZOULI', 'KADIRI', 'LAMRANI', 'MADANI', 'NAJI',
];
function generateRandomName() {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return { firstName, lastName };
}
function generateMatricule(departmentCode, functionCode, index, type = 'EMP') {
    const deptCode = departmentCode.substring(0, 3).toUpperCase();
    const funcCode = functionCode.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const num = String(index).padStart(3, '0');
    return `${type}-${deptCode}-${funcCode}-${num}`;
}
function generateEmail(matricule, tenantSlug) {
    const cleanMatricule = matricule.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanMatricule}@${tenantSlug}.test`;
}
async function main() {
    console.log('🚀 Démarrage de la création de la structure complète...\n');
    const tenant = await prisma.tenant.findUnique({
        where: { slug: TENANT_SLUG },
        include: {
            sites: true,
            shifts: true,
            holidays: {
                where: {
                    date: {
                        gte: new Date(SCHEDULE_START_DATE),
                        lte: new Date(SCHEDULE_END_DATE),
                    },
                },
            },
        },
    });
    if (!tenant) {
        throw new Error(`Tenant avec le slug "${TENANT_SLUG}" non trouvé`);
    }
    console.log(`✅ Tenant trouvé: ${tenant.companyName}`);
    console.log(`   Sites: ${tenant.sites.length}`);
    console.log(`   Shifts: ${tenant.shifts.length}`);
    console.log(`   Jours fériés: ${tenant.holidays.length}\n`);
    if (tenant.sites.length === 0) {
        throw new Error('Aucun site trouvé pour ce tenant. Veuillez créer au moins un site.');
    }
    const shifts = await prisma.shift.findMany({
        where: { tenantId: tenant.id },
    });
    const shiftMatin = shifts.find(s => s.name.toLowerCase().includes('matin') || s.code === 'M');
    const shiftSoir = shifts.find(s => s.name.toLowerCase().includes('soir') || s.code === 'S');
    const shiftNuit = shifts.find(s => s.name.toLowerCase().includes('nuit') || s.code === 'N');
    if (!shiftMatin) {
        throw new Error('Shift Matin non trouvé. Veuillez créer un shift Matin.');
    }
    console.log(`✅ Shifts trouvés:`);
    console.log(`   Matin: ${shiftMatin.name} (${shiftMatin.startTime} - ${shiftMatin.endTime})`);
    if (shiftSoir)
        console.log(`   Soir: ${shiftSoir.name} (${shiftSoir.startTime} - ${shiftSoir.endTime})`);
    if (shiftNuit)
        console.log(`   Nuit: ${shiftNuit.name} (${shiftNuit.startTime} - ${shiftNuit.endTime})`);
    console.log('');
    console.log('📁 Création des départements...');
    const existingDepartments = await prisma.department.findMany({
        where: { tenantId: tenant.id },
    });
    const departmentMap = new Map();
    for (const deptName of DEPARTMENTS) {
        const existing = existingDepartments.find(d => d.name.toUpperCase() === deptName.toUpperCase());
        if (existing) {
            console.log(`   ⏭️  Département "${deptName}" existe déjà (ID: ${existing.id})`);
            departmentMap.set(deptName, existing.id);
        }
        else {
            const dept = await prisma.department.create({
                data: {
                    tenantId: tenant.id,
                    name: deptName,
                    code: deptName.substring(0, 3).toUpperCase(),
                },
            });
            console.log(`   ✅ Département "${deptName}" créé (ID: ${dept.id})`);
            departmentMap.set(deptName, dept.id);
        }
    }
    console.log('');
    console.log('💼 Création des fonctions/postes...');
    const positionMap = new Map();
    for (const [deptName, functions] of Object.entries(DEPARTMENT_FUNCTIONS)) {
        const deptId = departmentMap.get(deptName);
        if (!deptId)
            continue;
        for (const funcName of functions) {
            const positionKey = `${deptName}-${funcName}`;
            const existing = await prisma.position.findFirst({
                where: {
                    tenantId: tenant.id,
                    name: funcName,
                    category: deptName,
                },
            });
            if (existing) {
                console.log(`   ⏭️  Fonction "${funcName}" (${deptName}) existe déjà`);
                positionMap.set(positionKey, existing.id);
            }
            else {
                const position = await prisma.position.create({
                    data: {
                        tenantId: tenant.id,
                        name: funcName,
                        code: funcName.substring(0, 10).toUpperCase().replace(/\s/g, ''),
                        category: deptName,
                        description: `${funcName} - Département ${deptName}`,
                    },
                });
                console.log(`   ✅ Fonction "${funcName}" (${deptName}) créée`);
                positionMap.set(positionKey, position.id);
            }
        }
    }
    console.log('');
    console.log('👥 Création des employés...');
    const employeeMap = new Map();
    let employeeCounter = 1;
    const roleEmployee = await prisma.role.findFirst({
        where: { tenantId: tenant.id, code: 'EMPLOYEE' },
    });
    const roleManager = await prisma.role.findFirst({
        where: { tenantId: tenant.id, code: 'MANAGER' },
    });
    if (!roleEmployee || !roleManager) {
        throw new Error('Rôles EMPLOYEE ou MANAGER non trouvés. Veuillez initialiser le RBAC.');
    }
    const defaultPassword = await bcrypt.hash('Test123!', 10);
    for (const [deptName, functions] of Object.entries(DEPARTMENT_FUNCTIONS)) {
        const deptId = departmentMap.get(deptName);
        if (!deptId)
            continue;
        console.log(`   📦 Département: ${deptName}`);
        const { firstName: mgrFirstName, lastName: mgrLastName } = generateRandomName();
        const mgrMatricule = generateMatricule(deptName, 'MANAGER', 1, 'MGR');
        const mgrEmail = generateEmail(mgrMatricule, TENANT_SLUG);
        let mgrEmployee = await prisma.employee.findFirst({
            where: {
                tenantId: tenant.id,
                matricule: mgrMatricule,
            },
        });
        if (mgrEmployee) {
            console.log(`      ⏭️  Manager département existe déjà: ${mgrEmployee.firstName} ${mgrEmployee.lastName} (${mgrMatricule})`);
        }
        else {
            let mgrUser = await prisma.user.findUnique({ where: { email: mgrEmail } });
            if (!mgrUser) {
                mgrUser = await prisma.user.create({
                    data: {
                        email: mgrEmail,
                        password: defaultPassword,
                        firstName: mgrFirstName,
                        lastName: mgrLastName,
                        tenantId: tenant.id,
                        role: 'MANAGER',
                        isActive: true,
                    },
                });
            }
            const existingRole = await prisma.userTenantRole.findFirst({
                where: {
                    userId: mgrUser.id,
                    tenantId: tenant.id,
                    roleId: roleManager.id,
                },
            });
            if (!existingRole) {
                await prisma.userTenantRole.create({
                    data: {
                        userId: mgrUser.id,
                        tenantId: tenant.id,
                        roleId: roleManager.id,
                    },
                });
            }
            mgrEmployee = await prisma.employee.create({
                data: {
                    tenantId: tenant.id,
                    matricule: mgrMatricule,
                    firstName: mgrFirstName,
                    lastName: mgrLastName,
                    email: mgrEmail,
                    phone: `+212612${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
                    departmentId: deptId,
                    siteId: tenant.sites[0].id,
                    position: `Manager ${deptName}`,
                    hireDate: new Date('2024-01-01'),
                    isActive: true,
                    userId: mgrUser.id,
                },
            });
            console.log(`      ✅ Manager département créé: ${mgrFirstName} ${mgrLastName} (${mgrMatricule})`);
        }
        await prisma.department.update({
            where: { id: deptId },
            data: { managerId: mgrEmployee.id },
        });
        employeeMap.set(`MGR-${deptName}`, { id: mgrEmployee.id, departmentId: deptId, siteId: tenant.sites[0].id });
        console.log(`      ✅ Manager département créé: ${mgrFirstName} ${mgrLastName} (${mgrMatricule})`);
        for (let siteIndex = 0; siteIndex < tenant.sites.length; siteIndex++) {
            const site = tenant.sites[siteIndex];
            const { firstName: mgrRegFirstName, lastName: mgrRegLastName } = generateRandomName();
            const mgrRegMatricule = generateMatricule(deptName, 'MGR-REG', siteIndex + 1, 'MGR_REG');
            const mgrRegEmail = generateEmail(mgrRegMatricule, TENANT_SLUG);
            let mgrRegEmployee = await prisma.employee.findFirst({
                where: {
                    tenantId: tenant.id,
                    matricule: mgrRegMatricule,
                },
            });
            if (mgrRegEmployee) {
                console.log(`      ⏭️  Manager régional existe déjà pour ${site.name}: ${mgrRegEmployee.firstName} ${mgrRegEmployee.lastName} (${mgrRegMatricule})`);
            }
            else {
                let mgrRegUser = await prisma.user.findUnique({ where: { email: mgrRegEmail } });
                if (!mgrRegUser) {
                    mgrRegUser = await prisma.user.create({
                        data: {
                            email: mgrRegEmail,
                            password: defaultPassword,
                            firstName: mgrRegFirstName,
                            lastName: mgrRegLastName,
                            tenantId: tenant.id,
                            role: 'MANAGER',
                            isActive: true,
                        },
                    });
                }
                const existingRegRole = await prisma.userTenantRole.findFirst({
                    where: {
                        userId: mgrRegUser.id,
                        tenantId: tenant.id,
                        roleId: roleManager.id,
                    },
                });
                if (!existingRegRole) {
                    await prisma.userTenantRole.create({
                        data: {
                            userId: mgrRegUser.id,
                            tenantId: tenant.id,
                            roleId: roleManager.id,
                        },
                    });
                }
                mgrRegEmployee = await prisma.employee.create({
                    data: {
                        tenantId: tenant.id,
                        matricule: mgrRegMatricule,
                        firstName: mgrRegFirstName,
                        lastName: mgrRegLastName,
                        email: mgrRegEmail,
                        phone: `+212612${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
                        departmentId: deptId,
                        siteId: site.id,
                        position: `Manager Régional ${deptName}`,
                        hireDate: new Date('2024-01-01'),
                        isActive: true,
                        userId: mgrRegUser.id,
                    },
                });
                const existingSiteManager = await prisma.siteManager.findUnique({
                    where: {
                        siteId_departmentId: {
                            siteId: site.id,
                            departmentId: deptId,
                        },
                    },
                });
                if (!existingSiteManager) {
                    await prisma.siteManager.create({
                        data: {
                            tenantId: tenant.id,
                            siteId: site.id,
                            managerId: mgrRegEmployee.id,
                            departmentId: deptId,
                        },
                    });
                }
                console.log(`      ✅ Manager régional créé pour ${site.name}: ${mgrRegFirstName} ${mgrRegLastName} (${mgrRegMatricule})`);
            }
            employeeMap.set(`MGR-REG-${deptName}-${site.id}`, { id: mgrRegEmployee.id, departmentId: deptId, siteId: site.id });
        }
        for (const funcName of functions) {
            const positionId = positionMap.get(`${deptName}-${funcName}`);
            if (!positionId)
                continue;
            for (const site of tenant.sites) {
                for (let i = 1; i <= 7; i++) {
                    const { firstName, lastName } = generateRandomName();
                    const matricule = generateMatricule(deptName, funcName, employeeCounter);
                    const email = generateEmail(matricule, TENANT_SLUG);
                    let employee = await prisma.employee.findFirst({
                        where: {
                            tenantId: tenant.id,
                            matricule,
                        },
                    });
                    if (!employee) {
                        let user = await prisma.user.findUnique({ where: { email } });
                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    password: defaultPassword,
                                    firstName,
                                    lastName,
                                    tenantId: tenant.id,
                                    role: 'EMPLOYEE',
                                    isActive: true,
                                },
                            });
                        }
                        const existingEmpRole = await prisma.userTenantRole.findFirst({
                            where: {
                                userId: user.id,
                                tenantId: tenant.id,
                                roleId: roleEmployee.id,
                            },
                        });
                        if (!existingEmpRole) {
                            await prisma.userTenantRole.create({
                                data: {
                                    userId: user.id,
                                    tenantId: tenant.id,
                                    roleId: roleEmployee.id,
                                },
                            });
                        }
                        employee = await prisma.employee.create({
                            data: {
                                tenantId: tenant.id,
                                matricule,
                                firstName,
                                lastName,
                                email,
                                phone: `+212612${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
                                departmentId: deptId,
                                siteId: site.id,
                                position: funcName,
                                positionId,
                                hireDate: new Date('2024-01-01'),
                                isActive: true,
                                userId: user.id,
                            },
                        });
                    }
                    employeeMap.set(`${deptName}-${funcName}-${site.id}-${i}`, { id: employee.id, departmentId: deptId, siteId: site.id });
                    employeeCounter++;
                }
                console.log(`      ✅ 7 employés créés pour "${funcName}" sur ${site.name}`);
            }
        }
        console.log('');
    }
    console.log(`✅ Total employés créés: ${employeeCounter - 1}\n`);
    console.log('📅 Création des plannings...');
    const scheduleStart = new Date(SCHEDULE_START_DATE);
    const scheduleEnd = new Date(SCHEDULE_END_DATE);
    const holidays = tenant.holidays.map(h => new Date(h.date).toISOString().split('T')[0]);
    let scheduleCount = 0;
    for (const [key, emp] of employeeMap.entries()) {
        let shiftId = shiftMatin.id;
        if (key.includes('CPT-') && !key.includes('MGR')) {
            const shifts = [shiftMatin, shiftSoir, shiftNuit].filter(s => s !== null);
            if (shifts.length > 0) {
                shiftId = shifts[Math.floor(Math.random() * shifts.length)].id;
            }
        }
        const dates = [];
        const current = new Date(scheduleStart);
        while (current <= scheduleEnd) {
            const dateStr = current.toISOString().split('T')[0];
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && !holidays.includes(dateStr)) {
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        const presenceRate = key.includes('MGR') ? 1.0 : 0.8;
        for (const date of dates) {
            if (Math.random() < presenceRate) {
                try {
                    await prisma.schedule.create({
                        data: {
                            tenantId: tenant.id,
                            employeeId: emp.id,
                            shiftId,
                            date: date,
                        },
                    });
                    scheduleCount++;
                }
                catch (error) {
                    if (!error.message?.includes('Unique constraint') && !error.message?.includes('duplicate')) {
                        console.error(`   ⚠️  Erreur création planning: ${error.message}`);
                    }
                }
            }
        }
    }
    console.log(`✅ ${scheduleCount} plannings créés\n`);
    console.log('⏰ Création des pointages...');
    const attendanceStart = new Date(ATTENDANCE_START_DATE);
    const attendanceEnd = new Date(ATTENDANCE_END_DATE);
    let attendanceCount = 0;
    for (const [key, emp] of employeeMap.entries()) {
        const schedules = await prisma.schedule.findMany({
            where: {
                employeeId: emp.id,
                date: {
                    gte: attendanceStart,
                    lte: attendanceEnd,
                },
            },
            include: { shift: true },
        });
        for (const schedule of schedules) {
            const date = new Date(schedule.date);
            const shift = schedule.shift;
            const [startHour, startMin] = shift.startTime.split(':').map(Number);
            const [endHour, endMin] = shift.endTime.split(':').map(Number);
            const scenarios = [
                { name: 'Normal', probability: 0.7, late: 0, earlyLeave: 0, missingOut: false },
                { name: 'Retard', probability: 0.15, late: 5 + Math.floor(Math.random() * 45), earlyLeave: 0, missingOut: false },
                { name: 'Départ anticipé', probability: 0.08, late: 0, earlyLeave: 10 + Math.floor(Math.random() * 30), missingOut: false },
                { name: 'Retard + Départ anticipé', probability: 0.05, late: 5 + Math.floor(Math.random() * 20), earlyLeave: 10 + Math.floor(Math.random() * 20), missingOut: false },
                { name: 'Sortie manquante', probability: 0.02, late: 0, earlyLeave: 0, missingOut: true },
            ];
            const rand = Math.random();
            let selectedScenario = scenarios[0];
            let cumulative = 0;
            for (const scenario of scenarios) {
                cumulative += scenario.probability;
                if (rand <= cumulative) {
                    selectedScenario = scenario;
                    break;
                }
            }
            const inTime = new Date(date);
            const lateMinutes = selectedScenario.late;
            inTime.setHours(startHour + Math.floor(lateMinutes / 60), startMin + (lateMinutes % 60), 0, 0);
            try {
                await prisma.attendance.create({
                    data: {
                        tenantId: tenant.id,
                        employeeId: emp.id,
                        siteId: emp.siteId,
                        type: 'IN',
                        timestamp: inTime,
                        method: 'MANUAL',
                    },
                });
                attendanceCount++;
            }
            catch (error) {
                if (!error.message?.includes('Unique constraint') && !error.message?.includes('duplicate')) {
                    console.error(`   ⚠️  Erreur création pointage IN: ${error.message}`);
                }
            }
            if (!selectedScenario.missingOut) {
                const outTime = new Date(date);
                const totalWorkMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin) - shift.breakDuration;
                const actualWorkMinutes = totalWorkMinutes - selectedScenario.earlyLeave;
                const outTotalMinutes = (startHour * 60 + startMin) + lateMinutes + actualWorkMinutes + shift.breakDuration;
                outTime.setHours(Math.floor(outTotalMinutes / 60) % 24, outTotalMinutes % 60, 0, 0);
                if (shift.isNightShift && outTime.getHours() < startHour) {
                    outTime.setDate(outTime.getDate() + 1);
                }
                try {
                    await prisma.attendance.create({
                        data: {
                            tenantId: tenant.id,
                            employeeId: emp.id,
                            siteId: emp.siteId,
                            type: 'OUT',
                            timestamp: outTime,
                            method: 'MANUAL',
                        },
                    });
                    attendanceCount++;
                }
                catch (error) {
                    if (!error.message?.includes('Unique constraint') && !error.message?.includes('duplicate')) {
                        console.error(`   ⚠️  Erreur création pointage OUT: ${error.message}`);
                    }
                }
            }
        }
    }
    console.log(`✅ ${attendanceCount} pointages créés\n`);
    console.log('🎉 Création terminée avec succès !');
}
main()
    .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-structure-complete.js.map