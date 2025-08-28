# Script PowerShell pour mettre a jour la base de donnees PigeonFarm
# Assurez-vous que XAMPP est demarre et que MySQL fonctionne

Write-Host "Mise a jour de la base de donnees PigeonFarm..." -ForegroundColor Yellow

# Verifier si MySQL est accessible
try {
    $mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
    
    if (-not (Test-Path $mysqlPath)) {
        Write-Host "MySQL n'est pas trouve dans XAMPP. Verifiez l'installation." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "MySQL trouve dans XAMPP" -ForegroundColor Green
    
    # Tester la connexion a MySQL
    Write-Host "Test de connexion a MySQL..." -ForegroundColor Yellow
    
    $testConnection = & $mysqlPath -u root -e "SELECT 1;" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Impossible de se connecter a MySQL. Verifiez que le service est demarre." -ForegroundColor Red
        Write-Host "Assurez-vous que XAMPP Control Panel est ouvert et que MySQL est demarre." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Connexion a MySQL reussie" -ForegroundColor Green
    
    # Verifier si la base de donnees existe
    Write-Host "Verification de la base de donnees..." -ForegroundColor Yellow
    
    $dbExists = & $mysqlPath -u root -e "SHOW DATABASES LIKE 'pigeon_manager';" 2>$null
    if ($LASTEXITCODE -ne 0 -or $dbExists -notmatch "pigeon_manager") {
        Write-Host "La base de donnees 'pigeon_manager' n'existe pas." -ForegroundColor Red
        Write-Host "Creation de la base de donnees..." -ForegroundColor Yellow
        
        & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS pigeon_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Impossible de creer la base de donnees." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Base de donnees 'pigeon_manager' creee" -ForegroundColor Green
    } else {
        Write-Host "Base de donnees 'pigeon_manager' trouvee" -ForegroundColor Green
    }
    
    # Executer le script de mise a jour
    Write-Host "Execution du script de mise a jour..." -ForegroundColor Yellow
    
    $scriptPath = Join-Path $PSScriptRoot "update_database.sql"
    if (-not (Test-Path $scriptPath)) {
        Write-Host "Fichier 'update_database.sql' non trouve." -ForegroundColor Red
        exit 1
    }
    
    # Lire le contenu du script et l'executer
    $scriptContent = Get-Content $scriptPath -Raw
    
    Write-Host "Execution du script SQL..." -ForegroundColor Yellow
    
    $result = & $mysqlPath -u root pigeon_manager -e $scriptContent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Script de mise a jour execute avec succes!" -ForegroundColor Green
        Write-Host "La base de donnees PigeonFarm est maintenant prete!" -ForegroundColor Green
        
        # Afficher un resume
        Write-Host "Resume de la mise a jour:" -ForegroundColor Cyan
        Write-Host "   - Tables creees/mises a jour" -ForegroundColor White
        Write-Host "   - Utilisateur admin cree (admin/admin123)" -ForegroundColor White
        Write-Host "   - Couples d'exemple ajoutes" -ForegroundColor White
        Write-Host "   - Structure de base de donnees optimisee" -ForegroundColor White
        
        Write-Host "Prochaines etapes:" -ForegroundColor Cyan
        Write-Host "   1. Redemarrer le serveur backend" -ForegroundColor White
        Write-Host "   2. Tester l'application" -ForegroundColor White
        Write-Host "   3. Creer de nouveaux utilisateurs et couples" -ForegroundColor White
        
    } else {
        Write-Host "Erreur lors de l'execution du script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Erreur inattendue: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Mise a jour terminee avec succes!" -ForegroundColor Green 