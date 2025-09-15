import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar, 
  Clock, 
  BarChart3,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import apiService from '../utils/api';

interface UserTrends {
  userTrends: Array<{
    date: string;
    new_users: number;
    new_admins: number;
    new_regular_users: number;
  }>;
  loginActivity: Array<{
    date: string;
    daily_logins: number;
    unique_users: number;
  }>;
  globalStats: {
    total_users: number;
    total_admins: number;
    total_regular_users: number;
    active_last_7_days: number;
    active_last_30_days: number;
    new_users_last_7_days: number;
    new_users_last_30_days: number;
  };
  loginHours: Array<{
    hour: number;
    login_count: number;
  }>;
}

interface ActivityData {
  dailyActivity: Array<{
    date: string;
    unique_users: number;
    total_logins: number;
    avg_session_duration: number;
  }>;
  topActiveUsers: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    last_login: string;
    created_at: string;
    login_count: number;
  }>;
  period: number;
}

function AdminTrends() {
  const [trends, setTrends] = useState<UserTrends | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'patterns'>('overview');

  const loadTrendsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les tendances utilisateurs
      const trendsResponse = await apiService.get('/admin/trends/users');
      if (trendsResponse.success) {
        setTrends(trendsResponse.data);
      }

      // Charger les données d'activité
      const activityResponse = await apiService.get(`/admin/trends/activity?period=${selectedPeriod}`);
      if (activityResponse.success) {
        setActivity(activityResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tendances:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadTrendsData();
  }, [loadTrendsData]);

  const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    bgColor: string;
    subtitle?: string;
  }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const generateChartData = (data: any[], key: string) => {
    return data.map(item => ({
      x: formatDate(item.date),
      y: item[key]
    }));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tendances Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Analyse des tendances d'inscription et d'activité</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
          <button
            onClick={loadTrendsData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'activity', label: 'Activité', icon: Activity },
            { id: 'patterns', label: 'Patterns', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Vue d'ensemble */}
      {activeTab === 'overview' && trends && (
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Utilisateurs"
              value={trends.globalStats.total_users}
              icon={Users}
              color="text-blue-600"
              bgColor="bg-blue-50"
              subtitle={`${trends.globalStats.total_admins} admins`}
            />
            <StatCard
              title="Actifs (7j)"
              value={trends.globalStats.active_last_7_days}
              icon={Activity}
              color="text-green-600"
              bgColor="bg-green-50"
              subtitle={`${Math.round((trends.globalStats.active_last_7_days / trends.globalStats.total_users) * 100)}% du total`}
            />
            <StatCard
              title="Nouveaux (7j)"
              value={trends.globalStats.new_users_last_7_days}
              icon={TrendingUp}
              color="text-purple-600"
              bgColor="bg-purple-50"
              subtitle={`${trends.globalStats.new_users_last_30_days} sur 30j`}
            />
            <StatCard
              title="Taux d'Activité"
              value={`${Math.round((trends.globalStats.active_last_30_days / trends.globalStats.total_users) * 100)}%`}
              icon={BarChart3}
              color="text-orange-600"
              bgColor="bg-orange-50"
              subtitle="30 derniers jours"
            />
          </div>

          {/* Graphique des nouvelles inscriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelles Inscriptions</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Graphique des inscriptions</p>
                <p className="text-sm text-gray-400 mt-2">
                  {trends.userTrends.length} points de données disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activité */}
      {activeTab === 'activity' && activity && (
        <div className="space-y-6">
          {/* Top utilisateurs actifs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs les Plus Actifs</h3>
              <p className="text-sm text-gray-600 mt-1">Top 10 des utilisateurs par nombre de connexions</p>
            </div>
            <div className="divide-y divide-gray-200">
              {activity.topActiveUsers.map((user, index) => (
                <div key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.login_count} connexions</p>
                      <p className="text-xs text-gray-500">
                        Dernière: {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité quotidienne */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Quotidienne</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Graphique d'activité quotidienne</p>
                <p className="text-sm text-gray-400 mt-2">
                  {activity.dailyActivity.length} jours d'activité
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patterns */}
      {activeTab === 'patterns' && trends && (
        <div className="space-y-6">
          {/* Heatmap des heures de connexion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patterns de Connexion par Heure</h3>
            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = trends.loginHours.find(h => h.hour === hour);
                const count = hourData?.login_count || 0;
                const maxCount = Math.max(...trends.loginHours.map(h => h.login_count));
                const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={hour} className="text-center">
                    <div
                      className="h-8 rounded mb-1"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                        minHeight: '8px'
                      }}
                      title={`${hour}h: ${count} connexions`}
                    />
                    <span className="text-xs text-gray-500">{hour}h</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Moins d'activité</span>
              <div className="flex space-x-1">
                {[0, 25, 50, 75, 100].map((intensity) => (
                  <div
                    key={intensity}
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${intensity / 100})` }}
                  />
                ))}
              </div>
              <span>Plus d'activité</span>
            </div>
          </div>

          {/* Résumé des patterns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Heure de Pic</h4>
              <p className="text-2xl font-bold text-blue-600">
                {trends.loginHours.length > 0 
                  ? `${trends.loginHours.reduce((max, hour) => hour.login_count > max.login_count ? hour : max).hour}h`
                  : 'N/A'
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">Connexions les plus fréquentes</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Période Calme</h4>
              <p className="text-2xl font-bold text-gray-600">2h-6h</p>
              <p className="text-sm text-gray-500 mt-1">Moins d'activité</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Total Connexions</h4>
              <p className="text-2xl font-bold text-green-600">
                {trends.loginHours.reduce((sum, hour) => sum + hour.login_count, 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">7 derniers jours</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTrends;
