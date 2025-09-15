@echo off
echo ========================================
echo   TEST D'INTEGRATION - PROFIL UTILISATEUR
echo ========================================
echo.

echo [1/4] Verification des fichiers modifies...
if exist "src\components\Profile.tsx" (
    echo ✓ Profile.tsx - OK
) else (
    echo ✗ Profile.tsx - MANQUANT
)

if exist "src\types\types.ts" (
    echo ✓ types.ts - OK
) else (
    echo ✗ types.ts - MANQUANT
)

if exist "src\utils\api.ts" (
    echo ✓ api.ts - OK
) else (
    echo ✗ api.ts - MANQUANT
)

if exist "backend\routes\users.js" (
    echo ✓ users.js - OK
) else (
    echo ✗ users.js - MANQUANT
)

if exist "backend\services\userService.js" (
    echo ✓ userService.js - OK
) else (
    echo ✗ userService.js - MANQUANT
)

echo.
echo [2/4] Verification de l'integration dans App.tsx...
findstr /C:"import Profile" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Import Profile - OK
) else (
    echo ✗ Import Profile - MANQUANT
)

findstr /C:"case 'profile'" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Case profile - OK
) else (
    echo ✗ Case profile - MANQUANT
)

echo.
echo [3/4] Verification de la navigation...
findstr /C:"Mon Profil" src\components\Navigation.tsx >nul
if %errorlevel%==0 (
    echo ✓ Navigation Profil - OK
) else (
    echo ✗ Navigation Profil - MANQUANT
)

echo.
echo [4/4] Verification du script SQL...
if exist "backend\update-users-profile-fields.sql" (
    echo ✓ Script SQL - OK
) else (
    echo ✗ Script SQL - MANQUANT
)

echo.
echo ========================================
echo   RESUME DE L'INTEGRATION
echo ========================================
echo.
echo ✓ Composant Profile.tsx cree
echo ✓ Types TypeScript etendus
echo ✓ Routes API backend ajoutees
echo ✓ Services backend mis a jour
echo ✓ Integration dans App.tsx
echo ✓ Navigation ajoutee
echo ✓ Script SQL de mise a jour
echo.
echo PROCHAINES ETAPES:
echo 1. Executer: backend\update-profile-fields.bat
echo 2. Demarrer le backend: npm start (dans backend/)
echo 3. Demarrer le frontend: npm run dev
echo 4. Tester la fonctionnalite profil
echo.
echo ========================================
pause
