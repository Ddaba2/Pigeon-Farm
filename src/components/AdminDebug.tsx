import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { clearAllUserData, checkUserData, forceAdminLogin } from '../utils/clearUserData';

interface AdminDebugProps {
  onClose?: () => void;
}

function AdminDebug({ onClose }: AdminDebugProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleClearData = async () => {
    setIsClearing(true);
    
    try {
      clearAllUserData();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckData = () => {
    try {
      checkUserData();
      
      // Récupérer les informations de debug
      const debug = {
        localStorage: {
          user: localStorage.getItem('user'),
          sessionId: localStorage.getItem('sessionId'),
          keys: Object.keys(localStorage)
        },
        sessionStorage: {
          user: sessionStorage.getItem('user'),
          keys: Object.keys(sessionStorage)
        },
        cookies: document.cookie,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      setDebugInfo(debug);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    }
  };

  const handleForceAdminLogin = () => {
    forceAdminLogin();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <h3 className="text-xl font-medium text-gray-900">
                Diagnostic Admin - Résolution des Problèmes
              </h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Problème identifié */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-red-800 mb-2">
                🚨 Problème Identifié
              </h4>
              <p className="text-red-700">
                Vous êtes connecté avec le compte admin mais vous voyez :
              </p>
              <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                <li>La même interface que les utilisateurs normaux</li>
                <li>Les données d'un autre compte utilisateur</li>
                <li>Pas de bouton "Admin" dans le header</li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">
                🔧 Solutions à Essayer
              </h4>
              
              <div className="space-y-4">
                {/* Solution 1 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium text-gray-900">1. Vérifier les données actuelles</h5>
                    <p className="text-sm text-gray-600">Voir ce qui est stocké dans le navigateur</p>
                  </div>
                  <button
                    onClick={handleCheckData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Vérifier</span>
                  </button>
                </div>

                {/* Solution 2 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium text-gray-900">2. Nettoyer complètement le navigateur</h5>
                    <p className="text-sm text-gray-600">Supprimer localStorage, sessionStorage et cookies</p>
                  </div>
                  <button
                    onClick={handleClearData}
                    disabled={isClearing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isClearing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Nettoyage...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Nettoyer</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Solution 3 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium text-gray-900">3. Forcer la reconnexion admin</h5>
                    <p className="text-sm text-gray-600">Nettoyer et rediriger vers la connexion</p>
                  </div>
                  <button
                    onClick={handleForceAdminLogin}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reconnecter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions manuelles */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Instructions Manuelles
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>1.</strong> Ouvrez les outils de développement (F12)</p>
                <p><strong>2.</strong> Allez dans l'onglet "Application" ou "Storage"</p>
                <p><strong>3.</strong> Supprimez TOUT le localStorage et sessionStorage</p>
                <p><strong>4.</strong> Supprimez TOUS les cookies</p>
                <p><strong>5.</strong> Rechargez la page (Ctrl+F5)</p>
                <p><strong>6.</strong> Connectez-vous avec : <code>admin</code> / <code>admin123</code></p>
              </div>
            </div>

            {/* Informations de debug */}
            {debugInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  🔍 Informations de Debug
                </h4>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-center space-x-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Fermer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recharger la Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDebug;
