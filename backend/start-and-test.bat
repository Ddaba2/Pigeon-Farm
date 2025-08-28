@echo off
echo ========================================
echo   Test Reinitialisation Mot de Passe
echo   PigeonFarm - Backend Complet
echo ========================================
echo.

echo 🚀 Demarrage du serveur backend...
echo.

REM Démarrer le serveur en arrière-plan
start /B npm start

echo ⏳ Attente du demarrage du serveur...
timeout /t 5 /nobreak >nul

echo.
echo 🔍 Test de la connectivite...
node test-password-reset.js

echo.
echo 📋 Instructions :
echo    1. Le serveur backend est demarre sur le port 3002
echo    2. Les routes de reinitialisation sont actives
echo    3. Testez depuis le frontend en cliquant sur "Mot de passe oublie ?"
echo    4. Configurez vos identifiants email dans le fichier .env
echo.
echo ⚠️  IMPORTANT : Configurez vos identifiants email !
echo     - Copiez env.example vers .env
echo     - Ajoutez votre email Gmail et mot de passe d'application
echo.
echo 💾 Base de donnees :
echo     - Schema consolide dans db_schema.sql
echo     - Utilisez update-database.bat pour appliquer le schema
echo.
echo 🔄 Appuyez sur une touche pour fermer...
pause >nul 