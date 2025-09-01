import { useState, useEffect } from 'react';
import apiService from '../utils/api';
import { safeLocalStorage } from '../utils/edgeCompatibility';

export const useCSRF = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser la nouvelle API
        const response = await apiService.getCSRFToken();
        
        if (response && response.token) {
          setCsrfToken(response.token);
          safeLocalStorage.setItem('csrfToken', response.token);
        } else {
          console.warn('Token CSRF invalide reçu:', response);
          setError('Token CSRF invalide');
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération du token CSRF:', err);
        setError(err.message || 'Erreur lors de la récupération du token CSRF');
      } finally {
        setLoading(false);
      }
    };

    // Vérifier si on a déjà un token en cache
    const cachedToken = safeLocalStorage.getItem('csrfToken');
    if (cachedToken) {
      setCsrfToken(cachedToken);
      setLoading(false);
    } else {
      fetchCSRFToken();
    }
  }, []);

  const refreshToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCSRFToken();
      
      if (response && response.token) {
        setCsrfToken(response.token);
        safeLocalStorage.setItem('csrfToken', response.token);
      } else {
        throw new Error('Token CSRF invalide reçu');
      }
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement du token CSRF:', err);
      setError(err.message || 'Erreur lors du rafraîchissement du token CSRF');
    } finally {
      setLoading(false);
    }
  };

  return {
    csrfToken,
    loading,
    error,
    refreshToken
  };
}; 