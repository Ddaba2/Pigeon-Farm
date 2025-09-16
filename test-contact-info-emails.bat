@echo off
echo 🧪 Test des informations de contact dans les emails d'administration...
echo.

cd backend
node test-contact-info-emails.js

echo.
echo ✅ Test terminé !
echo.
echo 📧 Informations de contact ajoutées:
echo   - Email: contactpigeonfarm@gmail.com
echo   - Téléphone: +223 83-78-40-98
echo.
echo 🎯 Templates modifiés:
echo   1. ✅ Email de blocage de compte
echo   2. ✅ Email de déblocage de compte  
echo   3. ✅ Email de suppression de compte
echo.
echo 💡 Les utilisateurs recevront maintenant les informations de contact
echo    dans tous les emails d'administration.
echo.
pause
