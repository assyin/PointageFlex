/**
 * Utilitaires pour la normalisation et la recherche de matricules
 * Permet de gérer les différences de format (avec/sans zéros à gauche)
 */

/**
 * Normalise un matricule en supprimant les zéros à gauche non significatifs
 * @param matricule - Le matricule à normaliser
 * @returns Le matricule normalisé (sans zéros à gauche)
 * 
 * @example
 * normalizeMatricule("03005") => "3005"
 * normalizeMatricule("000123") => "123"
 * normalizeMatricule("0") => "0" (garde "0" si c'est le seul caractère)
 * normalizeMatricule("ABC123") => "ABC123" (ne touche pas aux lettres)
 */
export function normalizeMatricule(matricule: string | number | null | undefined): string {
  if (!matricule) return '';
  
  const matriculeStr = String(matricule).trim();
  
  // Si le matricule est vide ou ne contient que des zéros, retourner "0"
  if (matriculeStr === '' || /^0+$/.test(matriculeStr)) {
    return '0';
  }
  
  // Supprimer les zéros à gauche uniquement si le matricule commence par des chiffres
  // Si le matricule contient des lettres, ne pas toucher
  if (/^\d+$/.test(matriculeStr)) {
    // C'est un nombre pur, supprimer les zéros à gauche
    return String(parseInt(matriculeStr, 10));
  }
  
  // Si le matricule contient des lettres ou autres caractères, le garder tel quel
  return matriculeStr;
}

/**
 * Génère toutes les variantes possibles d'un matricule avec des zéros à gauche
 * Utile pour rechercher un matricule normalisé dans une base qui peut contenir des zéros à gauche
 * 
 * @param normalizedMatricule - Le matricule normalisé (sans zéros à gauche)
 * @param maxLength - Longueur maximale à considérer (par défaut 10)
 * @returns Tableau des variantes possibles avec zéros à gauche
 * 
 * @example
 * generateMatriculeVariants("3005", 5) => ["3005", "03005", "003005", "0003005", "00003005"]
 */
export function generateMatriculeVariants(
  normalizedMatricule: string,
  maxLength: number = 10
): string[] {
  const variants: string[] = [normalizedMatricule];
  
  // Si ce n'est pas un nombre pur, retourner seulement la variante originale
  if (!/^\d+$/.test(normalizedMatricule)) {
    return variants;
  }
  
  // Générer des variantes avec des zéros à gauche
  // Commencer par ajouter un zéro, puis deux, puis trois, etc.
  for (let padding = 1; padding <= (maxLength - normalizedMatricule.length); padding++) {
    const variant = '0'.repeat(padding) + normalizedMatricule;
    variants.push(variant);
  }
  
  return variants;
}

/**
 * Trouve un employé par matricule en gérant les variations avec/sans zéros à gauche
 * Cette fonction normalise le matricule recherché et cherche toutes les variantes possibles
 * Utilise une approche hybride : recherche exacte + variantes + requête SQL brute pour normalisation
 * 
 * @param prisma - Instance Prisma
 * @param tenantId - ID du tenant
 * @param matriculeToFind - Matricule à rechercher (peut être avec ou sans zéros à gauche)
 * @returns L'employé trouvé ou null
 */
