import { useState, useEffect } from 'react';
import { edgeLocalStorage, isEdgeLocalStorageAvailable } from '../utils/storageManager';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialisation sécurisée avec gestionnaire Edge
    try {
      if (isEdgeLocalStorageAvailable()) {
        const saved = edgeLocalStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
      }
      return false;
    } catch (error) {
      // console.warn('Erreur lors de la lecture du mode sombre:', error);
      return false;
    }
  });

  // Appliquer le mode sombre au document
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Sauvegarde sécurisée avec gestionnaire Edge
    try {
      if (isEdgeLocalStorageAvailable()) {
        edgeLocalStorage.setItem('darkMode', JSON.stringify(newMode));
        // console.log(`🌙 Mode sombre ${newMode ? 'activé' : 'désactivé'}`);
      }
    } catch (error) {
      // console.warn('Erreur lors de la sauvegarde du mode sombre:', error);
    }
  };

  return { isDarkMode, toggleDarkMode };
};