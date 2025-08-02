import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  fix?: string;
}

const AccessibilityTest: React.FC = () => {
  const { preferences } = useAccessibility();
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const runAccessibilityTests = () => {
    const results: TestResult[] = [];

    // Test 1: High contrast mode
    results.push({
      id: 'high-contrast',
      name: 'Mode contraste élevé',
      status: preferences.highContrast ? 'pass' : 'warning',
      description: 'Le mode contraste élevé améliore la lisibilité pour les malvoyants.',
      fix: preferences.highContrast ? undefined : 'Activez le mode contraste élevé dans les paramètres d\'accessibilité.'
    });

    // Test 2: Large text
    results.push({
      id: 'large-text',
      name: 'Texte agrandi',
      status: preferences.largeText ? 'pass' : 'warning',
      description: 'Le texte agrandi améliore la lisibilité.',
      fix: preferences.largeText ? undefined : 'Activez le texte agrandi dans les paramètres d\'accessibilité.'
    });

    // Test 3: Reduced motion
    results.push({
      id: 'reduced-motion',
      name: 'Mouvements réduits',
      status: preferences.reducedMotion ? 'pass' : 'info',
      description: 'Les mouvements réduits sont recommandés pour les personnes sensibles aux animations.',
      fix: preferences.reducedMotion ? undefined : 'Activez les mouvements réduits si vous êtes sensible aux animations.'
    });

    // Test 4: Focus indicators
    const hasFocusIndicators = document.querySelectorAll('*:focus-visible').length > 0 || 
                              document.querySelectorAll('.focus-visible-ring').length > 0;
    results.push({
      id: 'focus-indicators',
      name: 'Indicateurs de focus',
      status: hasFocusIndicators ? 'pass' : 'fail',
      description: 'Les indicateurs de focus sont essentiels pour la navigation au clavier.',
      fix: hasFocusIndicators ? undefined : 'Assurez-vous que tous les éléments interactifs ont des indicateurs de focus visibles.'
    });

    // Test 5: Alt text for images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
    results.push({
      id: 'alt-text',
      name: 'Texte alternatif des images',
      status: imagesWithoutAlt.length === 0 ? 'pass' : 'fail',
      description: `Toutes les images doivent avoir un texte alternatif descriptif.`,
      fix: imagesWithoutAlt.length === 0 ? undefined : `${imagesWithoutAlt.length} image(s) sans texte alternatif détectée(s).`
    });

    // Test 6: ARIA labels
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    const elementsWithoutAria = Array.from(interactiveElements).filter(el => {
      const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
      const hasTextContent = el.textContent && el.textContent.trim().length > 0;
      return !hasAriaLabel && !hasTextContent;
    });
    results.push({
      id: 'aria-labels',
      name: 'Étiquettes ARIA',
      status: elementsWithoutAria.length === 0 ? 'pass' : 'warning',
      description: 'Les éléments interactifs doivent avoir des étiquettes appropriées.',
      fix: elementsWithoutAria.length === 0 ? undefined : `${elementsWithoutAria.length} élément(s) sans étiquette détecté(s).`
    });

    // Test 7: Color contrast
    const hasHighContrast = preferences.highContrast || 
                           document.documentElement.classList.contains('high-contrast');
    results.push({
      id: 'color-contrast',
      name: 'Contraste des couleurs',
      status: hasHighContrast ? 'pass' : 'warning',
      description: 'Un contraste suffisant est nécessaire pour la lisibilité.',
      fix: hasHighContrast ? undefined : 'Vérifiez que le contraste des couleurs est suffisant (ratio 4.5:1 minimum).'
    });

    // Test 8: Keyboard navigation
    const hasKeyboardNavigation = document.body.classList.contains('keyboard-navigation') ||
                                 document.querySelectorAll('[tabindex]').length > 0;
    results.push({
      id: 'keyboard-navigation',
      name: 'Navigation au clavier',
      status: hasKeyboardNavigation ? 'pass' : 'info',
      description: 'La navigation au clavier doit être possible pour tous les éléments.',
      fix: hasKeyboardNavigation ? undefined : 'Testez la navigation avec la touche Tab.'
    });

    setTestResults(results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'fail':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const totalCount = testResults.length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Test d'accessibilité
        </h2>
        
        <div className="mb-6">
          <button
            onClick={runAccessibilityTests}
            className="btn-accessible bg-blue-600 text-white hover:bg-blue-700 focus-visible-ring"
          >
            Lancer les tests d'accessibilité
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Résultats des tests
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-green-600 dark:text-green-400">
                  ✓ {passCount} test(s) réussi(s)
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {totalCount} test(s) au total
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({Math.round((passCount / totalCount) * 100)}%)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {result.description}
                      </p>
                      {result.fix && (
                        <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 font-medium">
                          💡 {result.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityTest; 