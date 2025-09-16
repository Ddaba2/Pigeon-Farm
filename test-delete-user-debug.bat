@echo off
echo 🔍 Diagnostic de la suppression d'utilisateur...
echo.

cd backend
node test-delete-user-debug.js

echo.
echo ✅ Diagnostic terminé !
echo.
echo 💡 Si le diagnostic montre des erreurs, vérifiez:
echo   - La connexion à la base de données
echo   - Les contraintes de clés étrangères
echo   - La fonction executeTransaction
echo   - Les permissions de l'utilisateur admin
echo.
pause

