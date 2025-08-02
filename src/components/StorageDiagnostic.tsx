import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { safeLocalStorage, checkEdgeCompatibility } from '../utils/edgeCompatibility';

interface StorageDiagnosticProps {
  showDetails?: boolean;
  className?: string;
}

const StorageDiagnostic: React.FC<StorageDiagnosticProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [storageInfo, setStorageInfo] = useState({
    type: 'unknown',
    available: false,
    memorySize: 0,
    compatibility: { compatible: true, issues: [] as string[] }
  });

  useEffect(() => {
    const updateStorageInfo = () => {
      const compatibility = checkEdgeCompatibility();
      setStorageInfo({
        type: safeLocalStorage.getStorageType(),
        available: safeLocalStorage.isAvailable(),
        memorySize: safeLocalStorage.getMemoryStorageSize(),
        compatibility
      });
    };

    updateStorageInfo();
    
    // Mettre à jour toutes les 5 secondes
    const interval = setInterval(updateStorageInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (storageInfo.available) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (storageInfo.type === 'memory') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (storageInfo.available) {
      return 'localStorage fonctionnel';
    } else if (storageInfo.type === 'memory') {
      return 'Stockage en mémoire';
    } else {
      return 'Stockage non disponible';
    }
  };

  const getStatusColor = () => {
    if (storageInfo.available) {
      return 'text-green-600 dark:text-green-400';
    } else if (storageInfo.type === 'memory') {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {getStatusIcon()}
        <span className={getStatusColor()}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Database className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Diagnostic du Stockage
        </h3>
      </div>

      <div className="space-y-3">
        {/* État du stockage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Type de stockage:
          </span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Taille du stockage en mémoire */}
        {storageInfo.type === 'memory' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Éléments en mémoire:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {storageInfo.memorySize}
            </span>
          </div>
        )}

        {/* Compatibilité */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Compatibilité:
          </span>
          <div className="flex items-center space-x-2">
            {storageInfo.compatibility.compatible ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              storageInfo.compatibility.compatible 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {storageInfo.compatibility.compatible ? 'Compatible' : 'Incompatible'}
            </span>
          </div>
        </div>

        {/* Problèmes détectés */}
        {storageInfo.compatibility.issues.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Problèmes détectés:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {storageInfo.compatibility.issues.map((issue, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const testKey = 'test_' + Date.now();
                safeLocalStorage.setItem(testKey, 'test_value');
                const result = safeLocalStorage.getItem(testKey);
                safeLocalStorage.removeItem(testKey);
                alert(`Test de stockage: ${result === 'test_value' ? 'Réussi' : 'Échoué'}`);
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Tester le stockage
            </button>
            <button
              onClick={() => {
                safeLocalStorage.clear();
                alert('Stockage vidé');
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Vider le stockage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDiagnostic; 