@echo off
echo 🚀 Démarrage du serveur Pigeon Farm...
echo.

cd backend

echo 📊 Vérification de la base de données...
node check-mysql.js

echo.
echo 🔧 Démarrage du serveur sur le port 3002...
echo.

npm start

pause
