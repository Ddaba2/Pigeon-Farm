import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { User } from '../types/types';
import { edgeLocalStorage } from '../utils/storageManager';

interface GlobalAuthContextType {
  handleAuthSuccess: (user: User, message?: string) => void;
  setHandleAuthSuccess: (handler: (user: User, message?: string) => void) => void;
}

const GlobalAuthContext = createContext<GlobalAuthContextType | undefined>(undefined);

export const useGlobalAuth = () => {
  const context = useContext(GlobalAuthContext);
  if (context === undefined) {
    throw new Error('useGlobalAuth must be used within a GlobalAuthProvider');
  }
  return context;
};

interface GlobalAuthProviderProps {
  children: ReactNode;
}

export const GlobalAuthProvider: React.FC<GlobalAuthProviderProps> = ({ children }) => {
  const handleAuthSuccessRef = useRef<(user: User, message?: string) => void>(
    (user: User, message?: string) => {
      // Fonction par défaut sécurisée - ne fait rien si les données sont invalides
      if (!user || typeof user !== 'object') {
        console.warn('⚠️ handleAuthSuccess par défaut appelé avec des données invalides:', user);
        return;
      }
      // console.log('Default auth success handler:', user, message);
      
      // Stocker l'utilisateur dans le localStorage pour qu'App.tsx le récupère
      try {
        edgeLocalStorage.setItem('user', JSON.stringify(user));
        // console.log('💾 Utilisateur stocké dans edgeLocalStorage');
      } catch (error) {
        console.warn('⚠️ Erreur stockage edgeLocalStorage:', error);
        // Fallback vers localStorage standard
        try {
          localStorage.setItem('user', JSON.stringify(user));
          // console.log('💾 Utilisateur stocké dans localStorage standard');
        } catch (error2) {
          console.error('❌ Impossible de stocker l\'utilisateur:', error2);
        }
      }
      
      // Note: La redirection sera gérée par le composant OAuthCallback
      // window.location.href = '/';
    }
  );

  const handleAuthSuccess = (user: User, message?: string) => {
    handleAuthSuccessRef.current(user, message);
  };

  const setHandleAuthSuccess = (handler: (user: User, message?: string) => void) => {
    handleAuthSuccessRef.current = handler;
  };

  return (
    <GlobalAuthContext.Provider value={{ handleAuthSuccess, setHandleAuthSuccess }}>
      {children}
    </GlobalAuthContext.Provider>
  );
};
