@echo off
echo ========================================
echo   CORRECTION STRUCTURE BASE DE DONNEES
echo ========================================
echo.

echo Correction de la structure de la base de données...
echo - Renommage de profile_picture en avatar_url
echo - Ajout des champs manquants (phone, address, bio)
echo - Changement du type pour supporter base64
echo.

REM Exécuter le script SQL
mysql -u root -p pigeon_farm < fix-database-structure.sql

echo.
echo Structure de la base de données corrigée !
echo.
pause
