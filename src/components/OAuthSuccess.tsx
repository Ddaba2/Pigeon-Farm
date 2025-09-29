import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/types';
import { edgeLocalStorage, isEdgeLocalStorageAvailable } from '../utils/storageManager';

interface OAuthSuccessProps {
  onAuthSuccess: (user: User, message?: string) => void;
}

const OAuthSuccess: React.FC<OAuthSuccessProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthSuccess = () => {
      try {
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        const sessionId = urlParams.get('sessionId');

        if (!userParam) {
          throw new Error('Données utilisateur manquantes');
        }

        // Décoder les données utilisateur
        const userData: User = JSON.parse(decodeURIComponent(userParam));

        // Stocker les données utilisateur
        if (isEdgeLocalStorageAvailable()) {
          try {
            edgeLocalStorage.setItem('user', JSON.stringify(userData));
            if (sessionId) {
              edgeLocalStorage.setItem('sessionId', sessionId);
            }
          } catch (error) {
            console.warn('Impossible de stocker les données localement:', error);
          }
        }

        // Appeler le callback de succès
        onAuthSuccess(userData, 'Connexion Google réussie !');

        // Rediriger vers l'application principale
        window.location.href = '/';

      } catch (error) {
        console.error('Erreur lors du traitement OAuth:', error);
        setError('Erreur lors de la connexion Google');
        setLoading(false);
      }
    };

    handleOAuthSuccess();
  }, [onAuthSuccess]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 text-green-500">
              <svg className="animate-spin h-12 w-12" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Connexion en cours...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Traitement de votre connexion Google
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Erreur de connexion
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthSuccess;
