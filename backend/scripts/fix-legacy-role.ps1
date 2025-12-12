# Script pour remplacer Role par LegacyRole dans tous les fichiers TypeScript
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remplacer les imports
    $content = $content -replace "import.*\{([^}]*)\bRole\b([^}]*)\}.*from '@prisma/client'", {
        param($match)
        $match.Value -replace '\bRole\b', 'LegacyRole'
    }
    
    # Remplacer Role. par LegacyRole.
    $content = $content -replace '\bRole\.', 'LegacyRole.'
    
    # Remplacer : Role par : LegacyRole (dans les types)
    $content = $content -replace ':\s*Role\b', ': LegacyRole'
    
    # Remplacer <Role> par <LegacyRole>
    $content = $content -replace '<Role>', '<LegacyRole>'
    $content = $content -replace '</Role>', '</LegacyRole>'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done!"

