-- Script SQL simple pour corriger les rôles RBAC
-- Exécutez ce script dans votre base de données PostgreSQL

-- 1. Supprimer tous les UserTenantRole existants (ils sont incorrects)
DELETE FROM "UserTenantRole";

-- 2. Pour chaque utilisateur, créer le bon UserTenantRole basé sur son rôle legacy
-- Note: Assurez-vous que les rôles existent dans la table Role pour chaque tenant

-- Pour ADMIN_RH
INSERT INTO "UserTenantRole" ("id", "userId", "tenantId", "roleId", "isActive", "assignedAt", "assignedBy")
SELECT 
  gen_random_uuid(),
  u.id,
  u."tenantId",
  r.id,
  true,
  NOW(),
  NULL
FROM "User" u
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = u.role
WHERE u.role = 'ADMIN_RH' AND u."tenantId" IS NOT NULL;

-- Pour MANAGER
INSERT INTO "UserTenantRole" ("id", "userId", "tenantId", "roleId", "isActive", "assignedAt", "assignedBy")
SELECT 
  gen_random_uuid(),
  u.id,
  u."tenantId",
  r.id,
  true,
  NOW(),
  NULL
FROM "User" u
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = u.role
WHERE u.role = 'MANAGER' AND u."tenantId" IS NOT NULL;

-- Pour EMPLOYEE
INSERT INTO "UserTenantRole" ("id", "userId", "tenantId", "roleId", "isActive", "assignedAt", "assignedBy")
SELECT 
  gen_random_uuid(),
  u.id,
  u."tenantId",
  r.id,
  true,
  NOW(),
  NULL
FROM "User" u
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = u.role
WHERE u.role = 'EMPLOYEE' AND u."tenantId" IS NOT NULL;

-- Pour SUPER_ADMIN (rôle système, tenantId peut être null dans Role)
INSERT INTO "UserTenantRole" ("id", "userId", "tenantId", "roleId", "isActive", "assignedAt", "assignedBy")
SELECT 
  gen_random_uuid(),
  u.id,
  u."tenantId",
  r.id,
  true,
  NOW(),
  NULL
FROM "User" u
INNER JOIN "Role" r ON r."tenantId" IS NULL AND r.code = 'SUPER_ADMIN'
WHERE u.role = 'SUPER_ADMIN' AND u."tenantId" IS NOT NULL;

-- Vérification: Afficher les rôles assignés
SELECT 
  u.email,
  u.role as legacy_role,
  r.code as rbac_role,
  r.name as role_name,
  utr."isActive"
FROM "User" u
LEFT JOIN "UserTenantRole" utr ON utr."userId" = u.id
LEFT JOIN "Role" r ON r.id = utr."roleId"
ORDER BY u.email;

