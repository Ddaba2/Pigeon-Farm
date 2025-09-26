import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../utils/api';
import { useGlobalAuth } from '../contexts/GlobalAuthContext';
import { setSessionId } from '../utils/cookies';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useGlobalAuth();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Éviter le double traitement en mode strict
      if (processedRef.current) {
        return;
      }
      processedRef.current = true;
      try {
        // Récupérer les paramètres de l'URL
        const sessionId = searchParams.get('sessionId');
        const success = searchParams.get('success');
        
        if (success === 'true' && sessionId) {
          // Stocker le sessionId dans les cookies
          setSessionId(sessionId);
          
          // Attendre un peu pour que le cookie soit bien défini
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Vérifier le statut de la session
          const response = await apiService.checkAuthStatus();
          
          if (response.success && response.user) {
            // Stocker l'utilisateur dans localStorage pour persistance
            try {
              localStorage.setItem('user', JSON.stringify(response.user));
            } catch (error) {
              console.warn('⚠️ Erreur stockage localStorage:', error);
            }
            
            // Utiliser le handler d'authentification global
            handleAuthSuccess(response.user, 'Connexion Google réussie !');
            
            // Rediriger vers la page principale
            navigate('/');
          } else {
            navigate('/auth/error?message=' + encodeURIComponent('Aucun utilisateur trouvé après connexion Google'));
          }
        } else {
          navigate('/auth/error?message=' + encodeURIComponent('Paramètres de connexion invalides'));
        }
      } catch (error) {
        navigate('/auth/error?message=' + encodeURIComponent('Erreur lors de la connexion Google: ' + error.message));
      }
    };

    handleOAuthCallback();
  }, [handleAuthSuccess, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Traitement de la connexion...</h2>
        <p className="text-gray-600 mt-2">Veuillez patienter pendant que nous vérifions votre authentification.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
