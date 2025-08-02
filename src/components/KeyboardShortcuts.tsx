import React from 'react';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  className?: string;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ shortcuts, className = '' }) => {
  const formatKey = (shortcut: KeyboardShortcut) => {
    const parts = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    
    // Format the main key
    let key = shortcut.key;
    if (key === 'Escape') key = 'Échap';
    if (key === 'Enter') key = 'Entrée';
    if (key === 'Tab') key = 'Tab';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    
    parts.push(key);
    
    return parts.join(' + ');
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Keyboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Raccourcis clavier
        </h3>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((shortcut, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {shortcut.description}
            </span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">
              {formatKey(shortcut)}
            </kbd>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Astuce :</strong> Utilisez la touche Tab pour naviguer entre les éléments et Entrée pour les activer.
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts; 