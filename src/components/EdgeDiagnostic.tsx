import React, { useState, useEffect } from 'react';
import { Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { edgeSafeStorage } from '../utils/edgeDiagnostic';

interface EdgeDiagnosticProps {
  showDetails?: boolean;
  className?: string;
}

const EdgeDiagnostic: React.FC<EdgeDiagnosticProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [edgeInfo, setEdgeInfo] = useState(edgeSafeStorage.getDiagnosticInfo());

  useEffect(() => {
    const updateEdgeInfo = () => {
      setEdgeInfo(edgeSafeStorage.getDiagnosticInfo());
    };

    // Mettre à jour toutes les 10 secondes
    const interval = setInterval(updateEdgeInfo, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getEdgeIcon = () => {
    if (edgeInfo.isEdge) {
      if (edgeInfo.isEdgeLegacy) {
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      } else if (edgeInfo.isEdgeChromium) {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      } else {
        return <Globe className="h-4 w-4 text-blue-500" />;
      }
    }
    return <Globe className="h-4 w-4 text-gray-500" />;
  };

  const getEdgeText = () => {
    if (edgeInfo.isEdge) {
      if (edgeInfo.isEdgeLegacy) {
        return 'Edge Legacy';
      } else if (edgeInfo.isEdgeChromium) {
        return 'Edge Chromium';
      } else {
        return 'Edge';
      }
    }
    return 'Autre navigateur';
  };

  const getStorageIcon = () => {
    return edgeInfo.localStorageAvailable ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStorageText = () => {
    return edgeInfo.localStorageAvailable ? 'localStorage OK' : 'Stockage mémoire';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {getEdgeIcon()}
        <span className="text-gray-600 dark:text-gray-300">
          {getEdgeText()}
        </span>
        <span className="text-gray-400">|</span>
        {getStorageIcon()}
        <span className="text-gray-600 dark:text-gray-300">
          {getStorageText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Globe className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Diagnostic Edge
        </h3>
      </div>

      <div className="space-y-3">
        {/* Type de navigateur */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Navigateur:
          </span>
          <div className="flex items-center space-x-2">
            {getEdgeIcon()}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {getEdgeText()}
            </span>
          </div>
        </div>

        {/* Stockage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Stockage:
          </span>
          <div className="flex items-center space-x-2">
            {getStorageIcon()}
            <span className={`text-sm font-medium ${
              edgeInfo.localStorageAvailable ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {getStorageText()}
            </span>
          </div>
        </div>

        {/* Taille mémoire */}
        {!edgeInfo.localStorageAvailable && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Éléments en mémoire:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {edgeInfo.memorySize}
            </span>
          </div>
        )}

        {/* Dernier test */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Dernier test:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(edgeInfo.lastTestTime).toLocaleTimeString()}
          </span>
        </div>

        {/* Version Edge */}
        {edgeInfo.isEdge && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="font-medium mb-1">Informations Edge:</div>
              <div className="space-y-1">
                <div>Legacy: {edgeInfo.isEdgeLegacy ? 'Oui' : 'Non'}</div>
                <div>Chromium: {edgeInfo.isEdgeChromium ? 'Oui' : 'Non'}</div>
                <div>localStorage: {edgeInfo.localStorageAvailable ? 'Disponible' : 'Non disponible'}</div>
              </div>
            </div>
          </div>
        )}

        {/* User Agent (version courte) */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="font-medium mb-1">User Agent:</div>
            <div className="break-all">
              {edgeInfo.userAgent.substring(0, 80)}...
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const info = edgeSafeStorage.getDiagnosticInfo();
                console.log('🌐 Diagnostic Edge complet:', info);
                alert('Informations affichées dans la console');
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Afficher détails
            </button>
            <button
              onClick={() => {
                // Forcer un nouveau test
                edgeSafeStorage.setItem('test_key', 'test_value');
                const result = edgeSafeStorage.getItem('test_key');
                edgeSafeStorage.removeItem('test_key');
                alert(`Test de stockage: ${result === 'test_value' ? 'Réussi' : 'Échoué'}`);
              }}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Tester stockage
            </button>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdgeDiagnostic; 