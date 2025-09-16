@echo off
echo 🧪 Test de la réinitialisation de mot de passe avec SMTP...
echo.

cd backend
node test-password-reset-smtp.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 La réinitialisation de mot de passe utilise maintenant:
echo   1. Le même SMTP que les autres emails
echo   2. Configuration EMAIL_USER et EMAIL_PASS
echo   3. Templates professionnels HTML et texte
echo   4. Code à 4 chiffres envoyé par email
echo.
pause
