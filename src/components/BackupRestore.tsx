import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Save, Trash2, AlertTriangle, CheckCircle, Database, Calendar, Clock } from 'lucide-react';
import { 
  exportUserData, 
  saveBackupToServer, 
  importUserData, 
  listBackups, 
  restoreFromServerBackup,
  clearAllUserData 
} from '../utils/api';

interface BackupInfo {
  filename: string;
  filepath: string;
  size: string;
  createdAt: string;
  modifiedAt: string;
}

const BackupRestore: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [serverBackups, setServerBackups] = useState<BackupInfo[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Afficher un message temporaire
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 📦 Exporter les données (téléchargement JSON)
  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await exportUserData();
      
      // Créer un blob et télécharger
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pigeon-farm-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      // Safely remove the temporary anchor if still attached
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      } else if (typeof a.remove === 'function') {
        a.remove();
      }
      window.URL.revokeObjectURL(url);
      
      showMessage('success', 'Sauvegarde exportée avec succès !');
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  // 💾 Sauvegarder sur le serveur
  const handleSaveToServer = async () => {
    try {
      setLoading(true);
      const response = await saveBackupToServer();
      
      if (response.success) {
        showMessage('success', `Sauvegarde créée : ${response.data.filename}`);
        loadServerBackups(); // Recharger la liste
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // 📥 Importer depuis un fichier
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          const confirmRestore = window.confirm(
            '⚠️ ATTENTION : Cette opération va ajouter les données de la sauvegarde à vos données actuelles.\n\n' +
            'Voulez-vous continuer ?'
          );
          
          if (!confirmRestore) {
            setLoading(false);
            return;
          }
          
          const response = await importUserData(backupData, false);
          
          if (response.success) {
            showMessage('success', `Données restaurées : ${JSON.stringify(response.data.imported)}`);
            // Recharger la page pour afficher les nouvelles données
            setTimeout(() => window.location.reload(), 2000);
          }
        } catch (error: any) {
          showMessage('error', 'Fichier de sauvegarde invalide');
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de l\'import');
      setLoading(false);
    }
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 📋 Charger les sauvegardes serveur
  const loadServerBackups = async () => {
    try {
      const response = await listBackups();
      if (response.success) {
        setServerBackups(response.data);
      }
    } catch (error: any) {
      console.error('Erreur chargement backups:', error);
    }
  };

  // 📖 Restaurer depuis le serveur
  const handleRestoreFromServer = async (filename: string) => {
    try {
      const confirmRestore = window.confirm(
        `⚠️ Voulez-vous vraiment restaurer la sauvegarde "${filename}" ?\n\n` +
        'Les données seront ajoutées à vos données actuelles.'
      );
      
      if (!confirmRestore) return;
      
      setLoading(true);
      const response = await restoreFromServerBackup(filename, false);
      
      if (response.success) {
        showMessage('success', 'Sauvegarde restaurée avec succès !');
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de la restauration');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Supprimer toutes les données
  const handleClearAllData = async () => {
    try {
      if (!confirmPassword) {
        showMessage('error', 'Veuillez entrer votre mot de passe');
        return;
      }
      
      setLoading(true);
      const response = await clearAllUserData(confirmPassword);
      
      if (response.success) {
        showMessage('success', 'Toutes les données ont été supprimées');
        setShowClearConfirm(false);
        setConfirmPassword('');
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Charger les sauvegardes au montage
  React.useEffect(() => {
    loadServerBackups();
    // Charger les préférences de sauvegarde automatique
    const savedAutoBackup = localStorage.getItem('autoBackupEnabled');
    const savedFrequency = localStorage.getItem('autoBackupFrequency');
    const savedLastBackup = localStorage.getItem('lastAutoBackup');
    
    if (savedAutoBackup) setAutoBackupEnabled(savedAutoBackup === 'true');
    if (savedFrequency) setAutoBackupFrequency(savedFrequency as 'daily' | 'weekly' | 'monthly');
    if (savedLastBackup) setLastAutoBackup(savedLastBackup);
  }, []);

  // Système de sauvegarde automatique
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const checkAndBackup = async () => {
      const now = new Date();
      const lastBackupDate = lastAutoBackup ? new Date(lastAutoBackup) : null;

      if (!lastBackupDate) {
        // Première sauvegarde
        await performAutoBackup();
        return;
      }

      const daysSinceLastBackup = Math.floor(
        (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let shouldBackup = false;

      switch (autoBackupFrequency) {
        case 'daily':
          shouldBackup = daysSinceLastBackup >= 1;
          break;
        case 'weekly':
          shouldBackup = daysSinceLastBackup >= 7;
          break;
        case 'monthly':
          shouldBackup = daysSinceLastBackup >= 30;
          break;
      }

      if (shouldBackup) {
        await performAutoBackup();
      }
    };

    // Vérifier toutes les heures
    const interval = setInterval(checkAndBackup, 60 * 60 * 1000);
    // Vérifier immédiatement au montage
    checkAndBackup();

    return () => clearInterval(interval);
  }, [autoBackupEnabled, autoBackupFrequency, lastAutoBackup]);

  // Exécuter la sauvegarde automatique
  const performAutoBackup = async () => {
    try {
      console.log('🔄 Sauvegarde automatique en cours...');
      const response = await saveBackupToServer() as any;
      
      if (response.success) {
        const now = new Date().toISOString();
        setLastAutoBackup(now);
        localStorage.setItem('lastAutoBackup', now);
        console.log('✅ Sauvegarde automatique réussie');
        loadServerBackups();
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde automatique:', error);
    }
  };

  // Activer/Désactiver la sauvegarde automatique
  const toggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('autoBackupEnabled', enabled.toString());
    
    if (enabled) {
      showMessage('success', 'Sauvegarde automatique activée');
    } else {
      showMessage('success', 'Sauvegarde automatique désactivée');
    }
  };

  // Changer la fréquence de sauvegarde
  const changeFrequency = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setAutoBackupFrequency(frequency);
    localStorage.setItem('autoBackupFrequency', frequency);
    
    const labels = {
      daily: 'quotidienne',
      weekly: 'hebdomadaire',
      monthly: 'mensuelle'
    };
    
    showMessage('success', `Fréquence changée : ${labels[frequency]}`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sauvegarde & Restauration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exportez et importez vos données pour les sécuriser
            </p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exporter */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Exporter mes données</span>
          </button>

          {/* Sauvegarder sur serveur */}
          <button
            onClick={handleSaveToServer}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>Sauvegarder sur serveur</span>
          </button>

          {/* Importer */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Importer depuis un fichier</span>
            </label>
          </div>

          {/* Supprimer */}
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>Supprimer toutes mes données</span>
          </button>
        </div>
      </div>

      {/* Sauvegardes serveur */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Sauvegardes disponibles sur le serveur
        </h3>

        {serverBackups.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Aucune sauvegarde disponible
          </p>
        ) : (
          <div className="space-y-2">
            {serverBackups.map((backup) => (
              <div
                key={backup.filename}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {backup.filename}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(backup.createdAt).toLocaleString('fr-FR')} - {backup.size}
                  </p>
                </div>
                <button
                  onClick={() => handleRestoreFromServer(backup.filename)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Restaurer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration Sauvegarde Automatique */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Sauvegarde Automatique
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configurez des sauvegardes automatiques régulières
            </p>
          </div>
        </div>

        {/* Toggle Activation */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Activer la sauvegarde automatique
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crée automatiquement des sauvegardes selon la fréquence choisie
            </p>
          </div>
          <button
            onClick={() => toggleAutoBackup(!autoBackupEnabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              autoBackupEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                autoBackupEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Fréquence */}
        {autoBackupEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fréquence de sauvegarde
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => changeFrequency('daily')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    autoBackupFrequency === 'daily'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="font-medium">Quotidien</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Chaque jour</span>
                </button>

                <button
                  onClick={() => changeFrequency('weekly')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    autoBackupFrequency === 'weekly'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="font-medium">Hebdomadaire</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Chaque semaine</span>
                </button>

                <button
                  onClick={() => changeFrequency('monthly')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    autoBackupFrequency === 'monthly'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="font-medium">Mensuel</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Chaque mois</span>
                </button>
              </div>
            </div>

            {/* Dernière sauvegarde */}
            {lastAutoBackup && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Dernière sauvegarde automatique :
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {new Date(lastAutoBackup).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            {/* Informations */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  <p className="font-medium mb-1">Comment ça fonctionne ?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>La sauvegarde se fait automatiquement en arrière-plan</li>
                    <li>Vérification toutes les heures</li>
                    <li>Aucune action requise de votre part</li>
                    <li>Les sauvegardes apparaissent dans la liste ci-dessus</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation suppression */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4 text-red-600">
              <AlertTriangle className="h-8 w-8" />
              <h3 className="text-xl font-bold">⚠️ Confirmation requise</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cette action est <strong>IRRÉVERSIBLE</strong> et supprimera toutes vos données :
              couples, œufs, pigeonneaux, santé, ventes, etc.
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Entrez votre mot de passe pour confirmer :
            </p>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setConfirmPassword('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleClearAllData}
                disabled={loading || !confirmPassword}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestore;
