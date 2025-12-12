-- Script SQL pour corriger les rôles des utilisateurs
-- Ce script supprime les mauvais UserTenantRole et crée les bons

-- 1. Supprimer tous les UserTenantRole existants
DELETE FROM "UserTenantRole";

-- 2. Réassigner les rôles corrects basés sur le rôle legacy de l'utilisateur
-- Pour chaque utilisateur, trouver le bon rôle RBAC et créer le UserTenantRole

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
INNER JOIN "Role" r ON (r."tenantId" = u."tenantId" OR (r."tenantId" IS NULL AND u.role = 'SUPER_ADMIN'))
  AND r.code = u.role
WHERE u.role = 'ADMIN_RH' AND u."tenantId" IS NOT NULL AND u.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "UserTenantRole" utr 
    WHERE utr."userId" = u.id AND utr."tenantId" = u."tenantId" AND utr."roleId" = r.id
  );

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
WHERE u.role = 'MANAGER' AND u."tenantId" IS NOT NULL AND u.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "UserTenantRole" utr 
    WHERE utr."userId" = u.id AND utr."tenantId" = u."tenantId" AND utr."roleId" = r.id
  );

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
WHERE u.role = 'EMPLOYEE' AND u."tenantId" IS NOT NULL AND u.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "UserTenantRole" utr 
    WHERE utr."userId" = u.id AND utr."tenantId" = u."tenantId" AND utr."roleId" = r.id
  );

-- Pour SUPER_ADMIN
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
INNER JOIN "Role" r ON r."tenantId" IS NULL AND r.code = u.role
WHERE u.role = 'SUPER_ADMIN' AND u."tenantId" IS NOT NULL AND u.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "UserTenantRole" utr 
    WHERE utr."userId" = u.id AND utr."tenantId" = u."tenantId" AND utr."roleId" = r.id
  );

