import React, { useState } from 'react';
import { Users, Activity, BarChart3, LogOut, Bird, Moon, Sun } from 'lucide-react';

const SimpleApp: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser] = useState({ username: 'admin', role: 'admin' });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    alert('Déconnexion simulée');
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bird className="h-8 w-8 mr-3 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">PigeonFarm</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentUser.username}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-all duration-200"
                aria-label={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors font-semibold"
                aria-label="Se déconnecter"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex space-x-4 mb-8">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Dashboard
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Couples
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Œufs
          </button>
        </nav>

        <main className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Application PigeonFarm Simplifiée
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cette version simplifiée fonctionne correctement. Si vous voyez cette page, 
            le problème vient d'un composant spécifique dans l'application complète.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Utilisateurs</h3>
              <p className="text-blue-700 dark:text-blue-300">Gestion des utilisateurs</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <Activity className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">Activité</h3>
              <p className="text-green-700 dark:text-green-300">Suivi des activités</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Statistiques</h3>
              <p className="text-purple-700 dark:text-purple-300">Analyses et rapports</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              🔍 Diagnostic
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Cette version simplifiée fonctionne. Le problème de page blanche vient probablement de :
            </p>
            <ul className="list-disc list-inside mt-2 text-yellow-700 dark:text-yellow-300">
              <li>Un composant spécifique qui cause une erreur</li>
              <li>Un problème d'import ou de dépendance</li>
              <li>Une erreur dans la logique d'authentification</li>
              <li>Un problème avec les hooks personnalisés</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleApp; 