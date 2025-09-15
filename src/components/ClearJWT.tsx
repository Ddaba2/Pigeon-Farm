import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { clearAllJWT, clearAllStorage } from '../utils/clearJWT';

interface ClearJWTProps {
  onClose?: () => void;
}

function ClearJWT({ onClose }: ClearJWTProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [clearType, setClearType] = useState<'jwt' | 'all'>('jwt');

  const handleClearJWT = async () => {
    setIsClearing(true);
    
    try {
      if (clearType === 'jwt') {
        clearAllJWT();
      } else {
        clearAllStorage();
      }
      
      setIsCleared(true);
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la suppression des JWT:', error);
    } finally {
      setIsClearing(false);
    }
  };

  if (isCleared) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              JWT Supprimés avec Succès !
            </h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                Tous les tokens JWT ont été supprimés. Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            Supprimer Tous les JWT
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-4">
              Cette action supprimera tous les tokens JWT et vous déconnectera de tous les appareils.
            </p>
            
            {/* Choix du type de suppression */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="jwt-only"
                  type="radio"
                  value="jwt"
                  checked={clearType === 'jwt'}
                  onChange={(e) => setClearType(e.target.value as 'jwt')}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="jwt-only" className="ml-2 text-sm text-gray-700">
                  Supprimer uniquement les JWT (recommandé)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="all-storage"
                  type="radio"
                  value="all"
                  checked={clearType === 'all'}
                  onChange={(e) => setClearType(e.target.value as 'all')}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="all-storage" className="ml-2 text-sm text-gray-700">
                  Supprimer tout le stockage (localStorage, sessionStorage, cookies)
                </label>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Attention :</strong> Cette action est irréversible. Vous devrez vous reconnecter.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={onClose}
              disabled={isClearing}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleClearJWT}
              disabled={isClearing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {isClearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClearJWT;
