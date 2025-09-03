import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Activity, Heart, TrendingUp, Calendar, Clock, DollarSign } from 'lucide-react';
import apiService from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalCouples: number;
  totalEggs: number;
  totalPigeonneaux: number;
  totalHealthRecords: number;
  totalSales: number;
  totalRevenue: number;
  recentActivities: Array<{
  id: number;
    type: string;
  description: string;
  date: string;
    icon: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCouples: 0,
    totalEggs: 0,
    totalPigeonneaux: 0,
    totalHealthRecords: 0,
    totalSales: 0,
    totalRevenue: 0,
    recentActivities: []
  });

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (response.success && response.data) {
        setStats({
            totalCouples: response.data.totalCouples || 0,
            totalEggs: response.data.totalEggs || 0,
            totalPigeonneaux: response.data.totalPigeonneaux || 0,
            totalHealthRecords: response.data.totalHealthRecords || 0,
            totalSales: response.data.totalSales || 0,
            totalRevenue: response.data.totalRevenue || 0,
            recentActivities: response.data.recentActivities || []
          });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      }
    };

    loadDashboardData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="h-4 w-4" />;
      case 'FileText': return <FileText className="h-4 w-4" />;
      case 'Activity': return <Activity className="h-4 w-4" />;
      case 'Heart': return <Heart className="h-4 w-4" />;
      case 'DollarSign': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

    return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
          <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de votre élevage</p>
      </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Widgets de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCouples}</p>
              </div>
            </div>
          </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Œufs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEggs}</p>
              </div>
            </div>
          </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pigeonneaux</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPigeonneaux}</p>
              </div>
            </div>
          </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Santé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHealthRecords}</p>
              </div>
            </div>
          </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSales}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalRevenue?.toLocaleString('fr-FR') || '0'} XOF</p>
              </div>
            </div>
          </div>
        </div>

      {/* Activités récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activités récentes</h3>
        <div className="space-y-4">
          {stats.recentActivities.slice(0, 5).map((activity, index) => (
            <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {getIcon(activity.icon)}
                </div>
              <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(activity.date)}
                  </p>
                </div>
                </div>
          ))}
            </div>
          </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button 
            onClick={() => navigate('/couples')}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Nouveau couple</span>
          </button>
          <button 
            onClick={() => navigate('/eggs')}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Enregistrer œufs</span>
          </button>
          <button 
            onClick={() => navigate('/pigeonneaux')}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Nouveau pigeonneau</span>
          </button>
          <button 
            onClick={() => navigate('/health')}
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Enregistrement santé</span>
          </button>
          <button 
            onClick={() => navigate('/statistics')}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
          >
            <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Nouvelle vente</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;