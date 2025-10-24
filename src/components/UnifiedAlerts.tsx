import React, { useState, useEffect } from 'react';
import { AlertTriangle, Heart, Egg, Baby, Syringe, DollarSign, RefreshCw, Bell, X } from 'lucide-react';
import { getUserAlerts } from '../utils/api';

interface Alert {
  type: 'health' | 'hatching' | 'weaning' | 'vaccination' | 'sales';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  data: any;
}

interface UnifiedAlertsProps {
  onClose?: () => void;
  showAsModal?: boolean;
}

const UnifiedAlerts: React.FC<UnifiedAlertsProps> = ({ onClose, showAsModal = false }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Icônes par type d'alerte
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'hatching':
        return <Egg className="h-5 w-5 text-yellow-500" />;
      case 'weaning':
        return <Baby className="h-5 w-5 text-blue-500" />;
      case 'vaccination':
        return <Syringe className="h-5 w-5 text-orange-500" />;
      case 'sales':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Couleurs par priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Badge de priorité
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">URGENT</span>;
      case 'medium':
        return <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">IMPORTANT</span>;
      case 'low':
        return <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">INFO</span>;
      default:
        return null;
    }
  };

  // Charger les alertes
  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserAlerts();
      
      if (response.success) {
        setAlerts(response.data || []);
        setLastUpdate(new Date());
      } else {
        setError('Erreur lors du chargement des alertes');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des alertes:', error);
      setError('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les alertes au montage
  useEffect(() => {
    loadAlerts();
  }, []);

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Alertes Intelligentes
          </h2>
          {alerts.length > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser les alertes"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {showAsModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dernière mise à jour */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des alertes...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={loadAlerts}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune alerte pour le moment</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Le système surveille automatiquement votre élevage
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                    {getPriorityBadge(alert.priority)}
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {alert.message}
                  </p>
                  
                  {/* Informations supplémentaires */}
                  {alert.data && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {alert.data.coupleId && (
                        <span>Couple #{alert.data.coupleId}</span>
                      )}
                      {alert.data.age && (
                        <span> • Âge: {alert.data.age} jours</span>
                      )}
                      {alert.data.daysSinceLaying && (
                        <span> • Incubation: {alert.data.daysSinceLaying} jours</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {alerts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Résumé des alertes
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="text-center">
              <div className="text-red-500 font-bold">
                {alerts.filter(a => a.priority === 'high').length}
              </div>
              <div className="text-gray-500">Urgentes</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-500 font-bold">
                {alerts.filter(a => a.priority === 'medium').length}
              </div>
              <div className="text-gray-500">Importantes</div>
            </div>
            <div className="text-center">
              <div className="text-green-500 font-bold">
                {alerts.filter(a => a.priority === 'low').length}
              </div>
              <div className="text-gray-500">Info</div>
            </div>
            <div className="text-center">
              <div className="text-blue-500 font-bold">
                {alerts.filter(a => a.type === 'health').length}
              </div>
              <div className="text-gray-500">Santé</div>
            </div>
            <div className="text-center">
              <div className="text-purple-500 font-bold">
                {alerts.filter(a => a.type === 'hatching').length}
              </div>
              <div className="text-gray-500">Éclosions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {content}
    </div>
  );
};

export default UnifiedAlerts;
