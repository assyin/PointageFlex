# Script PowerShell pour appliquer le nouveau champ requireScheduleForAttendance

Write-Host "🔍 Synchronisation du schéma Prisma avec la base de données..." -ForegroundColor Cyan
npx prisma db push

Write-Host ""
Write-Host "🔄 Régénération du client Prisma..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "✅ Modification appliquée !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Le champ 'requireScheduleForAttendance' a été ajouté à TenantSettings" -ForegroundColor Yellow
Write-Host "   Valeur par défaut : true (validation stricte activée)" -ForegroundColor Yellow

