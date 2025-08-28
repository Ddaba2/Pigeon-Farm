# Script PowerShell pour mettre à jour la base de données PigeonFarm
# Assurez-vous que XAMPP est démarré et que MySQL fonctionne

Write-Host "🔄 Mise à jour de la base de données PigeonFarm..." -ForegroundColor Yellow

# Vérifier si MySQL est accessible
try {
    $mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
    
    if (-not (Test-Path $mysqlPath)) {
        Write-Host "❌ MySQL n'est pas trouvé dans XAMPP. Vérifiez l'installation." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ MySQL trouvé dans XAMPP" -ForegroundColor Green
    
    # Tester la connexion à MySQL
    Write-Host "🔌 Test de connexion à MySQL..." -ForegroundColor Yellow
    
    $testConnection = & $mysqlPath -u root -e "SELECT 1;" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Impossible de se connecter à MySQL. Vérifiez que le service est démarré." -ForegroundColor Red
        Write-Host "💡 Assurez-vous que XAMPP Control Panel est ouvert et que MySQL est démarré." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Connexion à MySQL réussie" -ForegroundColor Green
    
    # Vérifier si la base de données existe
    Write-Host "🔍 Vérification de la base de données..." -ForegroundColor Yellow
    
    $dbExists = & $mysqlPath -u root -e "SHOW DATABASES LIKE 'pigeon_manager';" 2>$null
    if ($LASTEXITCODE -ne 0 -or $dbExists -notmatch "pigeon_manager") {
        Write-Host "❌ La base de données 'pigeon_manager' n'existe pas." -ForegroundColor Red
        Write-Host "💡 Création de la base de données..." -ForegroundColor Yellow
        
        & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS pigeon_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Impossible de créer la base de données." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Base de données 'pigeon_manager' créée" -ForegroundColor Green
    } else {
        Write-Host "✅ Base de données 'pigeon_manager' trouvée" -ForegroundColor Green
    }
    
    # Exécuter le script de mise à jour
    Write-Host "📝 Exécution du script de mise à jour..." -ForegroundColor Yellow
    
    $scriptPath = Join-Path $PSScriptRoot "update_database.sql"
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Fichier 'update_database.sql' non trouvé." -ForegroundColor Red
        exit 1
    }
    
    # Lire le contenu du script et l'exécuter
    $scriptContent = Get-Content $scriptPath -Raw
    
    Write-Host "🚀 Exécution du script SQL..." -ForegroundColor Yellow
    
    $result = & $mysqlPath -u root pigeon_manager -e $scriptContent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script de mise à jour exécuté avec succès!" -ForegroundColor Green
        Write-Host "🎉 La base de données PigeonFarm est maintenant prête!" -ForegroundColor Green
        
        # Afficher un résumé
        Write-Host "`n📊 Résumé de la mise à jour:" -ForegroundColor Cyan
        Write-Host "   - Tables créées/mises à jour" -ForegroundColor White
        Write-Host "   - Utilisateur admin créé (admin/admin123)" -ForegroundColor White
        Write-Host "   - Couples d'exemple ajoutés" -ForegroundColor White
        Write-Host "   - Structure de base de données optimisée" -ForegroundColor White
        
        Write-Host "`n🔧 Prochaines étapes:" -ForegroundColor Cyan
        Write-Host "   1. Redémarrer le serveur backend" -ForegroundColor White
        Write-Host "   2. Tester l'application" -ForegroundColor White
        Write-Host "   3. Créer de nouveaux utilisateurs et couples" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erreur lors de l'exécution du script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Erreur inattendue: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Mise à jour terminée avec succès!" -ForegroundColor Green 