import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  Menu,
  X,
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminUserManagement from './AdminUserManagement';
import AdminMonitoring from './AdminMonitoring';
import AdminTrends from './AdminTrends';
import AdminUserProfiles from './AdminUserProfiles';
import AdminCustomDashboard from './AdminCustomDashboard';
import ErrorBoundary from './ErrorBoundary';

type AdminTab = 'dashboard' | 'users' | 'monitoring' | 'settings' | 'trends' | 'profiles' | 'custom-dashboard';

interface AdminPanelProps {
  onClose?: () => void;
}

function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dashboard' as AdminTab, name: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'users' as AdminTab, name: 'Gestion Utilisateurs', icon: Users },
    { id: 'trends' as AdminTab, name: 'Tendances Utilisateurs', icon: BarChart3 },
    { id: 'profiles' as AdminTab, name: 'Profils Détaillés', icon: Users },
    { id: 'custom-dashboard' as AdminTab, name: 'Tableau Personnalisé', icon: LayoutDashboard },
    { id: 'monitoring' as AdminTab, name: 'Monitoring Système', icon: BarChart3 },
    { id: 'settings' as AdminTab, name: 'Paramètres', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUserManagement />;
      case 'trends':
        return <AdminTrends />;
      case 'profiles':
        return <AdminUserProfiles />;
      case 'custom-dashboard':
        return <AdminCustomDashboard />;
      case 'monitoring':
        return <AdminMonitoring />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-3xl font-bold text-gray-900">Paramètres Système</h1>
              <p className="text-gray-600 mt-2">Configuration générale du système</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Système</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version</span>
                    <span className="text-sm font-medium text-gray-900">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base de données</span>
                    <span className="text-sm font-medium text-green-600">Connectée</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mode</span>
                    <span className="text-sm font-medium text-blue-600">Développement</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dernière maintenance</span>
                    <span className="text-sm font-medium text-gray-900">Jamais</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sessions actives</span>
                    <span className="text-sm font-medium text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tentatives de connexion</span>
                    <span className="text-sm font-medium text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dernière connexion admin</span>
                    <span className="text-sm font-medium text-gray-900">Maintenant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            className="h-8 w-auto"
            src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png"
            alt="Logo PigeonFarm"
          />
          <h1 className="text-lg font-semibold text-gray-900">Administration</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <img
                className="h-8 w-auto"
                src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png"
                alt="Logo PigeonFarm"
              />
              <span className="text-white font-bold text-lg">PigeonFarm</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8">
            <div className="space-y-4">
              {/* Informations Admin */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Administrateur</span>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Rôle:</span>
                    <span className="font-medium text-blue-600">Admin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Statut:</span>
                    <span className="font-medium text-green-600">Actif</span>
                  </div>
                </div>
              </div>


              {/* Navigation simplifiée */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Tableau de bord
                </button>
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Gestion Utilisateurs
                </button>
                <button
                  onClick={() => {
                    setActiveTab('monitoring');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'monitoring'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Surveillance Système
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Paramètres
                </button>
              </div>
            </div>
          </div>

          {/* Bouton de fermeture pour mobile */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0 lg:hidden">
            {onClose && (
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="mr-2 h-4 w-4" />
                Fermer l'administration
              </button>
            )}
          </div>
        </div>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header desktop */}
          <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'dashboard' && 'Vue d\'ensemble du système'}
                  {activeTab === 'users' && 'Gérez les comptes utilisateurs'}
                  {activeTab === 'trends' && 'Analyse des tendances utilisateurs'}
                  {activeTab === 'profiles' && 'Profils détaillés des utilisateurs'}
                  {activeTab === 'custom-dashboard' && 'Tableau de bord personnalisable'}
                  {activeTab === 'monitoring' && 'Surveillez les performances'}
                  {activeTab === 'settings' && 'Configuration système'}
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Fermer</span>
                </button>
              )}
            </div>
          </div>

          {/* Contenu avec scroll */}
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
