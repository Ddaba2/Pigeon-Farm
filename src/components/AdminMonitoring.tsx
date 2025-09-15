import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Users, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import apiService from '../utils/api';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCouples: number;
  totalEggs: number;
  totalPigeonneaux: number;
  totalSales: number;
  serverUptime: string;
  databaseRecords: number;
  responseTime: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

function AdminMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalCouples: 0,
    totalEggs: 0,
    totalPigeonneaux: 0,
    totalSales: 0,
    serverUptime: '0h 0m',
    databaseRecords: 0,
    responseTime: 0
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les métriques système
      const response = await apiService.get('/admin/metrics');
      if (response.success && response.data) {
        setMetrics(response.data);
      }

      // Charger les logs récents
      const logsResponse = await apiService.get('/admin/logs');
      if (logsResponse.success && logsResponse.data) {
        setLogs(logsResponse.data);
      }
    } catch (error) {
      // Erreur chargement métriques ignorée
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, loadMetrics]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
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
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Système</h1>
          <p className="text-gray-600 mt-2">Surveillez les performances et l'état du système</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </span>
          </button>
          <button
            onClick={loadMetrics}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs Actifs</h3>
              <p className="text-3xl font-bold text-blue-600">{metrics.activeUsers}</p>
              <p className="text-sm text-gray-500">Connectés maintenant</p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
              <p className="text-3xl font-bold text-green-600">{metrics.totalSessions}</p>
              <p className="text-sm text-gray-500">Sessions actives</p>
            </div>
            <Activity className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Erreurs</h3>
              <p className={`text-3xl font-bold ${getStatusColor(metrics.errorCount, { good: 0, warning: 5 })}`}>
                {metrics.errorCount}
              </p>
              <p className="text-sm text-gray-500">Aujourd'hui</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Temps de réponse</h3>
              <p className={`text-3xl font-bold ${getStatusColor(metrics.responseTime, { good: 200, warning: 500 })}`}>
                {metrics.responseTime}ms
              </p>
              <p className="text-sm text-gray-500">Moyenne</p>
            </div>
            <Clock className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Métriques base de données */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-medium text-blue-600">
                {metrics.totalUsers}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actifs (7j)</span>
              <span className="font-medium text-green-600">
                {metrics.activeUsers}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Données</h3>
            <Database className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Couples</span>
              <span className="font-medium text-green-600">
                {metrics.totalCouples}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Œufs</span>
              <span className="font-medium text-green-600">
                {metrics.totalEggs}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pigeonneaux</span>
              <span className="font-medium text-green-600">
                {metrics.totalPigeonneaux}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ventes</span>
              <span className="font-medium text-green-600">
                {metrics.totalSales}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Enregistrements</span>
              <span className="font-medium text-purple-600">
                {metrics.databaseRecords}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Temps réponse</span>
              <span className="font-medium text-purple-600">
                {metrics.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-purple-600">
                {metrics.serverUptime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Système</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime serveur</span>
              <span className="text-sm font-medium text-gray-900">{metrics.serverUptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Connexions DB</span>
              <span className="text-sm font-medium text-gray-900">{metrics.databaseConnections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Dernière mise à jour</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État des Services</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Backend</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">En ligne</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de données</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Connectée</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Système de fichiers</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs système */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Logs Système Récents</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {logs.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getLogLevelColor(log.level)}`}>
                      {getLogLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500 ml-2">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {log.source}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun log récent</h3>
              <p className="text-sm text-gray-500">
                Les logs système apparaîtront ici lorsqu'ils seront disponibles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMonitoring;
