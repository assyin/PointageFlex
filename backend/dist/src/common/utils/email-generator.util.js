"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueEmail = generateUniqueEmail;
async function generateUniqueEmail(matricule, tenantSlug, prismaService) {
    const cleanMatricule = matricule
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
    let email = `${cleanMatricule}@${tenantSlug}.local`;
    let counter = 0;
    let uniqueEmail = email;
    while (true) {
        const existing = await prismaService.user.findFirst({
            where: { email: uniqueEmail },
        });
        if (!existing) {
            break;
        }
        counter++;
        uniqueEmail = `${cleanMatricule}${counter}@${tenantSlug}.local`;
        if (counter > 1000) {
            uniqueEmail = `${cleanMatricule}_${Date.now()}@${tenantSlug}.local`;
            break;
        }
    }
    return uniqueEmail;
}
//# sourceMappingURL=email-generator.util.js.map