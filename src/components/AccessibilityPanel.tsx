import React, { useState } from 'react';
import { Eye, Type, Zap, Keyboard, X, Settings } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const {
    preferences,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState('visual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Paramètres d'accessibilité
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible-ring"
            aria-label="Fermer les paramètres d'accessibilité"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'visual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Visuel
          </button>
          <button
            onClick={() => setActiveTab('navigation')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'navigation'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Keyboard className="h-4 w-4 inline mr-2" />
            Navigation
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'visual' && (
            <div className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Contraste élevé
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Améliore la lisibilité pour les malvoyants
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible-ring ${
                    preferences.highContrast
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  role="switch"
                  aria-checked={preferences.highContrast}
                  aria-label="Activer le contraste élevé"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Type className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Texte agrandi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Augmente la taille du texte
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleLargeText}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible-ring ${
                    preferences.largeText
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  role="switch"
                  aria-checked={preferences.largeText}
                  aria-label="Activer le texte agrandi"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.largeText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Zap className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Mouvements réduits
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Réduit les animations pour les personnes sensibles
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleReducedMotion}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible-ring ${
                    preferences.reducedMotion
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  role="switch"
                  aria-checked={preferences.reducedMotion}
                  aria-label="Activer les mouvements réduits"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Navigation au clavier
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">Tab</kbd> - Naviguer entre les éléments</li>
                  <li>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">Entrée</kbd> - Activer les boutons</li>
                  <li>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">Échap</kbd> - Fermer les modales</li>
                  <li>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">Flèches</kbd> - Naviguer dans les listes</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Support lecteur d'écran
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  L'application est compatible avec les lecteurs d'écran comme NVDA, JAWS et VoiceOver.
                  Tous les éléments interactifs ont des étiquettes appropriées.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full btn-accessible bg-blue-600 text-white hover:bg-blue-700 focus-visible-ring"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel; 