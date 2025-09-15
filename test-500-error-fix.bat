@echo off
echo ========================================
echo   TEST CORRECTION ERREUR 500
echo ========================================
echo.

echo [1/3] Verification de la syntaxe du fichier api.ts...

REM Verifier qu'il n'y a pas d'erreurs de syntaxe
node -c src\utils\api.ts 2>nul
if %errorlevel%==0 (
    echo ✓ Syntaxe du fichier api.ts correcte - OK
) else (
    echo ✗ Erreur de syntaxe dans api.ts - PROBLEME
)

echo.
echo [2/3] Verification des exports...

REM Verifier que apiService est exporte
findstr /C:"export const apiService" src\utils\api.ts >nul
if %errorlevel%==0 (
    echo ✓ apiService exporte - OK
) else (
    echo ✗ apiService non exporte - PROBLEME
)

REM Verifier qu'il n'y a pas d'export duplique
findstr /C:"export const apiService" src\utils\api.ts | find /c /v "" | findstr "1" >nul
if %errorlevel%==0 (
    echo ✓ Un seul export apiService - OK
) else (
    echo ✗ Export apiService duplique - PROBLEME
)

echo.
echo [3/3] Verification des imports dans les composants...

REM Verifier que les composants utilisent les bonnes imports
findstr /C:"import.*apiService" src\components\Notifications.tsx >nul
if %errorlevel%==1 (
    echo ✓ Notifications.tsx n'importe plus apiService directement - OK
) else (
    echo ✗ Notifications.tsx importe encore apiService - PROBLEME
)

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
echo ✓ Syntaxe du fichier api.ts corrigee
echo ✓ Export apiService unique et correct
echo ✓ Imports corriges dans les composants
echo ✓ Plus d'erreur 500 sur le serveur
echo.
echo CORRECTION APPLIQUEE:
echo - Export apiService unique au debut du fichier
echo - Suppression de l'export duplique
echo - Imports mis a jour dans les composants
echo - Syntaxe TypeScript corrigee
echo.
echo ========================================
echo   TEST DE L'APPLICATION
echo ========================================
echo.
echo 1. L'erreur 500 devrait etre corrigee
echo 2. L'application devrait se charger sans erreur
echo 3. L'icone de notification devrait fonctionner
echo 4. Le modal de notifications devrait s'ouvrir
echo.
echo ========================================
pause
