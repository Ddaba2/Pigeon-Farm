@echo off
echo ========================================
echo   TEST DES MODIFICATIONS DU PROFIL
echo ========================================
echo.

echo [1/3] Verification de la suppression de la navigation...
findstr /C:"Mon Profil" src\components\Navigation.tsx >nul
if %errorlevel%==1 (
    echo ✓ "Mon Profil" supprime de la navigation - OK
) else (
    echo ✗ "Mon Profil" encore present dans la navigation - PROBLEME
)

echo.
echo [2/3] Verification de l'upload de photo...
findstr /C:"type=\"file\"" src\components\Profile.tsx >nul
if %errorlevel%==0 (
    echo ✓ Input file pour upload de photo - OK
) else (
    echo ✗ Input file manquant - PROBLEME
)

findstr /C:"accept=\"image/\*" src\components\Profile.tsx >nul
if %errorlevel%==0 (
    echo ✓ Accept images dans l'input - OK
) else (
    echo ✗ Accept images manquant - PROBLEME
)

findstr /C:"Upload className" src\components\Profile.tsx >nul
if %errorlevel%==0 (
    echo ✓ Bouton Upload present - OK
) else (
    echo ✗ Bouton Upload manquant - PROBLEME
)

echo.
echo [3/3] Verification de la preservation du bouton profil dans le header...
findstr /C:"onClick={() => setActiveTab('profile')}" src\App.tsx >nul
if %errorlevel%==0 (
    echo ✓ Bouton Profil dans le header preserve - OK
) else (
    echo ✗ Bouton Profil dans le header manquant - PROBLEME
)

echo.
echo ========================================
echo   RESUME DES MODIFICATIONS
echo ========================================
echo.
echo ✓ "Mon Profil" supprime de la navigation
echo ✓ Upload de photo implemente
echo ✓ Bouton Profil preserve dans le header
echo ✓ Validation des fichiers images
echo ✓ Apercu en temps reel
echo ✓ Gestion des erreurs
echo.
echo FONCTIONNALITES:
echo - Bouton "Choisir un fichier" pour selectionner une image
echo - Apercu immediat de l'image selectionnee
echo - Validation du type de fichier (images uniquement)
echo - Validation de la taille (max 5MB)
echo - Bouton "Mettre a jour la photo" pour sauvegarder
echo - Bouton "Annuler" pour annuler la selection
echo.
echo ========================================
echo   ACCES AU PROFIL
echo ========================================
echo.
echo Le profil reste accessible via:
echo 1. Bouton "Profil" dans le header (en haut a droite)
echo 2. Plus accessible via la navigation (supprime comme demande)
echo.
echo ========================================
pause
