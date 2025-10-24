import React, { useState, useEffect } from 'react';
import { Archive, Trash2, RotateCcw, BarChart3, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../utils/api';

interface ArchiveStats {
  activeNotifications: number;
  archivedNotifications: number;
  activePushNotifications: number;
  archivedPushNotifications: number;
  auditLogs: number;
  resetCodes: number;
}

interface ArchiveLog {
  id: number;
  archive_type: string;
  items_archived: number;
  items_deleted: number;
  execution_time_ms: number;
  status: string;
  error_message?: string;
  executed_at: string;
  executed_by_username?: string;
}

const ArchiveManagement: React.FC = () => {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [logs, setLogs] = useState<ArchiveLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await apiService.get('/archive/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Charger les logs d'archivage
  const loadLogs = async () => {
    try {
      const response = await apiService.get('/archive/logs?limit=20');
      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    }
  };

  // Exécuter l'archivage complet
  const runFullArchive = async () => {
    if (!confirm('Êtes-vous sûr de vouloir exécuter l\'archivage complet ? Cette action ne peut pas être annulée.')) {
      return;
    }

    try {
      setRunning(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiService.post('/archive/run');
      
      if (response.success) {
        setSuccess('Archivage exécuté avec succès');
        await loadStats();
        await loadLogs();
      } else {
        setError('Erreur lors de l\'exécution de l\'archivage');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'exécution de l\'archivage:', error);
      setError('Erreur lors de l\'exécution de l\'archivage');
    } finally {
      setRunning(false);
    }
  };

  // Nettoyer les logs
  const cleanLogs = async () => {
    if (!confirm('Êtes-vous sûr de vouloir nettoyer les anciens logs ?')) {
      return;
    }

    try {
      setRunning(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiService.post('/archive/clean-logs');
      
      if (response.success) {
        setSuccess('Nettoyage des logs exécuté avec succès');
        await loadStats();
        await loadLogs();
      } else {
        setError('Erreur lors du nettoyage des logs');
      }
    } catch (error: any) {
      console.error('Erreur lors du nettoyage des logs:', error);
      setError('Erreur lors du nettoyage des logs');
    } finally {
      setRunning(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadLogs()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Masquer les messages après 5 secondes
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Archive className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestion de l'Archivage
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={cleanLogs}
            disabled={running}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Nettoyer les logs</span>
          </button>
          
          <button
            onClick={runFullArchive}
            disabled={running}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Archive className="h-4 w-4" />
            <span>{running ? 'Archivage...' : 'Archivage complet'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Actives et archivées
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Actives</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.activeNotifications}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Archivées</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.archivedNotifications}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <Archive className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications Push
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Actives et archivées
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Actives</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.activePushNotifications}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Archivées</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.archivedPushNotifications}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <Trash2 className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Logs et Codes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  À nettoyer
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Logs d'audit</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.auditLogs}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Codes de reset</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.resetCodes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs d'archivage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historique des Archivages
          </h3>
        </div>
        
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun log d'archivage disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Archivés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supprimés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.archive_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.items_archived}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.items_deleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.execution_time_ms}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : log.status === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.executed_at).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ Informations sur l'archivage
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Les notifications lues sont archivées après 30 jours</li>
          <li>• Les notifications push lues sont archivées après 60 jours</li>
          <li>• Les logs d'audit sont supprimés après 1 an</li>
          <li>• Les codes de réinitialisation expirés sont supprimés automatiquement</li>
          <li>• L'archivage automatique s'exécute quotidiennement</li>
        </ul>
      </div>
    </div>
  );
};

export default ArchiveManagement;
