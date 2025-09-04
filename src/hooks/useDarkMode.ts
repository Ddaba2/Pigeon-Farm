import { useState, useEffect } from 'react';
import { safeLocalStorage } from '../utils/edgeCompatibility';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Utiliser une approche plus sûre pour éviter les erreurs Edge
    try {
      // Vérifier d'abord localStorage, puis la préférence système
      const saved = safeLocalStorage.getItem('darkMode');
      if (saved !== null) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Erreur lors du parsing du mode sombre:', error);
        }
      }
      // Préférence système par défaut
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation du mode sombre, utilisation du mode clair par défaut:', error);
      return false; // Mode clair par défaut en cas d'erreur
    }
  });

  useEffect(() => {
    try {
      // Sauvegarder dans localStorage de manière sécurisée
      safeLocalStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      
      // Appliquer la classe dark au document
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du mode sombre:', error);
      // Appliquer quand même le mode visuellement
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return { isDarkMode, toggleDarkMode };
};