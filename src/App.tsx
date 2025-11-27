import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun, Shield, Bird, AlertTriangle, User as UserIcon, Bell } from 'lucide-react';
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
import Base64Image from './components/Base64Image';
import BackupRestore from './components/BackupRestore';
import { User } from './types/types';
import { useDarkMode } from './hooks/useDarkMode';
import { edgeLocalStorage } from './utils/storageManager';
import { getNotificationCount } from './utils/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const checkUserSession = async () => {
      const userData = edgeLocalStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          // Vérifier si la session est encore valide
          try {
            const sessionId = edgeLocalStorage.getItem('sessionId');
            if (!sessionId) {
              // Pas de sessionId, déconnecter
              edgeLocalStorage.removeItem('user');
              setUser(null);
              return;
            }
            
            const response = await fetch('http://localhost:3002/api/auth/verify-session', {
              method: 'GET',
              headers: {
                'x-session-id': sessionId,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            
            if (response.ok) {
              const sessionData = await response.json();
              if (sessionData.success && sessionData.user) {
                setUser(sessionData.user);
                // Si l'utilisateur est admin, ouvrir directement l'interface admin
                if (sessionData.user.role === 'admin') {
                  setShowAdminPanel(true);
                }
              } else {
                // Session invalide, déconnecter
                edgeLocalStorage.removeItem('user');
                edgeLocalStorage.removeItem('sessionId');
                setUser(null);
              }
            } else {
              // Session expirée, déconnecter
              edgeLocalStorage.removeItem('user');
              edgeLocalStorage.removeItem('sessionId');
              setUser(null);
            }
          } catch (error) {
            console.error('Erreur lors de la vérification de session:', error);
            // En cas d'erreur réseau, garder l'utilisateur connecté mais afficher un avertissement
            console.warn('Impossible de vérifier la session, maintien de la connexion locale');
            // Ne pas déconnecter automatiquement en cas d'erreur réseau
          }
        } catch (error) {
          // Erreur de parsing, nettoyer
          edgeLocalStorage.removeItem('user');
          edgeLocalStorage.removeItem('sessionId');
        }
      }
    };
    
    checkUserSession();
  }, []);

  // Charger le nombre de notifications non lues
  const loadNotificationCount = async () => {
    if (!user) return;
    
    try {
      const response = await getNotificationCount();
      if (response.success) {
        setNotificationCount(response.data.count);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications:', error);
      // Si erreur d'authentification, déconnecter l'utilisateur
      if (error.message === 'Authentification requise') {
        edgeLocalStorage.removeItem('user');
        edgeLocalStorage.removeItem('sessionId');
        setUser(null);
        setShowAdminPanel(false);
      }
    }
  };

  // Charger le nombre de notifications quand l'utilisateur se connecte
  useEffect(() => {
    if (user && user.id) {
      // Délai pour s'assurer que la session est bien établie
      const timer = setTimeout(() => {
        loadNotificationCount();
      }, 1000);
      
      // Recharger toutes les 5 minutes (300000ms) pour éviter le rate limiting
      const interval = setInterval(loadNotificationCount, 300000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [user]);

  const handleAuthSuccess = (userData: User, message?: string) => {
    setUser(userData);
    // Si l'utilisateur est admin, ouvrir directement l'interface admin
    if (userData.role === 'admin') {
      setShowAdminPanel(true);
    }
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      // Appeler l'API de déconnexion
      await fetch('http://localhost:3002/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      edgeLocalStorage.removeItem('user');
      edgeLocalStorage.removeItem('sessionId');
      setUser(null);
      setActiveTab('dashboard');
      setShowAdminPanel(false);
      setNotificationCount(0);
    }
  };

  // Les routes OAuth sont maintenant gérées par React Router dans main.tsx

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
      case 'profile':
        return <Profile user={user} onUpdate={setUser} />;
      case 'backup':
        return <BackupRestore />;
      case 'help':
        return <Documentation />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
                    {logoError ? (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    ) : (
                      <img 
                        src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
                        alt="PigeonFarm Logo" 
                        className="h-full w-full object-contain"
                        onError={() => setLogoError(true)}
                      />
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">PigeonFarm</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Admin Panel Button */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </button>
                )}


                {/* Notifications Button */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Toggle Dark Mode */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  {/* User Avatar and Name */}
                  <div className="flex items-center space-x-3">
                    <div 
                      onClick={() => setActiveTab('profile')}
                      className="flex flex-col items-center space-y-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                      title="Mon Profil"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                        {user.avatar_url ? (
                          <Base64Image
                            src={user.avatar_url}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                        <div className={`h-full w-full flex items-center justify-center ${user.avatar_url ? 'hidden' : ''}`}>
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{user.full_name || user.username}</p>
                      </div>
                    </div>
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

        {/* Main Content - Masqué quand l'admin panel est ouvert ou pour les admins */}
        {!showAdminPanel && user.role !== 'admin' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Navigation */}
            <Navigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userRole={user.role} 
              onAccessibilityToggle={() => setShowAccessibilityPanel(true)} 
            />

            {/* Page Content */}
            <div className="animate-in fade-in duration-300">
              {renderContent()}
            </div>
          </main>
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="fixed inset-0 z-50">
            <AdminPanel 
              onClose={() => setShowAdminPanel(false)} 
            />
          </div>
        )}


        {/* Notifications Modal */}
        {showNotifications && (
          <Notifications 
            onClose={() => {
              setShowNotifications(false);
              loadNotificationCount(); // Recharger le compteur après fermeture
            }} 
          />
        )}

        {/* Accessibility Panel */}
        {showAccessibilityPanel && (
          <AccessibilityPanel 
            isOpen={showAccessibilityPanel}
            onClose={() => setShowAccessibilityPanel(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;