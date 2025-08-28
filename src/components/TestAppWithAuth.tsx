import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import CouplesManagement from './CouplesManagement';
import EggTracking from './EggTracking';
import PigeonnalManagement from './PigeonnalManagement';
import HealthTracking from './HealthTracking';
import Statistics from './Statistics';
import TestLogin from './TestLogin';
import UsersManagement from './UsersManagement';
import Documentation from './Documentation';
import BackupRestore from './BackupRestore';
import AccessibilityPanel from './AccessibilityPanel';
import { AppData, User } from '../types/types';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAccessibility } from '../hooks/useAccessibility';
import { useKeyboardNavigation, createAppShortcuts } from '../hooks/useKeyboardNavigation';
// Notifications supprimées
import { safeLocalStorage } from '../utils/edgeCompatibility';



const initialData: AppData = {
  couples: [],
  eggs: [],
  pigeonneaux: [],
  healthRecords: [],
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'dabadiallo694@gmail.com' },
    { id: 2, username: 'user', password: 'user123', role: 'user', email: 'dabadiallo694@gmail.com' }
  ]
};

function TestAppWithAuth() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<AppData>(initialData);
  const [user, setUser] = useState<User | null>(null);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { preferences } = useAccessibility();
  
  useEffect(() => {
    const userData = safeLocalStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        safeLocalStorage.removeItem('user');
      }
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
    safeLocalStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleAccessibilityToggle = () => {
    setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen);
  };
  


  const shortcuts = createAppShortcuts(setActiveTab, handleLogout, handleAccessibilityToggle);
  useKeyboardNavigation(shortcuts);

  useEffect(() => {
    const savedData = safeLocalStorage.getItem('pigeonBreedingData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.warn('Erreur lors du parsing des données sauvegardées:', error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const dataString = JSON.stringify(data);
      safeLocalStorage.setItem('pigeonBreedingData', dataString);
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des données:', error);
    }
  }, [data]);

  if (!user) {
    return <TestLogin onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
      case 'backup':
        return user?.role === 'admin' ? <BackupRestore /> : null;
      case 'logs':
        return null;
      case 'help':
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${preferences.largeText ? 'large-text' : ''}`}>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        
        {successMessage && (
          <div className="max-w-2xl mx-auto mt-4 mb-2 p-3 bg-green-100 text-green-800 rounded shadow text-center font-semibold" role="alert" aria-live="polite">
            {successMessage}
            <button 
              onClick={() => setSuccessMessage(null)} 
              className="ml-2 text-green-900 font-bold btn-accessible"
              aria-label="Fermer le message de succès"
            >
              ×
            </button>
          </div>
        )}
        
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Bird className="h-8 w-8 mr-3 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PigeonFarm</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.username}
                </span>
                <button
                  onClick={toggleDarkMode}
                  className="btn-accessible p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-all duration-200 focus-visible-ring"
                  aria-label={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-accessible flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors font-semibold focus-visible-ring"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userRole={user.role} 
            onAccessibilityToggle={handleAccessibilityToggle}
          />
          <main id="main-content" className="mt-8" role="main" aria-label="Contenu principal">
            {renderContent()}
          </main>
        </div>
        
        <AccessibilityPanel 
          isOpen={isAccessibilityPanelOpen} 
          onClose={() => setIsAccessibilityPanelOpen(false)} 
        />
      </div>
  );
}

export default TestAppWithAuth; 