"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagerLevel = getManagerLevel;
exports.getManagedEmployeeIds = getManagedEmployeeIds;
async function getManagerLevel(prisma, userId, tenantId) {
    const employee = await prisma.employee.findFirst({
        where: {
            userId,
            tenantId,
        },
        select: {
            id: true,
        },
    });
    if (!employee) {
        return { type: null };
    }
    const managedDepartments = await prisma.department.findMany({
        where: {
            managerId: employee.id,
            tenantId,
        },
        select: {
            id: true,
        },
    });
    if (managedDepartments.length > 0) {
        return {
            type: 'DEPARTMENT',
            departmentId: managedDepartments[0].id,
        };
    }
    const managedSites = await prisma.site.findMany({
        where: {
            managerId: employee.id,
            tenantId,
        },
        select: {
            id: true,
        },
    });
    if (managedSites.length > 0) {
        return {
            type: 'SITE',
            siteId: managedSites[0].id,
        };
    }
    const managedTeams = await prisma.team.findMany({
        where: {
            managerId: employee.id,
            tenantId,
        },
        select: {
            id: true,
        },
    });
    if (managedTeams.length > 0) {
        return {
            type: 'TEAM',
            teamId: managedTeams[0].id,
        };
    }
    return { type: null };
}
async function getManagedEmployeeIds(prisma, managerLevel, tenantId) {
    if (!managerLevel.type) {
        return [];
    }
    const where = { tenantId, isActive: true };
    switch (managerLevel.type) {
        case 'DEPARTMENT':
            where.departmentId = managerLevel.departmentId;
            break;
        case 'SITE':
            where.siteId = managerLevel.siteId;
            break;
        case 'TEAM':
            where.teamId = managerLevel.teamId;
            break;
        default:
            return [];
    }
    const employees = await prisma.employee.findMany({
        where,
        select: { id: true },
    });
    return employees.map((e) => e.id);
}
//# sourceMappingURL=manager-level.util.js.map