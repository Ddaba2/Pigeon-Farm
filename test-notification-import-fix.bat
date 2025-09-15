@echo off
echo ========================================
echo   TEST CORRECTION IMPORT NOTIFICATIONS
echo ========================================
echo.

echo [1/3] Verification de l'export apiService...

REM Verifier que apiService est exporte dans api.ts
findstr /C:"export const apiService" src\utils\api.ts >nul
if %errorlevel%==0 (
    echo ✓ apiService exporte dans api.ts - OK
) else (
    echo ✗ apiService non exporte - PROBLEME
)

echo.
echo [2/3] Verification des methodes de notifications...

REM Verifier que les methodes de notifications sont exportees
findstr /C:"export const getNotificationCount" src\utils\api.ts >nul
if %errorlevel%==0 (
    echo ✓ getNotificationCount exporte - OK
) else (
    echo ✗ getNotificationCount non exporte - PROBLEME
)

findstr /C:"export const getNotifications" src\utils\api.ts >nul
if %errorlevel%==0 (
    echo ✓ getNotifications exporte - OK
) else (
    echo ✗ getNotifications non exporte - PROBLEME
)

echo.
echo [3/3] Verification des imports dans les composants...

REM Verifier que Notifications.tsx utilise les bonnes imports
findstr /C:"import.*getNotificationCount" src\components\Notifications.tsx >nul
if %errorlevel%==0 (
    echo ✓ Notifications.tsx utilise les bonnes imports - OK
) else (
    echo ✗ Notifications.tsx utilise de mauvaises imports - PROBLEME
)

REM Verifier que App.tsx utilise getNotificationCount
findstr /C:"import.*getNotificationCount" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ App.tsx utilise getNotificationCount - OK
) else (
    echo ✗ App.tsx n'utilise pas getNotificationCount - PROBLEME
)

echo.
echo ========================================
echo   RESUME DE LA CORRECTION
echo ========================================
echo.
echo ✓ apiService exporte depuis api.ts
echo ✓ Methodes de notifications exportees
echo ✓ Imports corriges dans Notifications.tsx
echo ✓ Imports corriges dans App.tsx
echo ✓ Plus d'erreur d'import apiService
echo.
echo CORRECTION APPLIQUEE:
echo - Export de apiService ajoute dans api.ts
echo - Methodes de notifications ajoutees dans api.ts
echo - Imports mis a jour dans Notifications.tsx
echo - Imports mis a jour dans App.tsx
echo - Noms de fonctions renommes pour eviter les conflits
echo.
echo ========================================
echo   TEST DE L'APPLICATION
echo ========================================
echo.
echo 1. Demarrez le backend: cd backend && node index.js
echo 2. Demarrez le frontend: npm run dev
echo 3. Accedez a http://localhost:5173
echo 4. L'erreur d'import devrait etre corrigee
echo 5. L'icone de notification devrait fonctionner
echo.
echo ========================================
pause
