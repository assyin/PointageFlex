/**
 * Utilitaire pour générer des emails automatiques uniques
 */

/**
 * Génère un email automatique basé sur le matricule et le tenant
 * Format: {matricule}@{tenant-slug}.local
 * 
 * @param matricule Matricule de l'employé
 * @param tenantSlug Slug du tenant
 * @param prismaService Service Prisma pour vérifier l'unicité
 * @returns Email unique généré
 */
export async function generateUniqueEmail(
  matricule: string,
  tenantSlug: string,
  prismaService: any,
): Promise<string> {
  // Nettoyer le matricule (enlever caractères spéciaux, espaces)
  const cleanMatricule = matricule
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  // Format de base
  let email = `${cleanMatricule}@${tenantSlug}.local`;
  let counter = 0;
  let uniqueEmail = email;
  
  // Vérifier l'unicité et ajouter un suffixe si nécessaire
  while (true) {
    const existing = await prismaService.user.findFirst({
      where: { email: uniqueEmail },
    });
    
    if (!existing) {
      break; // Email unique trouvé
    }
    
    // Ajouter un suffixe numérique
    counter++;
    uniqueEmail = `${cleanMatricule}${counter}@${tenantSlug}.local`;
    
    // Sécurité : éviter les boucles infinies
    if (counter > 1000) {
      // Utiliser un timestamp comme fallback
      uniqueEmail = `${cleanMatricule}_${Date.now()}@${tenantSlug}.local`;
      break;
    }
  }
  
  return uniqueEmail;
}

