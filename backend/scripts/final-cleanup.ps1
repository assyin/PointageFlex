# Script final pour supprimer toutes les lignes PowerShell restantes
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $newLines = @()
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        $trimmed = $line.Trim()
        
        # Supprimer les lignes avec $match
        if ($trimmed -match '\$match') {
            continue
        }
        
        # Supprimer les lignes ";" isolées qui suivent $match
        if ($trimmed -eq ";" -and $i -gt 0) {
            $prevLine = $lines[$i-1].Trim()
            if ($prevLine -match '\$match') {
                continue
            }
        }
        
        $newLines += $line
    }
    
    $newContent = $newLines -join "`n"
    $originalContent = $lines -join "`n"
    
    if ($newContent -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Corrigé: $($file.FullName)"
    }
}

Write-Host "Terminé!"