export async function findEmployeeByMatriculeFlexible(
  prisma: any,
  tenantId: string,
  matriculeToFind: string | number
): Promise<any | null> {
  const matriculeStr = String(matriculeToFind).trim();

  console.log(`[MatriculeUtil] 🔍 Recherche flexible du matricule: "${matriculeStr}" pour tenant: ${tenantId}`);

  // Si le matricule est vide, retourner null
  if (!matriculeStr || matriculeStr === '') {
    console.log('[MatriculeUtil] ❌ Matricule vide');
    return null;
  }

  // D'abord, essayer une recherche exacte avec le matricule tel quel
  console.log(`[MatriculeUtil] Étape 1: Recherche exacte avec "${matriculeStr}"`);
  let employee = await prisma.employee.findFirst({
    where: {
      tenantId,
      matricule: matriculeStr,
    },
  });

  if (employee) {
    console.log(`[MatriculeUtil] ✅ Trouvé par recherche exacte: ${employee.matricule} (${employee.firstName} ${employee.lastName})`);
    return employee;
  }

  // Normaliser le matricule recherché
  const normalizedMatricule = normalizeMatricule(matriculeToFind);
  console.log(`[MatriculeUtil] Étape 2: Normalisation "${matriculeStr}" → "${normalizedMatricule}"`);

  // Si le matricule normalisé est vide ou "0", retourner null
  if (!normalizedMatricule || normalizedMatricule === '0') {
    console.log('[MatriculeUtil] ❌ Matricule normalisé vide ou "0"');
    return null;
  }

  // Si le matricule normalisé est différent du matricule original, chercher avec la version normalisée
  if (normalizedMatricule !== matriculeStr) {
    console.log(`[MatriculeUtil] Étape 3: Recherche avec matricule normalisé "${normalizedMatricule}"`);
    employee = await prisma.employee.findFirst({
      where: {
        tenantId,
        matricule: normalizedMatricule,
      },
    });

    if (employee) {
      console.log(`[MatriculeUtil] ✅ Trouvé par normalisation: ${employee.matricule} (${employee.firstName} ${employee.lastName})`);
      return employee;
    }
  }

  // Générer toutes les variantes possibles avec zéros à gauche (jusqu'à 10 caractères)
  const variants = generateMatriculeVariants(normalizedMatricule, 10);

  // Ajouter aussi le matricule original dans les variantes au cas où
  if (!variants.includes(matriculeStr)) {
    variants.push(matriculeStr);
  }

  console.log(`[MatriculeUtil] Étape 4: Recherche avec ${variants.length} variantes:`, variants.slice(0, 5), '...');

  // Chercher l'employé avec toutes les variantes possibles
  employee = await prisma.employee.findFirst({
    where: {
      tenantId,
      matricule: {
        in: variants,
      },
    },
  });

  if (employee) {
    console.log(`[MatriculeUtil] ✅ Trouvé par variantes: ${employee.matricule} (${employee.firstName} ${employee.lastName})`);
    return employee;
  }
  
  // Si toujours pas trouvé, utiliser une requête SQL brute avec normalisation
  // Cette approche normalise les deux côtés (recherche et base) pour la comparaison
  // Utilise CAST pour convertir en entier et comparer (ignore les zéros à gauche)
  // Seulement si le matricule est numérique
  if (/^\d+$/.test(matriculeStr) || /^\d+$/.test(normalizedMatricule)) {
    console.log(`[MatriculeUtil] Étape 5: Recherche SQL avec CAST pour "${matriculeStr}"`);
    try {
      // Utiliser une requête SQL qui compare les valeurs numériques
      // Cela ignore automatiquement les zéros à gauche
      const result = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Employee"
        WHERE "tenantId" = ${tenantId}::text
        AND (
          "matricule" = ${matriculeStr}::text
          OR "matricule" = ${normalizedMatricule}::text
          OR (
            "matricule" ~ '^[0-9]+$'
            AND CAST("matricule" AS INTEGER) = CAST(${matriculeStr} AS INTEGER)
          )
          OR (
            "matricule" ~ '^[0-9]+$'
            AND CAST("matricule" AS INTEGER) = CAST(${normalizedMatricule} AS INTEGER)
          )
        )
        LIMIT 1
      `;

      if (result && result.length > 0) {
        // Convertir le résultat SQL en format Prisma
        const foundEmployee = await prisma.employee.findUnique({
          where: { id: result[0].id },
        });
        console.log(`[MatriculeUtil] ✅ Trouvé par SQL CAST: ${foundEmployee.matricule} (${foundEmployee.firstName} ${foundEmployee.lastName})`);
        return foundEmployee;
      }
    } catch (sqlError: any) {
      // Si la conversion en INTEGER échoue (matricule non numérique), ignorer cette approche
      // Cela peut arriver si le matricule contient des lettres ou si la syntaxe SQL est incorrecte
      console.warn(`[MatriculeUtil] Erreur lors de la recherche SQL pour ${matriculeStr}:`, sqlError?.message || sqlError);
    }
  }

  console.log(`[MatriculeUtil] ❌ Employé NON TROUVÉ pour le matricule "${matriculeStr}"`);
  return null;
}

