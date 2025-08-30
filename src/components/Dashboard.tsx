import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Activity, Heart, TrendingUp, Calendar, Clock } from 'lucide-react';

interface DashboardStats {
  totalCouples: number;
  totalEggs: number;
  totalPigeonneaux: number;
  healthAlerts: number;
  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    date: string;
    status: 'success' | 'warning' | 'info';
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCouples: 0,
    totalEggs: 0,
    totalPigeonneaux: 0,
    healthAlerts: 0,
    recentActivities: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Simulation des données - à remplacer par l'appel API réel
      const mockStats: DashboardStats = {
        totalCouples: 24,
        totalEggs: 18,
        totalPigeonneaux: 12,
        healthAlerts: 2,
        recentActivities: [
          {
            id: 1,
            type: 'couple',
            description: 'Nouveau couple formé : Pigeon A + Pigeon B',
            date: '2024-01-15',
            status: 'success'
          },
          {
            id: 2,
            type: 'egg',
            description: '3 œufs pondus par le couple #12',
            date: '2024-01-14',
            status: 'info'
          },
          {
            id: 3,
            type: 'health',
            description: 'Vaccination programmée pour la semaine prochaine',
            date: '2024-01-13',
            status: 'warning'
          },
          {
            id: 4,
            type: 'pigeonneau',
            description: '2 pigeonneaux nés du couple #8',
            date: '2024-01-12',
            status: 'success'
          }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Aperçu de votre élevage de pigeons
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Dernière mise à jour: {new Date().toLocaleString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCouples}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Œufs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEggs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pigeonneaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPigeonneaux}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertes Santé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.healthAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activités récentes
        </h2>
        <div className="space-y-3">
          {stats.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Nouveau couple</span>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Enregistrer œufs</span>
          </button>
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
            <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Nouveau pigeonneau</span>
          </button>
          <button className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-red-900 dark:text-red-100">Contrôle santé</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;