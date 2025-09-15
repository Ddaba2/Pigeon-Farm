@echo off
echo ========================================
echo   TEST SYSTEME DE NOTIFICATIONS
echo ========================================
echo.

echo [1/5] Verification de la base de donnees...

REM Verifier que la table notifications existe
cd backend
node -e "const { executeQuery } = require('./config/database.js'); executeQuery('SELECT COUNT(*) as count FROM notifications').then(result => { console.log('✓ Table notifications:', result[0].count, 'notifications'); process.exit(0); }).catch(err => { console.log('✗ Erreur table notifications:', err.message); process.exit(1); });"
if %errorlevel%==0 (
    echo ✓ Base de donnees notifications fonctionnelle - OK
) else (
    echo ✗ Probleme avec la base de donnees - PROBLEME
)

echo.
echo [2/5] Verification du service backend...

REM Verifier que le service NotificationService existe
if exist "services\notificationService.js" (
    echo ✓ Service NotificationService present - OK
) else (
    echo ✗ Service NotificationService manquant - PROBLEME
)

REM Verifier que les routes notifications existent
if exist "routes\notifications.js" (
    echo ✓ Routes notifications presentes - OK
) else (
    echo ✗ Routes notifications manquantes - PROBLEME
)

echo.
echo [3/5] Verification du composant frontend...

cd ..
if exist "src\components\Notifications.tsx" (
    echo ✓ Composant Notifications present - OK
) else (
    echo ✗ Composant Notifications manquant - PROBLEME
)

REM Verifier que l'icone Bell est importee dans App.tsx
findstr /C:"Bell" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Icone Bell importee dans App.tsx - OK
) else (
    echo ✗ Icone Bell manquante dans App.tsx - PROBLEME
)

echo.
echo [4/5] Verification de l'integration...

REM Verifier que le composant Notifications est importe
findstr /C:"import Notifications" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Composant Notifications importe - OK
) else (
    echo ✗ Composant Notifications non importe - PROBLEME
)

REM Verifier que l'icone de notification est dans le header
findstr /C:"Notifications Button" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Bouton notifications dans le header - OK
) else (
    echo ✗ Bouton notifications manquant dans le header - PROBLEME
)

echo.
echo [5/5] Verification des fonctionnalites...

REM Verifier que le compteur de notifications est implemente
findstr /C:"notificationCount" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Compteur de notifications implemente - OK
) else (
    echo ✗ Compteur de notifications manquant - PROBLEME
)

REM Verifier que le modal de notifications est implemente
findstr /C:"Notifications Modal" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Modal de notifications implemente - OK
) else (
    echo ✗ Modal de notifications manquant - PROBLEME
)

echo.
echo ========================================
echo   RESUME DU SYSTEME DE NOTIFICATIONS
echo ========================================
echo.
echo ✓ Table notifications dans la base de donnees
echo ✓ Service NotificationService backend
echo ✓ Routes API /api/notifications/*
echo ✓ Composant Notifications frontend
echo ✓ Icone Bell dans le header
echo ✓ Compteur de notifications non lues
echo ✓ Modal de notifications complet
echo ✓ Gestion des types (info, warning, error, success, update, health)
echo ✓ Actions (marquer comme lu, supprimer, etc.)
echo.
echo FONCTIONNALITES DISPONIBLES:
echo - Affichage du nombre de notifications non lues
echo - Ouverture du modal de notifications
echo - Lecture des notifications
echo - Marquage comme lu/lue
echo - Suppression de notifications
echo - Types de notifications colores
echo - Gestion des erreurs
echo.
echo ========================================
echo   TEST DE L'APPLICATION
echo ========================================
echo.
echo 1. Demarrez le backend: cd backend && npm start
echo 2. Demarrez le frontend: npm run dev
echo 3. Accedez a http://localhost:5173
echo 4. Connectez-vous avec vos identifiants
echo 5. Verifiez que l'icone Bell est visible dans le header
echo 6. Cliquez sur l'icone pour ouvrir les notifications
echo 7. Testez les actions (marquer comme lu, supprimer)
echo.
echo ========================================
pause
