-- Script SQL pour réinitialiser tous les mots de passe des utilisateurs de test
-- Exécutez ce script dans Prisma Studio ou via psql

-- Note: Les mots de passe sont hashés avec bcrypt
-- Pour réinitialiser, nous devons utiliser un script TypeScript qui hash le mot de passe

-- Vérification des utilisateurs existants
SELECT email, "firstName", "lastName", role, "isActive" 
FROM "User" 
WHERE email IN ('admin@demo.com', 'employee@demo.com', 'manager@demo.com', 'rh@demo.com')
ORDER BY email;

-- Pour réinitialiser les mots de passe, exécutez le script TypeScript :
-- npx ts-node scripts/fix-all-passwords.ts

