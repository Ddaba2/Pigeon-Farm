@echo off
echo 🧪 Test de suppression d'utilisateur...
echo.

cd backend
node test-delete-user.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 Si l'erreur 500 persiste, vérifiez:
echo   1. La connexion à la base de données
echo   2. Les permissions de l'utilisateur admin
echo   3. Les contraintes de clés étrangères
echo.
pause
