import { useState, useEffect } from 'react';
import { LogOut, Moon, Sun, Bird, Bell } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CouplesManagement from './components/CouplesManagement';
import EggTracking from './components/EggTracking';
import PigeonnalManagement from './components/PigeonnalManagement';
import HealthTracking from './components/HealthTracking';
import Statistics from './components/Statistics';
import Login from './components/Login';
import UsersManagement from './components/UsersManagement';
import Documentation from './components/Documentation';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Notifications from './components/Notifications';
import ErrorBoundary from './components/ErrorBoundary';
import AccessibilityPanel from './components/AccessibilityPanel';
import { User } from './types/types';
import { useDarkMode } from './hooks/useDarkMode';
import { edgeLocalStorage } from './utils/storageManager';
import { getNotificationCount } from './utils/api';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_BACKEND_URL;

    // Récupération des utilisateurs depuis le backend Railway
    fetch(`${apiUrl}/api/users`)
      .then(res => res.json())
      .then(data => {
        console.log("Données utilisateurs depuis le backend :", data);
      })
      .catch(err => console.error("Erreur fetch API :", err));

    const loadUserFromStorage = () => {
      let userData = null;
      
      try {
        userData = edgeLocalStorage.getItem('user');
      } catch (error) {
        console.warn('⚠️ Erreur edgeLocalStorage, fallback vers localStorage:', error);
        try {
          userData = localStorage.getItem('user');
        } catch (error2) {
          console.warn('⚠️ Erreur localStorage:', error2);
        }
      }
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          if (user.role === 'admin') {
            setShowAdminPanel(true);
          }
        } catch (error) {
          console.error('❌ Erreur lors du parsing des données utilisateur:', error);
          try { edgeLocalStorage.removeItem('user'); } catch (e) { console.warn('Error removing user from edgeLocalStorage:', e); }
          try { localStorage.removeItem('user'); } catch (e) { console.warn('Error removing user from localStorage:', e); }
        }
      }
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const loadNotificationCount = async () => {
      if (!user) return;
      
      try {
        const response = await getNotificationCount() as { success: boolean; data: { count: number } };
        if (response.success) {
          setNotificationCount(response.data.count);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de notifications:', error);
      }
    };

    if (user) {
      loadNotificationCount();
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAuthSuccess = (userData: User, message?: string) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setShowAdminPanel(true);
    }
    if (message) {
      console.log('Success message:', message);
    }
  };

  const handleLogout = () => {
    try { edgeLocalStorage.removeItem('user'); } catch (e) { console.warn('Error removing user from edgeLocalStorage:', e); }
    try { localStorage.removeItem('user'); } catch (e) { console.warn('Error removing user from localStorage:', e); }
    try { localStorage.removeItem('sessionId'); } catch (e) { console.warn('Error removing sessionId from localStorage:', e); }
    
    setUser(null);
    setActiveTab('dashboard');
    setShowAdminPanel(false);
  };

  if (!user) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'couples': return <CouplesManagement />;
      case 'eggs': return <EggTracking />;
      case 'pigeonneaux': return <PigeonnalManagement />;
      case 'health': return <HealthTracking />;
      case 'statistics': return <Statistics />;
      case 'users': return <UsersManagement />;
      case 'profile': return <Profile user={user} onUpdate={setUser} />;
      case 'help': return <Documentation />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider handleAuthSuccess={handleAuthSuccess}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Bird className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    PigeonFarm
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Basculer le mode sombre"
                  >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Se déconnecter"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={user.role}
            onAccessibilityToggle={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
          />

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderContent()}
          </main>

          {/* Modals */}
          {showNotifications && (
            <Notifications
              onClose={() => setShowNotifications(false)}
            />
          )}

          {showAccessibilityPanel && (
            <AccessibilityPanel
              isOpen={showAccessibilityPanel}
              onClose={() => setShowAccessibilityPanel(false)}
            />
          )}

          {showAdminPanel && user.role === 'admin' && (
            <AdminPanel
              onClose={() => setShowAdminPanel(false)}
            />
          )}
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
