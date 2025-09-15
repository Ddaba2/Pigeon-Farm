import { useState, useEffect, useCallback } from 'react';
import { Users, Shield, BarChart3, Settings, UserCheck, UserX, AlertTriangle, Trash2, Heart, Activity, DollarSign, FileText, Clock, Calendar } from 'lucide-react';
import { User } from '../types/types';
import apiService from '../utils/api';
import ClearJWT from './ClearJWT';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  pendingUsers: number;
  totalAdmins: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    pendingUsers: 0,
    totalAdmins: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearJWT, setShowClearJWT] = useState(false);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques admin
      const statsResponse = await apiService.get('/admin/stats');
      if (statsResponse.success && statsResponse.data) {
        setStats(prevStats => ({
          ...prevStats,
          ...statsResponse.data
        }));
      }

      // Charger les utilisateurs récents
      const usersResponse = await apiService.get('/admin/users/recent');
      if (usersResponse.success && usersResponse.data) {
        setRecentUsers(usersResponse.data);
      }
    } catch (error) {
      // Erreur chargement données admin ignorée
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    bgColor: string;
  }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600 mt-2">Gérez les utilisateurs et supervisez le système</p>
      </div>

      {/* Statistiques Utilisateurs */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Vue d'ensemble des Utilisateurs</h2>
        <p className="text-sm text-gray-600">Statistiques générales sur l'utilisation de l'application</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Utilisateurs Actifs"
            value={stats.activeUsers}
            icon={UserCheck}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Utilisateurs Bloqués"
            value={stats.blockedUsers}
            icon={UserX}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            title="Administrateurs"
            value={stats.totalAdmins}
            icon={Shield}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>
      </div>


      {/* Activités Utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activités Utilisateurs</h2>
          <p className="text-sm text-gray-600 mt-1">Dernières connexions et activités des utilisateurs</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      user.status === 'active' ? 'bg-green-400' : 
                      user.status === 'blocked' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'blocked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 
                       user.status === 'blocked' ? 'Bloqué' : 'En attente'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Dernière connexion: {user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Inscrit: {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Inconnu'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      ID: {user.id}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité récente</h3>
              <p className="text-sm text-gray-500">
                Les activités des utilisateurs apparaîtront ici lorsqu'ils se connecteront.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gestion Utilisateurs</h3>
                <p className="text-sm text-gray-600">Gérez tous les utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monitoring</h3>
                <p className="text-sm text-gray-600">Surveillez le système</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sauvegarde</h3>
                <p className="text-sm text-gray-600">Gérez les sauvegardes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                <p className="text-sm text-gray-600">Actions de sécurité</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions de sécurité */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Actions de Sécurité</h2>
          <p className="text-sm text-gray-600">Gérez la sécurité et les sessions utilisateurs</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowClearJWT(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Supprimer tous les JWT</span>
          </button>
          
          <div className="text-sm text-gray-500 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Déconnecte tous les utilisateurs
          </div>
        </div>
      </div>

      {/* Modal de suppression JWT */}
      {showClearJWT && (
        <ClearJWT onClose={() => setShowClearJWT(false)} />
      )}
    </div>
  );
}

export default AdminDashboard;
