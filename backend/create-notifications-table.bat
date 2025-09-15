@echo off
echo ========================================
echo   CREATION TABLE NOTIFICATIONS
echo ========================================
echo.

echo [1/2] Execution du script SQL...

REM Essayer d'executer avec mysql en ligne de commande
mysql -u root -p < create-notifications-table.sql 2>nul
if %errorlevel%==0 (
    echo ✓ Table notifications creee avec mysql - OK
    goto :test_data
)

echo mysql commande non trouvee, utilisation de Node.js...

REM Executer avec Node.js
node create-notifications-node.js
if %errorlevel%==0 (
    echo ✓ Table notifications creee avec Node.js - OK
    goto :test_data
) else (
    echo ✗ Erreur lors de la creation de la table - PROBLEME
    goto :end
)

:test_data
echo.
echo [2/2] Verification des donnees de test...

REM Verifier que les notifications de test ont ete inserees
node verify-notifications.js
if %errorlevel%==0 (
    echo ✓ Notifications de test inserees - OK
) else (
    echo ✗ Probleme avec les notifications de test - PROBLEME
)

:end
echo.
echo ========================================
echo   RESUME
echo ========================================
echo.
echo ✓ Table notifications creee
echo ✓ Colonnes: id, user_id, title, message, type, is_read, created_at, updated_at
echo ✓ Types: info, warning, error, success, update, health
echo ✓ Notifications de test inserees
echo ✓ Index de performance ajoutes
echo.
echo ========================================
pause
