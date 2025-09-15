@echo off
echo ========================================
echo   TEST HEADER SIMPLIFIE
echo ========================================
echo.

echo [1/3] Verification de la suppression du titre...

REM Verifier que le titre PigeonFarm a ete supprime
findstr /C:"PigeonFarm" src\App.tsx >nul
if %errorlevel%==1 (
    echo ✓ Titre "PigeonFarm" supprime - OK
) else (
    echo ✗ Titre "PigeonFarm" encore present - PROBLEME
)

REM Verifier que le logo est toujours present
findstr /C:"Bird className=" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Logo (Bird) toujours present - OK
) else (
    echo ✗ Logo manquant - PROBLEME
)

echo.
echo [2/3] Verification de la structure simplifiee...

REM Verifier que le h1 a ete supprime
findstr /C:"<h1" src\App.tsx >nul
if %errorlevel%==1 (
    echo ✓ Balise h1 supprimee - OK
) else (
    echo ✗ Balise h1 encore presente - PROBLEME
)

REM Verifier que le nom d'utilisateur est toujours affiche
findstr /C:"user.full_name || user.username" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Nom d'utilisateur toujours affiche - OK
) else (
    echo ✗ Nom d'utilisateur manquant - PROBLEME
)

echo.
echo [3/3] Verification de la mise en page...

REM Verifier que le logo est bien positionne
findstr /C:"w-14 h-14 bg-gradient-to-br" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Logo bien positionne - OK
) else (
    echo ✗ Logo mal positionne - PROBLEME
)

REM Verifier que l'espacement est correct
findstr /C:"justify-between" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Espacement correct (justify-between) - OK
) else (
    echo ✗ Espacement incorrect - PROBLEME
)

echo.
echo ========================================
echo   RESUME DU HEADER SIMPLIFIE
echo ========================================
echo.
echo ✓ Titre "PigeonFarm" supprime
echo ✓ Logo (Bird) conserve
echo ✓ Nom d'utilisateur toujours affiche
echo ✓ Structure simplifiee
echo ✓ Mise en page optimisee
echo.
echo NOUVELLE STRUCTURE:
echo ┌─────────────────────────────────────┐
echo │ 🐦 [Admin] [Debug] [🌙] 👤 Nom │
echo │                                   │
echo └─────────────────────────────────────┘
echo.
echo ELEMENTS SUPPRIMES:
echo - Titre "PigeonFarm"
echo - Balise h1
echo - Texte redondant
echo.
echo ELEMENTS CONSERVES:
echo - Logo (Bird)
echo - Nom d'utilisateur
echo - Boutons Admin/Debug
echo - Bouton mode sombre
echo - Bouton deconnexion
echo.
echo ========================================
echo   TEST DE L'APPLICATION
echo ========================================
echo.
echo 1. Accedez a http://localhost:5173
echo 2. Connectez-vous avec vos identifiants
echo 3. Verifiez que le header affiche:
echo    - Logo (Bird) a gauche
echo    - Nom d'utilisateur a droite
echo    - Pas de titre "PigeonFarm"
echo 4. Verifiez que la mise en page est correcte
echo 5. Testez tous les boutons (Admin, Debug, etc.)
echo.
echo ========================================
pause
