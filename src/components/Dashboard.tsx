import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { TrendingUp, Users, Activity, Bell } from 'lucide-react';
import { Statistics, Notification } from '../types/types';


function Dashboard() {

  const [stats, setStats] = useState<Statistics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, notifData] = await Promise.all([
        api.getStatistics(),
        api.getNotifications()
      ]);
      
      // Vérifier que les données sont valides
      if (statsData && typeof statsData === 'object') {
        setStats(statsData);
      } else {
        console.warn('Données de statistiques invalides:', statsData);
        setStats(null);
      }
      
      if (Array.isArray(notifData)) {
        setNotifications(notifData);
      } else {
        console.warn('Données de notifications invalides:', notifData);
        setNotifications([]);
      }
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des données:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      
      // Messages d'erreur plus spécifiques
      if (errorMessage.includes('CSRF') || errorMessage.includes('Token')) {
        setError('Problème d\'authentification. Veuillez vous reconnecter.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        setError('Problème de connexion au serveur. Vérifiez votre connexion internet.');
      } else if (errorMessage.includes('500') || errorMessage.includes('serveur')) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        setError(`Erreur de récupération : ${errorMessage}`);
      }
      
      setStats(null);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté avant de charger les données
    const token = localStorage.getItem('token');
    if (token) {
      loadData();
    } else {
      setLoading(false);
      setError('Authentification requise');
    }
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Erreur de récupération des données
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={loadData}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.activeCouples || 0} / {stats?.totalCouples || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pigeonneaux vivants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.alivePigeonneaux || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              {/* <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /> */}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats?.totalRevenue || 0).toLocaleString()} XOF
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux d'éclosion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.hatchingRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications récentes</h3>
          </div>
        </div>
        <div className="p-6">
          {notifications.length > 0 ? (
            <div className="space-y-4">
        {notifications.map((n) => (
                <div key={n.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    n.type === 'warning' ? 'bg-yellow-500' : 
                    n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{n.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune notification récente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;