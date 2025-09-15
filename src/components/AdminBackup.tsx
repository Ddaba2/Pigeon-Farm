import { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  Clock, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  FileText,
  Calendar,
  Settings
} from 'lucide-react';
import apiService from '../utils/api';

interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'in_progress';
}

interface SystemInfo {
  databaseSize: number;
  totalFiles: number;
  lastBackup: string | null;
  backupLocation: string;
  autoBackupEnabled: boolean;
  autoBackupInterval: string;
}

function AdminBackup() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    databaseSize: 0,
    totalFiles: 0,
    lastBackup: null,
    backupLocation: '/backups',
    autoBackupEnabled: false,
    autoBackupInterval: 'daily'
  });
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<'restore' | 'delete' | null>(null);

  const loadBackupData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les informations système
      const systemResponse = await apiService.get('/admin/backup/system');
      if (systemResponse.success && systemResponse.data) {
        setSystemInfo(systemResponse.data);
      }

      // Charger la liste des sauvegardes
      const backupsResponse = await apiService.get('/admin/backup/list');
      if (backupsResponse.success && backupsResponse.data) {
        setBackups(backupsResponse.data);
      }
    } catch (error) {
      // Erreur chargement données backup ignorée
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackupData();
  }, [loadBackupData]);

  const createBackup = async (type: 'full' | 'incremental' = 'full') => {
    try {
      setCreatingBackup(true);
      const response = await apiService.post('/admin/backup/create', { type });
      if (response.success) {
        await loadBackupData(); // Recharger la liste
      }
    } catch (error) {
      // Erreur création backup ignorée
    } finally {
      setCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      const response = await apiService.post(`/admin/backup/restore/${backupId}`);
      if (response.success) {
        setShowConfirmModal(false);
        setSelectedBackup(null);
        setModalAction(null);
      }
    } catch (error) {
      // Erreur restauration ignorée
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await apiService.delete(`/admin/backup/${backupId}`);
      if (response.success) {
        await loadBackupData(); // Recharger la liste
        setShowConfirmModal(false);
        setSelectedBackup(null);
        setModalAction(null);
      }
    } catch (error) {
      // Erreur suppression ignorée
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      case 'in_progress': return 'En cours';
      default: return 'Inconnu';
    }
  };

  const handleAction = (action: 'restore' | 'delete', backupId: string) => {
    setModalAction(action);
    setSelectedBackup(backupId);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (!selectedBackup || !modalAction) return;
    
    if (modalAction === 'restore') {
      restoreBackup(selectedBackup);
    } else if (modalAction === 'delete') {
      deleteBackup(selectedBackup);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Sauvegarde & Restauration</h1>
        <p className="text-gray-600 mt-2">Gérez les sauvegardes et la restauration des données</p>
      </div>

      {/* Informations système */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Base de données</h3>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taille</span>
              <span className="font-medium text-gray-900">{formatFileSize(systemInfo.databaseSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dernière sauvegarde</span>
              <span className="font-medium text-gray-900">
                {systemInfo.lastBackup ? formatDate(systemInfo.lastBackup) : 'Jamais'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fichiers</h3>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total fichiers</span>
              <span className="font-medium text-gray-900">{systemInfo.totalFiles.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Emplacement</span>
              <span className="font-medium text-gray-900">{systemInfo.backupLocation}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sauvegarde Auto</h3>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Statut</span>
              <span className={`font-medium ${systemInfo.autoBackupEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {systemInfo.autoBackupEnabled ? 'Activé' : 'Désactivé'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fréquence</span>
              <span className="font-medium text-gray-900">
                {systemInfo.autoBackupInterval === 'daily' ? 'Quotidienne' :
                 systemInfo.autoBackupInterval === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions de sauvegarde */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une Sauvegarde</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => createBackup('full')}
            disabled={creatingBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Sauvegarde Complète</span>
          </button>
          <button
            onClick={() => createBackup('incremental')}
            disabled={creatingBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sauvegarde Incrémentale</span>
          </button>
          <button
            onClick={loadBackupData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
        {creatingBackup && (
          <div className="mt-4 flex items-center space-x-2 text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Création de la sauvegarde en cours...</span>
          </div>
        )}
      </div>

      {/* Liste des sauvegardes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sauvegardes Disponibles ({backups.length})
          </h3>
        </div>
        
        {backups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du fichier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <HardDrive className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {backup.filename}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.type === 'full' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {backup.type === 'full' ? 'Complète' : 'Incrémentale'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(backup.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                        {getStatusIcon(backup.status)}
                        <span className="ml-1">{getStatusText(backup.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => handleAction('restore', backup.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            title="Restaurer cette sauvegarde"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Restaurer</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', backup.id)}
                          className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          title="Supprimer cette sauvegarde"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <HardDrive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune sauvegarde</h3>
            <p className="text-gray-500">
              Créez votre première sauvegarde pour protéger vos données.
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Confirmer l'action
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {modalAction === 'restore' 
                    ? 'Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action remplacera toutes les données actuelles.'
                    : 'Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.'
                  }
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBackup(null);
                    setModalAction(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                    modalAction === 'delete' 
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBackup;
