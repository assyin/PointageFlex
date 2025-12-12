# Script pour supprimer les fragments PowerShell laissés dans les fichiers TypeScript
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Supprimer les lignes PowerShell qui se sont retrouvées dans le code
    $lines = $content -split "`n"
    $cleanedLines = @()
    $skipNext = $false
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        
        # Détecter les lignes PowerShell à supprimer
        if ($line -match "param\(`$match\)" -or 
            $line -match "`$match\.Value -replace" -or
            ($line.Trim() -eq ";" -and $i -gt 0 -and $lines[$i-1] -match "`$match\.Value")) {
            # Ne pas ajouter cette ligne
            continue
        }
        
        $cleanedLines += $line
    }
    
    $newContent = $cleanedLines -join "`n"
    
    if ($newContent -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Nettoyé: $($file.FullName)"
    }
}

Write-Host "Terminé!"

