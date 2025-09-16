@echo off
echo 🧪 Test des routes d'administration...
echo.

cd backend
node test-admin-routes.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 Les erreurs 500 devraient maintenant être résolues:
echo   1. Ordre des routes corrigé
echo   2. Conflits de routage éliminés
echo   3. Routes spécifiques avant générales
echo.
pause
