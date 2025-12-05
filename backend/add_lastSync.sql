-- Migration manuelle : Ajouter le champ lastSync au modèle AttendanceDevice
-- Exécuter cette requête SQL dans votre base de données

ALTER TABLE "AttendanceDevice"
ADD COLUMN IF NOT EXISTS "lastSync" TIMESTAMP(3);

-- Optionnel : Mettre à jour les terminaux existants avec la date actuelle
-- UPDATE "AttendanceDevice" SET "lastSync" = NOW() WHERE "isActive" = true;
