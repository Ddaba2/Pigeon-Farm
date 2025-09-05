import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { edgeLocalStorage, isEdgeLocalStorageAvailable, getEdgeStorageStatus } from '../utils/storageManager';

const DarkModeTest: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Charger le statut du stockage
    setStorageStatus(getEdgeStorageStatus());
    
    // Charger le mode sombre actuel
    try {
      if (isEdgeLocalStorageAvailable()) {
        const saved = edgeLocalStorage.getItem('darkMode');
        const darkMode = saved ? JSON.parse(saved) : false;
        setIsDarkMode(darkMode);
        addTestResult(`✅ Mode sombre chargé: ${darkMode ? 'Activé' : 'Désactivé'}`);
      } else {
        addTestResult('⚠️ Stockage non disponible, mode par défaut');
      }
    } catch (error) {
      addTestResult(`❌ Erreur lors du chargement: ${error}`);
    }
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Appliquer au document
    const htmlElement = document.documentElement;
    if (newMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Sauvegarder
    try {
      if (isEdgeLocalStorageAvailable()) {
        edgeLocalStorage.setItem('darkMode', JSON.stringify(newMode));
        addTestResult(`✅ Mode sombre sauvegardé: ${newMode ? 'Activé' : 'Désactivé'}`);
      } else {
        addTestResult('⚠️ Sauvegarde impossible, stockage non disponible');
      }
    } catch (error) {
      addTestResult(`❌ Erreur lors de la sauvegarde: ${error}`);
    }
  };

  const testStorageAccess = () => {
    addTestResult('🧪 Test d\'accès au stockage...');
    
    try {
      if (isEdgeLocalStorageAvailable()) {
        const testKey = 'darkModeTest';
        const testValue = 'testValue';
        
        edgeLocalStorage.setItem(testKey, testValue);
        const retrieved = edgeLocalStorage.getItem(testKey);
        edgeLocalStorage.removeItem(testKey);
        
        if (retrieved === testValue) {
          addTestResult('✅ Test de stockage réussi');
        } else {
          addTestResult('❌ Test de stockage échoué');
        }
      } else {
        addTestResult('⚠️ Stockage non disponible');
      }
    } catch (error) {
      addTestResult(`❌ Erreur lors du test: ${error}`);
    }
  };

  const clearStorage = () => {
    try {
      if (isEdgeLocalStorageAvailable()) {
        edgeLocalStorage.removeItem('darkMode');
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
        addTestResult('🧹 Stockage nettoyé');
      }
    } catch (error) {
      addTestResult(`❌ Erreur lors du nettoyage: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Mode Sombre Edge</h1>
            <p className="text-gray-600 dark:text-gray-300">Test de compatibilité du mode sombre avec Microsoft Edge</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
            </button>
          </div>
        </div>

        {/* Statut du stockage */}
        {storageStatus && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Statut du Stockage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">localStorage:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  storageStatus.localStorage.available 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {storageStatus.localStorage.available ? 'Disponible' : 'Non disponible'} 
                  ({storageStatus.localStorage.type})
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">sessionStorage:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  storageStatus.sessionStorage.available 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {storageStatus.sessionStorage.available ? 'Disponible' : 'Non disponible'} 
                  ({storageStatus.sessionStorage.type})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tests */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tests</h3>
          <div className="flex space-x-4">
            <button
              onClick={testStorageAccess}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tester le Stockage
            </button>
            <button
              onClick={clearStorage}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Nettoyer
            </button>
          </div>
        </div>

        {/* Résultats des tests */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Résultats des Tests</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun test effectué</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Indicateur visuel du mode */}
        <div className="p-4 bg-gray-100 dark:bg-gray-600 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Indicateur Visuel</h3>
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}>
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <span className="text-gray-900 dark:text-white">
              Mode actuel: <strong>{isDarkMode ? 'Sombre' : 'Clair'}</strong>
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Cliquez sur le bouton pour basculer entre les modes</li>
            <li>• Vérifiez que les couleurs changent correctement</li>
            <li>• Testez le stockage pour vérifier la persistance</li>
            <li>• Rechargez la page pour vérifier que le mode est sauvegardé</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DarkModeTest;
