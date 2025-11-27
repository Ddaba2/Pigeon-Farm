import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardNavigation = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const pressedKey = event.key.toLowerCase();
    
    for (const shortcut of shortcuts) {
      const keyMatch = shortcut.key.toLowerCase() === pressedKey;
      const ctrlMatch = shortcut.ctrlKey === event.ctrlKey;
      const shiftMatch = shortcut.shiftKey === event.shiftKey;
      const altMatch = shortcut.altKey === event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Helper function to announce changes to screen readers
    announceToScreenReader: (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      // Remove after a short delay (safely)
      setTimeout(() => {
        if (announcement.parentNode) {
          announcement.parentNode.removeChild(announcement);
        } else if (typeof (announcement as any).remove === 'function') {
          (announcement as any).remove();
        }
      }, 1000);
    }
  };
};

// Common keyboard shortcuts for the application
export const createAppShortcuts = (
  setActiveTab: (tab: string) => void,
  onLogout: () => void,
  onAccessibilityToggle: () => void
): KeyboardShortcut[] => [
  {
    key: '1',
    action: () => setActiveTab('dashboard'),
    description: 'Aller au tableau de bord'
  },
  {
    key: '2',
    action: () => setActiveTab('couples'),
    description: 'Gérer les couples'
  },
  {
    key: '3',
    action: () => setActiveTab('eggs'),
    description: 'Suivi des œufs'
  },
  {
    key: '4',
    action: () => setActiveTab('pigeonneaux'),
    description: 'Gestion des pigeonneaux'
  },
  {
    key: '5',
    action: () => setActiveTab('health'),
    description: 'Suivi de santé'
  },
  {
    key: '6',
    action: () => setActiveTab('statistics'),
    description: 'Statistiques'
  },
  {
    key: 'h',
    action: () => setActiveTab('help'),
    description: 'Aide et documentation'
  },
  {
    key: 'Escape',
    action: () => {
      // Close any open modals or panels
      const modals = document.querySelectorAll('[role="dialog"]');
      if (modals.length > 0) {
        const lastModal = modals[modals.length - 1] as HTMLElement;
        const closeButton = lastModal.querySelector('[aria-label*="fermer"], [aria-label*="close"]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    },
    description: 'Fermer les fenêtres ouvertes'
  },
  {
    key: 'a',
    ctrlKey: true,
    action: onAccessibilityToggle,
    description: 'Ouvrir les paramètres d\'accessibilité'
  },
  {
    key: 'l',
    ctrlKey: true,
    action: onLogout,
    description: 'Se déconnecter'
  }
]; 