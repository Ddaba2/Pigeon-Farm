import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CouplesManagement from './components/CouplesManagement';
import EggTracking from './components/EggTracking';
import PigeonnalManagement from './components/PigeonnalManagement';
import HealthTracking from './components/HealthTracking';
import Statistics from './components/Statistics';
import Login from './components/Login';
import UsersManagement from './components/UsersManagement';
import ActionLogs from './components/ActionLogs';
import Documentation from './components/Documentation';
import { User } from './types/types';
import { useDarkMode } from './hooks/useDarkMode';
import { NotificationProvider } from './components/NotificationContext';
import { safeLocalStorage } from '../utils/edgeCompatibility';



function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isDark, toggleDark } = useDarkMode();

  useEffect(() => {
    const token = safeLocalStorage.getItem('token');
    if (token) {
      // Vérifier si le token est valide
      // Pour l'instant, on simule un utilisateur connecté
      setUser({ id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' });
    }
  }, []);

  const handleAuthSuccess = (userData: User, message?: string) => {
    setUser(userData);
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    safeLocalStorage.removeItem('token');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'couples':
        return <CouplesManagement />;
      case 'eggs':
        return <EggTracking />;
      case 'pigeonneaux':
        return <PigeonnalManagement />;
      case 'health':
        return <HealthTracking />;
      case 'statistics':
        return <Statistics />;
      case 'users':
        return <UsersManagement />;
      case 'logs':
        return <ActionLogs />;
      case 'help':
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <Bird className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">PigeonFarm</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Toggle Dark Mode */}
                <button
                  onClick={toggleDark}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Navigation */}
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} />

          {/* Page Content */}
          <div className="animate-in fade-in duration-300">
            {renderContent()}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

export default App; 