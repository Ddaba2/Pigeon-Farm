@echo off
echo 🧪 Test de la route de réinitialisation de mot de passe...
echo.

cd backend
node test-reset-password-route.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 Le problème 400 était causé par:
echo   1. Frontend envoyait 3 paramètres séparés
echo   2. API attendait un objet { email, code, newPassword }
echo   3. Correction appliquée dans ForgotPassword.tsx
echo.
pause
