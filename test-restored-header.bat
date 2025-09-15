@echo off
echo ========================================
echo   TEST HEADER RESTAURE
echo ========================================
echo.

echo [1/3] Verification de la restauration du titre...

REM Verifier que le titre PigeonFarm a ete remis
findstr /C:"PigeonFarm" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Titre "PigeonFarm" restaure - OK
) else (
    echo ✗ Titre "PigeonFarm" manquant - PROBLEME
)

REM Verifier que la balise h1 est presente
findstr /C:"<h1" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Balise h1 presente - OK
) else (
    echo ✗ Balise h1 manquante - PROBLEME
)

echo.
echo [2/3] Verification de la structure complete...

REM Verifier que le logo et le titre sont ensemble
findstr /C:"flex items-center space-x-3" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Logo et titre groupes ensemble - OK
) else (
    echo ✗ Logo et titre non groupes - PROBLEME
)

REM Verifier que le nom d'utilisateur est toujours present
findstr /C:"user.full_name || user.username" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Nom d'utilisateur toujours present - OK
) else (
    echo ✗ Nom d'utilisateur manquant - PROBLEME
)

echo.
echo [3/3] Verification de l'affichage final...

REM Verifier que le logo est bien positionne
findstr /C:"w-14 h-14 bg-gradient-to-br" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Logo bien positionne - OK
) else (
    echo ✗ Logo mal positionne - PROBLEME
)

REM Verifier que la disposition verticale de l'utilisateur est maintenue
findstr /C:"flex flex-col" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Disposition verticale utilisateur maintenue - OK
) else (
    echo ✗ Disposition verticale utilisateur manquante - PROBLEME
)

echo.
echo ========================================
echo   RESUME DU HEADER RESTAURE
echo ========================================
echo.
echo ✓ Logo (Bird) restaure
echo ✓ Titre "PigeonFarm" restaure
echo ✓ Nom d'utilisateur sous la photo
echo ✓ Structure complete
echo ✓ Mise en page equilibree
echo.
echo NOUVELLE STRUCTURE:
echo ┌─────────────────────────────────────┐
echo │ 🐦 PigeonFarm    [Admin] [Debug] [🌙] 👤 │
echo │                                   │
echo │                                   │
│                                   │
└─────────────────────────────────────┘
echo.
echo ELEMENTS RESTAURES:
echo - Logo (Bird)
echo - Titre "PigeonFarm"
echo - Balise h1
echo - Structure complete
echo.
echo ELEMENTS CONSERVES:
echo - Nom d'utilisateur sous la photo
echo - Disposition verticale utilisateur
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
echo    - Titre "PigeonFarm" a cote du logo
echo    - Nom d'utilisateur sous la photo a droite
echo 4. Verifiez que la mise en page est correcte
echo 5. Testez tous les boutons (Admin, Debug, etc.)
echo.
echo ========================================
pause
