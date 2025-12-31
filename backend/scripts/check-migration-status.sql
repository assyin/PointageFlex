-- Script pour vérifier l'état de la migration échouée
-- Vérifier si la colonne requireBreakPunch existe déjà

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'TenantSettings' 
  AND column_name = 'requireBreakPunch';

-- Si la requête retourne un résultat, la colonne existe déjà
-- Si aucun résultat, la colonne n'existe pas

