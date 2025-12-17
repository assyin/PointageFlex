-- Script SQL pour ajouter les permissions de planning au rôle MANAGER
-- Exécutez ce script dans votre base de données PostgreSQL

-- Pour chaque tenant, ajouter les permissions schedule.create, schedule.update, schedule.delete, schedule.view_all au rôle MANAGER

DO $$
DECLARE
    tenant_record RECORD;
    manager_role_id TEXT;
    perm_record RECORD;
    permission_codes TEXT[] := ARRAY['schedule.view_all', 'schedule.create', 'schedule.update', 'schedule.delete'];
BEGIN
    -- Parcourir tous les tenants
    FOR tenant_record IN SELECT id, "companyName" FROM "Tenant" LOOP
        RAISE NOTICE 'Processing tenant: % (%)', tenant_record."companyName", tenant_record.id;
        
        -- Trouver le rôle MANAGER pour ce tenant
        SELECT id INTO manager_role_id
        FROM "Role"
        WHERE "tenantId" = tenant_record.id
          AND code = 'MANAGER'
          AND "isActive" = true
        LIMIT 1;
        
        IF manager_role_id IS NULL THEN
            RAISE NOTICE '  ⚠️  Rôle MANAGER non trouvé pour ce tenant';
            CONTINUE;
        END IF;
        
        RAISE NOTICE '  ✓ Rôle MANAGER trouvé: %', manager_role_id;
        
        -- Pour chaque permission
        FOR perm_record IN 
            SELECT id, code 
            FROM "Permission" 
            WHERE code = ANY(permission_codes)
              AND "isActive" = true
        LOOP
            -- Vérifier si la permission est déjà assignée
            IF NOT EXISTS (
                SELECT 1 
                FROM "RolePermission" 
                WHERE "roleId" = manager_role_id 
                  AND "permissionId" = perm_record.id
            ) THEN
                -- Ajouter la permission
                INSERT INTO "RolePermission" ("id", "createdAt", "roleId", "permissionId")
                VALUES (
                    gen_random_uuid(),
                    NOW(),
                    manager_role_id,
                    perm_record.id
                );
                RAISE NOTICE '    ✓ Permission % ajoutée', perm_record.code;
            ELSE
                RAISE NOTICE '    ⊘ Permission % déjà assignée', perm_record.code;
            END IF;
        END LOOP;
        
        RAISE NOTICE '  ✅ Permissions mises à jour pour le tenant %', tenant_record."companyName";
    END LOOP;
    
    RAISE NOTICE '✅ Mise à jour terminée avec succès!';
    RAISE NOTICE '⚠️  IMPORTANT: Les utilisateurs MANAGER doivent se reconnecter pour obtenir un nouveau JWT avec les nouvelles permissions.';
END $$;

