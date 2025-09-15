@echo off
echo Mise à jour de la base de données pour les champs de profil...
echo.

REM Exécuter le script SQL
mysql -u root -p pigeon_farm < update-users-profile-fields.sql

echo.
echo Script SQL exécuté avec succès !
echo Les nouveaux champs de profil ont été ajoutés à la table users.
pause
