-- Migration manuelle pour RBAC Multi-Tenant (Version corrigée)
-- À exécuter dans votre base de données PostgreSQL

-- 1. Créer le nouvel enum LegacyRole
DO $$ BEGIN
    CREATE TYPE "LegacyRole" AS ENUM ('SUPER_ADMIN', 'ADMIN_RH', 'MANAGER', 'EMPLOYEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Migrer les données de Role vers LegacyRole
DO $$ 
BEGIN
    -- Vérifier si la colonne existe et a le type Role
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'role' 
        AND udt_name = 'Role'
    ) THEN
        ALTER TABLE "User" 
            ALTER COLUMN role TYPE "LegacyRole" USING role::text::"LegacyRole";
    END IF;
END $$;

-- 3. Modifier la table User
-- Rendre tenantId optionnel
ALTER TABLE "User" 
    ALTER COLUMN "tenantId" DROP NOT NULL;

-- Rendre role optionnel
ALTER TABLE "User" 
    ALTER COLUMN role DROP NOT NULL;

-- Supprimer l'ancienne contrainte unique (tenantId, email) si elle existe
ALTER TABLE "User" 
    DROP CONSTRAINT IF EXISTS "User_tenantId_email_key";

-- Ajouter la nouvelle contrainte unique sur email (global)
-- ATTENTION: Vérifiez d'abord qu'il n'y a pas d'emails en double !
-- Décommentez la ligne suivante après vérification :
-- ALTER TABLE "User" 
--     ADD CONSTRAINT "User_email_key" UNIQUE ("email");

-- 4. Créer les nouvelles tables RBAC

-- Table Role
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- Table Permission
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- Table RolePermission
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- Table UserTenantRole
CREATE TABLE IF NOT EXISTS "UserTenantRole" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserTenantRole_pkey" PRIMARY KEY ("id")
);

-- 5. Ajouter les index et contraintes uniques

-- Role
CREATE UNIQUE INDEX IF NOT EXISTS "Role_tenantId_code_key" ON "Role"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "Role_tenantId_idx" ON "Role"("tenantId");
CREATE INDEX IF NOT EXISTS "Role_code_idx" ON "Role"("code");

-- Permission
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_code_key" ON "Permission"("code");
CREATE INDEX IF NOT EXISTS "Permission_category_idx" ON "Permission"("category");
CREATE INDEX IF NOT EXISTS "Permission_code_idx" ON "Permission"("code");

-- RolePermission
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE INDEX IF NOT EXISTS "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- UserTenantRole
CREATE UNIQUE INDEX IF NOT EXISTS "UserTenantRole_userId_tenantId_roleId_key" ON "UserTenantRole"("userId", "tenantId", "roleId");
CREATE INDEX IF NOT EXISTS "UserTenantRole_userId_idx" ON "UserTenantRole"("userId");
CREATE INDEX IF NOT EXISTS "UserTenantRole_tenantId_idx" ON "UserTenantRole"("tenantId");
CREATE INDEX IF NOT EXISTS "UserTenantRole_roleId_idx" ON "UserTenantRole"("roleId");

-- 6. Ajouter les foreign keys (avec vérification pour éviter les erreurs)

-- Role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Role_tenantId_fkey'
    ) THEN
        ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" 
            FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- RolePermission
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RolePermission_roleId_fkey') THEN
        ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" 
            FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RolePermission_permissionId_fkey') THEN
        ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" 
            FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- UserTenantRole
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserTenantRole_userId_fkey') THEN
        ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserTenantRole_tenantId_fkey') THEN
        ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_tenantId_fkey" 
            FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserTenantRole_roleId_fkey') THEN
        ALTER TABLE "UserTenantRole" ADD CONSTRAINT "UserTenantRole_roleId_fkey" 
            FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. Ajouter l'index sur email pour User (si la contrainte unique n'est pas encore ajoutée)
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Note: La contrainte unique sur email doit être ajoutée manuellement après vérification des doublons

