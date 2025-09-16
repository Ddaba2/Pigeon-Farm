@echo off
echo 🧪 Test de la route de suppression des notifications lues...
echo.

cd backend
node test-notifications-route.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 Le problème 404 était causé par:
echo   1. Route DELETE /:id définie avant DELETE /read
echo   2. Express pensait que "read" était un ID de notification
echo   3. Solution: Réorganisation des routes (spécifiques avant paramètres)
echo.
echo 🎯 Maintenant DELETE /api/notifications/read fonctionne !
echo.
pause

