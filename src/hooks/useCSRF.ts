import { useState, useEffect } from 'react';
import apiService from '../utils/api';

const useCSRF = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const getStoredToken = () => {
      try {
        return localStorage.getItem('csrfToken');
      } catch (error) {
        return null;
      }
    };

    const storedToken = getStoredToken();
    if (storedToken) {
      setCsrfToken(storedToken);
    }
  }, []);

  const setToken = (token: string) => {
    setCsrfToken(token);
    try {
      localStorage.setItem('csrfToken', token);
    } catch (error) {
      // Silencieux
    }
  };

  const clearToken = () => {
    setCsrfToken(null);
    try {
      localStorage.removeItem('csrfToken');
    } catch (error) {
      // Silencieux
    }
  };

  return { csrfToken, setToken, clearToken };
};

export default useCSRF; 