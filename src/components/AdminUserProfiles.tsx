import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import apiService from '../utils/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string;
  activity_status: 'active' | 'inactive' | 'dormant';
}

interface UserDetails {
  user: UserProfile;
  loginHistory: Array<{
    login_time: string;
    action: string;
    source: string;
    details: string;
  }>;
  usageStats: {
    total_logins: number;
    first_seen: string;
    last_seen: string;
    days_since_registration: number;
    days_since_last_login: number | null;
  };
  recentActivity: Array<{
    activity_type: string;
    activity_time: string;
    description: string;
    status: string;
  }>;
}

interface UserAnalytics {
  monthlyStats: Array<{
    month: string;
    login_count: number;
    first_login: string;
    last_login: string;
  }>;
  sessionStats: Array<{
    metric: string;
    value: string;
    unit: string;
  }>;
  usagePatterns: Array<{
    hour: number;
    frequency: number;
    pattern_type: string;
  }>;
}

function AdminUserProfiles() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analytics'>('overview');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/users');
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserDetails = useCallback(async (userId: number) => {
    try {
      const [profileResponse, analyticsResponse] = await Promise.all([
        apiService.get(`/admin/profiles/${userId}`),
        apiService.get(`/admin/profiles/${userId}/analytics`)
      ]);

      if (profileResponse.success) {
        setSelectedUser(profileResponse.data);
      }

      if (analyticsResponse.success) {
        setUserAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'dormant': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return AlertCircle;
      case 'dormant': return XCircle;
      default: return User;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
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
          <h1 className="text-3xl font-bold text-gray-900">Profils Utilisateurs Détaillés</h1>
          <p className="text-gray-600 mt-2">Analyse complète des profils et activités utilisateurs</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des utilisateurs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Utilisateurs ({filteredUsers.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {paginatedUsers.map((user) => {
                const StatusIcon = getStatusIcon(user.activity_status);
                return (
                  <div
                    key={user.id}
                    onClick={() => loadUserDetails(user.id)}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedUser?.user.id === user.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.activity_status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {user.activity_status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Précédent</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    <span>Suivant</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Détails de l'utilisateur sélectionné */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informations de Base</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.user.activity_status)}`}>
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedUser.user.activity_status);
                      return <StatusIcon className="h-4 w-4 mr-2" />;
                    })()}
                    {selectedUser.user.activity_status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nom d'utilisateur</p>
                        <p className="text-sm text-gray-600">{selectedUser.user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{selectedUser.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Rôle</p>
                        <p className="text-sm text-gray-600 capitalize">{selectedUser.user.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Inscrit le</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedUser.user.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dernière connexion</p>
                        <p className="text-sm text-gray-600">
                          {selectedUser.user.last_login ? formatDate(selectedUser.user.last_login) : 'Jamais'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques d'utilisation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d'Utilisation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.usageStats.total_logins}</p>
                    <p className="text-sm text-gray-500">Connexions totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedUser.usageStats.days_since_registration}</p>
                    <p className="text-sm text-gray-500">Jours depuis inscription</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedUser.usageStats.days_since_last_login || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Jours depuis dernière connexion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedUser.usageStats.total_logins > 0 
                        ? Math.round(selectedUser.usageStats.days_since_registration / selectedUser.usageStats.total_logins * 10) / 10
                        : 0
                      }
                    </p>
                    <p className="text-sm text-gray-500">Connexions/jour</p>
                  </div>
                </div>
              </div>

              {/* Tabs pour historique et analytics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: 'Activité Récente', icon: Activity },
                      { id: 'history', label: 'Historique', icon: Clock },
                      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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

                <div className="p-6">
                  {/* Activité récente */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Activité Récente</h4>
                      <div className="space-y-3">
                        {selectedUser.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <Activity className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500">{formatDate(activity.activity_time)}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                activity.status === 'success' 
                                  ? 'text-green-800 bg-green-100' 
                                  : 'text-red-800 bg-red-100'
                              }`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historique des connexions */}
                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Historique des Connexions</h4>
                      <div className="space-y-3">
                        {selectedUser.loginHistory.map((login, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{login.action}</p>
                              <p className="text-xs text-gray-500">{login.details}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <p className="text-xs text-gray-500">{formatDate(login.login_time)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analytics */}
                  {activeTab === 'analytics' && userAnalytics && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-gray-900">Analytics Détaillées</h4>
                      
                      {/* Statistiques de session */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Statistiques de Session</h5>
                        <div className="grid grid-cols-3 gap-4">
                          {userAnalytics.sessionStats.map((stat, index) => (
                            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-lg font-bold text-blue-600">{stat.value}</p>
                              <p className="text-sm text-gray-500">{stat.metric}</p>
                              <p className="text-xs text-gray-400">{stat.unit}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Patterns d'utilisation */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Patterns d'Utilisation par Heure</h5>
                        <div className="grid grid-cols-12 gap-1">
                          {Array.from({ length: 24 }, (_, hour) => {
                            const hourData = userAnalytics.usagePatterns.find(h => h.hour === hour);
                            const frequency = hourData?.frequency || 0;
                            const maxFreq = Math.max(...userAnalytics.usagePatterns.map(h => h.frequency));
                            const intensity = maxFreq > 0 ? (frequency / maxFreq) * 100 : 0;
                            
                            return (
                              <div key={hour} className="text-center">
                                <div
                                  className="h-6 rounded mb-1"
                                  style={{
                                    backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                                    minHeight: '4px'
                                  }}
                                  title={`${hour}h: ${frequency} connexions`}
                                />
                                <span className="text-xs text-gray-500">{hour}h</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un utilisateur</h3>
              <p className="text-gray-500">Cliquez sur un utilisateur dans la liste pour voir ses détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserProfiles;
