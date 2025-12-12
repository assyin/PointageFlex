-- Script SQL complet pour corriger tous les rôles
-- Exécutez ce script dans votre base de données PostgreSQL

-- 1. Corriger les rôles legacy dans la table User
UPDATE "User" SET role = 'ADMIN_RH' WHERE email = 'admin@demo.com';
UPDATE "User" SET role = 'ADMIN_RH' WHERE email = 'rh@demo.com';
UPDATE "User" SET role = 'MANAGER' WHERE email = 'manager@demo.com';
UPDATE "User" SET role = 'EMPLOYEE' WHERE email = 'employee@demo.com';

-- 2. Supprimer tous les UserTenantRole existants (ils sont incorrects)
DELETE FROM "UserTenantRole";

-- 3. Réassigner les bons rôles RBAC pour chaque utilisateur

-- Pour admin@demo.com (ADMIN_RH)
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
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = 'ADMIN_RH'
WHERE u.email = 'admin@demo.com' AND u."tenantId" IS NOT NULL;

-- Pour rh@demo.com (ADMIN_RH)
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
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = 'ADMIN_RH'
WHERE u.email = 'rh@demo.com' AND u."tenantId" IS NOT NULL;

-- Pour manager@demo.com (MANAGER)
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
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = 'MANAGER'
WHERE u.email = 'manager@demo.com' AND u."tenantId" IS NOT NULL;

-- Pour employee@demo.com (EMPLOYEE)
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
INNER JOIN "Role" r ON r."tenantId" = u."tenantId" AND r.code = 'EMPLOYEE'
WHERE u.email = 'employee@demo.com' AND u."tenantId" IS NOT NULL;

-- 4. Vérification: Afficher les rôles assignés
SELECT 
  u.email,
  u.role as legacy_role,
  r.code as rbac_role,
  r.name as role_name,
  utr."isActive",
  t."companyName" as tenant_name
FROM "User" u
LEFT JOIN "UserTenantRole" utr ON utr."userId" = u.id AND utr."isActive" = true
LEFT JOIN "Role" r ON r.id = utr."roleId"
LEFT JOIN "Tenant" t ON t.id = u."tenantId"
WHERE u.email IN ('admin@demo.com', 'rh@demo.com', 'manager@demo.com', 'employee@demo.com')
ORDER BY u.email;

