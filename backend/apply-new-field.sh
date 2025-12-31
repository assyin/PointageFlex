#!/bin/bash

# Script pour appliquer le nouveau champ requireScheduleForAttendance

echo "🔍 Synchronisation du schéma Prisma avec la base de données..."
npx prisma db push

echo ""
echo "🔄 Régénération du client Prisma..."
npx prisma generate

echo ""
echo "✅ Modification appliquée !"
echo ""
echo "📝 Le champ 'requireScheduleForAttendance' a été ajouté à TenantSettings"
echo "   Valeur par défaut : true (validation stricte activée)"

