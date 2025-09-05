import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Settings, Info } from 'lucide-react';

interface EdgeStorageErrorProps {
  onRetry: () => void;
  onContinue: () => void;
}

const EdgeStorageError: React.FC<EdgeStorageErrorProps> = ({ onRetry, onContinue }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Attendre un peu avant de réessayer
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Tester localStorage
      const testKey = '__retry_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      // Si ça marche, continuer
      onContinue();
    } catch (error) {
      console.warn('Tentative de retry échouée:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Problème de Stockage Edge
          </h1>
          <p className="text-gray-600">
            Microsoft Edge bloque l'accès au localStorage à cause des politiques de sécurité.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Cause du problème :</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Politiques de groupe Edge Enterprise</li>
                <li>• Mode de sécurité renforcé</li>
                <li>• Restrictions de stockage local</li>
                <li>• Configuration IT restrictive</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Solutions disponibles :</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Utilisation du stockage en mémoire (temporaire)</li>
                <li>• Sauvegarde des données via l'API</li>
                <li>• Gestion des sessions par cookies</li>
                <li>• Fonctionnalités limitées mais opérationnelles</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying || retryCount >= 3}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Tentative en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer ({retryCount}/3)
              </>
            )}
          </button>
          
          <button
            onClick={handleContinue}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continuer avec les limitations
          </button>
        </div>

        {retryCount >= 3 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              ⚠️ Impossible de résoudre le problème automatiquement. 
              Veuillez contacter votre administrateur IT ou utiliser un autre navigateur.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Cette application fonctionne avec des limitations en mode Edge Enterprise.
            <br />
            Les données seront sauvegardées via l'API mais pas en local.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EdgeStorageError;
