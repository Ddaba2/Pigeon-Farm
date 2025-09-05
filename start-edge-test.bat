@echo off
echo 🚀 Démarrage du test de compatibilité Microsoft Edge
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
)

REM Vérifier si le backend existe
if not exist "backend" (
    echo ❌ Dossier backend non trouvé
    echo Veuillez vous assurer d'être dans le bon répertoire
    pause
    exit /b 1
)

REM Vérifier si les dépendances backend sont installées
if not exist "backend\node_modules" (
    echo 📦 Installation des dépendances backend...
    cd backend
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances backend
        pause
        exit /b 1
    )
    cd ..
)

echo ✅ Dépendances installées
echo.

REM Démarrer le backend
echo 🔧 Démarrage du serveur backend...
start "Backend Server" cmd /k "cd backend && npm start"

REM Attendre que le backend démarre
echo ⏳ Attente du démarrage du backend...
timeout /t 5 /nobreak >nul

REM Démarrer le frontend avec compatibilité Edge
echo 🌐 Démarrage du serveur frontend avec compatibilité Edge...
start "Frontend Server" cmd /k "set EDGE_COMPATIBILITY=true && npm run dev"

REM Attendre que le frontend démarre
echo ⏳ Attente du démarrage du frontend...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Serveurs démarrés !
echo.
echo 📋 URLs disponibles :
echo   - Frontend: http://localhost:5174
echo   - Backend:  http://localhost:3002
echo   - Diagnostic Edge: http://localhost:5174/edge-diagnostic
echo.

REM Lancer le test de compatibilité
echo 🧪 Lancement du test de compatibilité Edge...
node test-edge-compatibility.js

echo.
echo 📝 Instructions :
echo   1. Ouvrez Microsoft Edge
echo   2. Naviguez vers http://localhost:5174
echo   3. Testez les fonctionnalités de l'application
echo   4. Utilisez le diagnostic Edge à http://localhost:5174/edge-diagnostic
echo   5. Vérifiez la console développeur pour les erreurs
echo.

echo 🔍 Pour tester spécifiquement Edge :
echo   - Edge Legacy: Utilisez le mode IE dans Edge
echo   - Edge Enterprise: Testez avec les politiques de groupe
echo   - Edge Chromium: Testez avec la version récente
echo.

pause
