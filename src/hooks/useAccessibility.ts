import { useState, useEffect } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    // Initialisation sécurisée sans localStorage dans useEffect
    try {
      const savedPreferences = localStorage.getItem('accessibility-preferences');
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    } catch (error) {
      // Silencieux
    }
    
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: false,
    };
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    // Check for system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPreferences(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches
    }));

    // Listen for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    // Apply preferences to document
    const root = document.documentElement;
    
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (preferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save to localStorage de manière sécurisée
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    } catch (error) {
      // Silencieux - pas de message de console
    }
  }, [preferences]);

  const updatePreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleHighContrast = () => updatePreference('highContrast', !preferences.highContrast);
  const toggleLargeText = () => updatePreference('largeText', !preferences.largeText);
  const toggleReducedMotion = () => updatePreference('reducedMotion', !preferences.reducedMotion);

  return {
    preferences,
    isKeyboardUser,
    updatePreference,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
  };
}; 