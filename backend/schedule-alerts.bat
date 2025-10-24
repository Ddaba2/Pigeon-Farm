@echo off
REM Script pour programmer les alertes automatiques sur Windows
REM À exécuter avec le Planificateur de tâches Windows

echo Demarrage des alertes automatiques PigeonFarm...
echo Date: %date% %time%

cd /d "%~dp0"
node scripts/runAlerts.js

echo Alertes automatiques terminees.
pause
