import { useState, useCallback, useEffect } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { isLocalStorageAvailable } from './utils/cookies';
import { edgeLocalStorage } from './utils/storageManager';

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
import BackupRestore from './components/BackupRestore';
import AccessibilityPanel from './components/AccessibilityPanel';
import { User } from './types/types';
import { useDarkMode } from './hooks/useDarkMode';
import { useAccessibility } from './hooks/useAccessibility';
import { useKeyboardNavigation, createAppShortcuts } from './hooks/useKeyboardNavigation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { preferences } = useAccessibility();
  
  // Mémorisation des fonctions pour éviter les re-renders
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    // Nettoyer le localStorage
    try {
      if (isLocalStorageAvailable()) {
        edgeLocalStorage.removeItem('user');
        edgeLocalStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    }
  }, []);

  const handleAccessibilityToggle = useCallback(() => {
    setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen);
  }, [isAccessibilityPanelOpen]);

  const handleAuthSuccess = useCallback((user: User, msg?: string) => {
    setCurrentUser(user);
    if (msg) setSuccessMessage(msg);
  }, []);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    try {
      // Forcer la déconnexion pour Edge (solution temporaire)
      console.log('🔄 Forçage de la déconnexion pour Edge...');
      setCurrentUser(null);
      
      if (isLocalStorageAvailable()) {
        edgeLocalStorage.removeItem('user');
        edgeLocalStorage.removeItem('sessionId');
        console.log('🧹 localStorage nettoyé');
      }
      
      // Nettoyer aussi les cookies
      document.cookie = 'sessionId=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      console.log('🧹 cookies nettoyés');
      
      console.log('✅ Prêt pour la connexion manuelle');
    } catch (error) {
      console.warn('Erreur lors de la vérification de l\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Keyboard navigation
  const shortcuts = createAppShortcuts(setActiveTab, handleLogout, handleAccessibilityToggle);
  useKeyboardNavigation(shortcuts);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Forcer l'affichage de la page de connexion si pas d'utilisateur
  if (!currentUser) {
    console.log('🔒 Affichage de la page de connexion - currentUser:', currentUser);
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  // Vérification supplémentaire pour Edge
  if (!currentUser.id || !currentUser.username) {
    console.log('🔒 Utilisateur invalide, affichage de la page de connexion');
    setCurrentUser(null);
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
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
        return currentUser?.role === 'admin' ? <BackupRestore /> : null;
      case 'help':
        return <Documentation />;
      default:
        return <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Non Trouvée</h1>
          <p className="text-gray-600">Cette page n'existe pas ou a été supprimée</p>
        </div>;
    }
  };

    return (
       <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${preferences.largeText ? 'large-text' : ''}`}>
        {/* Skip to main content link for screen readers */}
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
                <img
                  src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png"
                  alt="Logo PigeonFarm - Application de gestion d'élevage de pigeons"
                  className="h-8 w-8 mr-3"
                />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PigeonFarm</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="sr-only">Utilisateur connecté : </span>
                  {currentUser.username}
                </span>
                <button
                  onClick={toggleDarkMode}
                  className="btn-accessible p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200 focus-visible-ring"
                  aria-label={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
                  title={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-accessible flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors font-semibold focus-visible-ring"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userRole={currentUser.role} 
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

export default App;