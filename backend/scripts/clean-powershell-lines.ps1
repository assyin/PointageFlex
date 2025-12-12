# Script pour supprimer les lignes PowerShell dans les fichiers TypeScript
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Supprimer les blocs PowerShell
    $content = $content -replace '(?s)\s+param\(`$match\)\s+`$match\.Value -replace.*?;\s+', ''
    $content = $content -replace '(?s)\s+param\(`$match\)\s+`$match\.Value -replace[^\n]*\n\s*;\s*\n', ''
    
    # Nettoyer les lignes vides multiples
    $content = $content -replace '\n\n\n+', "`n`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Nettoyé: $($file.FullName)"
    }
}

Write-Host "Terminé!"

