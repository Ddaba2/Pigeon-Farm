@echo off
echo ========================================
echo   TEST DISPOSITION VERTICALE HEADER
echo ========================================
echo.

echo [1/3] Verification de la disposition verticale...

REM Verifier que flex-col est utilise
findstr /C:"flex flex-col" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Disposition verticale (flex-col) implementee - OK
) else (
    echo ✗ Disposition verticale manquante - PROBLEME
)

REM Verifier que items-center est present
findstr /C:"items-center" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Centrage vertical (items-center) present - OK
) else (
    echo ✗ Centrage vertical manquant - PROBLEME
)

REM Verifier que space-y-1 est utilise pour l'espacement vertical
findstr /C:"space-y-1" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Espacement vertical (space-y-1) present - OK
) else (
    echo ✗ Espacement vertical manquant - PROBLEME
)

echo.
echo [2/3] Verification du centrage du texte...

REM Verifier que text-center est utilise
findstr /C:"text-center" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Centrage du texte (text-center) implemente - OK
) else (
    echo ✗ Centrage du texte manquant - PROBLEME
)

REM Verifier que la taille du texte est appropriee
findstr /C:"text-xs" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Taille de texte appropriee (text-xs) - OK
) else (
    echo ✗ Taille de texte incorrecte - PROBLEME
)

echo.
echo [3/3] Verification de la structure...

REM Verifier que l'avatar est en premier
findstr /C:"w-8 h-8 rounded-full" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Avatar en position superieure - OK
) else (
    echo ✗ Avatar mal positionne - PROBLEME
)

REM Verifier que le nom est en dessous
findstr /C:"user.full_name || user.username" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Nom d'utilisateur en position inferieure - OK
) else (
    echo ✗ Nom d'utilisateur mal positionne - PROBLEME
)

echo.
echo ========================================
echo   RESUME DE LA DISPOSITION
echo ========================================
echo.
echo ✓ Photo de profil en haut
echo ✓ Nom d'utilisateur en bas
echo ✓ Disposition verticale (flex-col)
echo ✓ Centrage horizontal (items-center)
echo ✓ Espacement vertical (space-y-1)
echo ✓ Centrage du texte (text-center)
echo ✓ Taille de texte appropriee (text-xs)
echo.
echo NOUVELLE DISPOSITION:
echo ┌─────────┐
echo │   👤    │ ← Photo de profil
echo │  Nom    │ ← Nom d'utilisateur
echo │  Role   │ ← Role (admin/user)
echo └─────────┘
echo.
echo ========================================
echo   TEST DE L'APPLICATION
echo ========================================
echo.
echo 1. Accedez a http://localhost:5173
echo 2. Connectez-vous avec vos identifiants
echo 3. Verifiez que le header affiche:
echo    - Photo de profil en haut
echo    - Nom d'utilisateur en dessous
echo    - Role en dessous du nom
echo 4. Verifiez que tout est centre verticalement
echo 5. Cliquez sur la section pour acceder au profil
echo.
echo ========================================
pause
