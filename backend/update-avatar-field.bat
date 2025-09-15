@echo off
echo ========================================
echo   MISE A JOUR BASE DE DONNEES - AVATAR
echo ========================================
echo.

echo Mise à jour de la base de données pour supporter les photos de profil...
echo.

REM Exécuter le script SQL
mysql -u root -p pigeon_farm < update-avatar-field.sql

echo.
echo Base de données mise à jour avec succès !
echo Le champ avatar_url peut maintenant stocker des photos base64.
echo.
pause
