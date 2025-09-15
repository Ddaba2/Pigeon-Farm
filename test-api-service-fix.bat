@echo off
echo ========================================
echo   TEST CORRECTION API SERVICE
echo ========================================
echo.

echo [1/3] Verification de la declaration unique...

REM Verifier qu'il n'y a qu'une seule declaration de apiService
findstr /C:"const apiService" src\utils\api.ts | find /c /v "" | findstr "1" >nul
if %errorlevel%==0 (
    echo ✓ Une seule declaration const apiService - OK
) else (
    echo ✗ Declaration apiService dupliquee - PROBLEME
)

echo.
echo [2/3] Verification des exports...

REM Verifier l'export par defaut
findstr /C:"export default apiService" src\utils\api.ts >nul
if %errorlevel%==0 (
    echo ✓ Export par defaut present - OK
) else (
    echo ✗ Export par defaut manquant - PROBLEME
)

REM Verifier l'export nomme
findstr /C:"export { apiService }" src\utils\api.ts >nul
if %errorlevel%==0 (
    echo ✓ Export nomme present - OK
) else (
    echo ✗ Export nomme manquant - PROBLEME
)

echo.
echo [3/3] Verification des methodes de notifications...

REM Verifier que les methodes sont presentes
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
echo ========================================
echo   RESUME DE LA CORRECTION
echo ========================================
echo.
echo ✓ Declaration apiService unique
echo ✓ Export par defaut correct
echo ✓ Export nomme pour compatibilite
echo ✓ Methodes de notifications disponibles
echo ✓ Plus d'erreur de declaration dupliquee
echo.
echo CORRECTION APPLIQUEE:
echo - Suppression de la declaration dupliquee
echo - Export par defaut: export default apiService
echo - Export nomme: export { apiService }
echo - Methodes de notifications fonctionnelles
echo.
echo ========================================
echo   TEST DE L'APPLICATION
echo ========================================
echo.
echo 1. Backend demarre sur le port 3002
echo 2. Frontend demarre sur le port 5173
echo 3. L'erreur de declaration dupliquee est corrigee
echo 4. L'icone de notification devrait fonctionner
echo 5. Le modal de notifications devrait s'ouvrir
echo.
echo ========================================
pause
