import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthError: React.FC = () => {
  const [error, setError] = useState<string>('Erreur de connexion Google');
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le message d'erreur depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam) {
      switch (errorParam) {
        case 'oauth_failed':
          setError('Échec de l\'authentification Google');
          break;
        case 'no_user':
          setError('Aucun utilisateur trouvé');
          break;
        case 'callback_error':
          setError('Erreur lors du traitement de la connexion');
          break;
        default:
          setError('Erreur de connexion Google');
      }
    }

    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

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
          <div className="mt-6 space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthError;
