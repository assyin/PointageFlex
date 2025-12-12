# Script pour corriger les imports et références incorrectes

# 1. Corriger les imports manquants de LegacyRole dans les controllers
$controllers = Get-ChildItem -Path "src/modules" -Filter "*controller.ts" -Recurse

foreach ($file in $controllers) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Vérifier si le fichier utilise LegacyRole mais ne l'importe pas
    if ($content -match 'LegacyRole\.' -and $content -notmatch "import.*LegacyRole.*from '@prisma/client'") {
        # Trouver la ligne d'import depuis @prisma/client
        if ($content -match "import.*from '@prisma/client'") {
            # Ajouter LegacyRole à l'import existant
            $content = $content -replace "(import\s+\{[^}]*)(from '@prisma/client')", "`$1, LegacyRole`$2"
        } else {
            # Ajouter un nouvel import
            $lines = $content -split "`n"
            $importIndex = -1
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "^import.*from '@nestjs/common'") {
                    $importIndex = $i
                    break
                }
            }
            if ($importIndex -ge 0) {
                $newLines = @()
                for ($i = 0; $i -lt $lines.Length; $i++) {
                    $newLines += $lines[$i]
                    if ($i -eq $importIndex) {
                        $newLines += "import { LegacyRole } from '@prisma/client';"
                    }
                }
                $content = $newLines -join "`n"
            }
        }
    }
    
    # Corriger les imports d'enums manquants
    if ($file.Name -eq "attendance.controller.ts") {
        if ($content -match 'AttendanceType\.' -and $content -notmatch "import.*AttendanceType") {
            $content = $content -replace "(import.*LegacyRole.*from '@prisma/client')", "`$1`nimport { AttendanceType, DeviceType } from '@prisma/client';"
        }
    }
    
    if ($file.Name -eq "leaves.controller.ts") {
        if ($content -match 'LeaveStatus' -and $content -notmatch "import.*LeaveStatus") {
            $content = $content -replace "(import.*LegacyRole.*from '@prisma/client')", "`$1`nimport { LeaveStatus } from '@prisma/client';"
        }
    }
    
    if ($file.Name -eq "overtime.controller.ts") {
        if ($content -match 'OvertimeStatus' -and $content -notmatch "import.*OvertimeStatus") {
            $content = $content -replace "(import.*LegacyRole.*from '@prisma/client')", "`$1`nimport { OvertimeStatus } from '@prisma/client';"
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigé: $($file.FullName)"
    }
}

# 2. Corriger les références incorrectes dans les services
# prisma.LegacyRole -> prisma.role (le modèle)
# utr.LegacyRole -> utr.role

$services = Get-ChildItem -Path "src/modules" -Filter "*service.ts" -Recurse

foreach ($file in $services) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corriger prisma.LegacyRole -> prisma.role
    $content = $content -replace 'this\.prisma\.LegacyRole\.', 'this.prisma.role.'
    $content = $content -replace 'await this\.prisma\.LegacyRole\.', 'await this.prisma.role.'
    $content = $content -replace 'this\.prisma\.LegacyRole\.', 'this.prisma.role.'
    
    # Corriger utr.LegacyRole -> utr.role
    $content = $content -replace 'utr\.LegacyRole\.', 'utr.role.'
    $content = $content -replace 'updated\.LegacyRole\.', 'updated.role.'
    $content = $content -replace 'created\.LegacyRole\.', 'created.role.'
    
    # Corriger les imports de DTOs
    $content = $content -replace "from '\./dto/create-LegacyRole\.dto'", "from './dto/create-role.dto'"
    $content = $content -replace "from '\./dto/update-LegacyRole\.dto'", "from './dto/update-role.dto'"
    
    # Corriger les variables LegacyRole (qui devraient être role)
    $content = $content -replace 'const LegacyRole = await', 'const role = await'
    $content = $content -replace 'if \(LegacyRole\.isSystem\)', 'if (role.isSystem)'
    $content = $content -replace 'LegacyRole\.id', 'role.id'
    $content = $content -replace 'await this\.assignPermissions\(LegacyRole\.id', 'await this.assignPermissions(role.id'
    $content = $content -replace 'return this\.findOne\(LegacyRole\.id\)', 'return this.findOne(role.id)'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigé: $($file.FullName)"
    }
}

# 3. Corriger jwt.strategy.ts
$jwtStrategy = "src/modules/auth/strategies/jwt.strategy.ts"
if (Test-Path $jwtStrategy) {
    $content = Get-Content $jwtStrategy -Raw
    $content = $content -replace 'utr\.LegacyRole\.', 'utr.role.'
    Set-Content -Path $jwtStrategy -Value $content -NoNewline
    Write-Host "Corrigé: $jwtStrategy"
}

# 4. Corriger create-test-users.ts
$testUsers = "scripts/create-test-users.ts"
if (Test-Path $testUsers) {
    $content = Get-Content $testUsers -Raw
    $content = $content -replace 'import.*Role.*from', 'import { LegacyRole } from'
    $content = $content -replace 'Role\.', 'LegacyRole.'
    Set-Content -Path $testUsers -Value $content -NoNewline
    Write-Host "Corrigé: $testUsers"
}

Write-Host "Terminé!"

