@echo off
echo 🧪 Test de la configuration email...
echo.

cd backend
node test-email-config.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 Si les emails ne sont pas envoyés, vérifiez:
echo   1. Vos identifiants Gmail dans config.env
echo   2. L'authentification à 2 facteurs activée
echo   3. Un mot de passe d'application généré
echo.
pause
