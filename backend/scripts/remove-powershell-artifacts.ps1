# Script pour supprimer les artefacts PowerShell dans les fichiers TypeScript
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $newLines = @()
    $skipNext = $false
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        $trimmed = $line.Trim()
        
        # Détecter et sauter les lignes PowerShell
        if ($trimmed -eq "param(`$match)" -or 
            $trimmed -match "^\s*`$match\.Value -replace" -or
            ($trimmed -eq ";" -and $i -gt 0 -and $lines[$i-1].Trim() -match "`$match\.Value")) {
            continue
        }
        
        $newLines += $line
    }
    
    # Écrire seulement si des changements ont été faits
    $newContent = $newLines -join "`n"
    $originalContent = $lines -join "`n"
    
    if ($newContent -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Corrigé: $($file.FullName)"
    }
}

Write-Host "Terminé!"

