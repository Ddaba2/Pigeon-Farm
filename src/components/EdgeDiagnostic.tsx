import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { getEdgeStorageStatus } from '../utils/storageManager';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

const EdgeDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Détection du navigateur
    const isEdge = /Edg/.test(navigator.userAgent);
    const isIELegacy = /Trident/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    
    diagnosticResults.push({
      test: 'Détection du navigateur',
      status: isEdge ? 'success' : isIELegacy ? 'warning' : 'info',
      message: isEdge ? 'Microsoft Edge détecté' : isIELegacy ? 'Internet Explorer détecté' : 'Autre navigateur',
      details: `User Agent: ${navigator.userAgent}`
    });

    // Test 2: APIs JavaScript modernes
    const apis = [
      { name: 'Fetch API', test: () => !!window.fetch },
      { name: 'Promise', test: () => !!window.Promise },
      { name: 'Object.assign', test: () => !!Object.assign },
      { name: 'Array.from', test: () => !!Array.from },
      { name: 'Array.includes', test: () => !!Array.prototype.includes },
      { name: 'String.includes', test: () => !!String.prototype.includes },
      { name: 'Symbol', test: () => typeof Symbol !== 'undefined' },
      { name: 'Map', test: () => typeof Map !== 'undefined' },
      { name: 'Set', test: () => typeof Set !== 'undefined' },
      { name: 'WeakMap', test: () => typeof WeakMap !== 'undefined' },
      { name: 'WeakSet', test: () => typeof WeakSet !== 'undefined' }
    ];

    apis.forEach(api => {
      try {
        const supported = api.test();
        diagnosticResults.push({
          test: api.name,
          status: supported ? 'success' : 'error',
          message: supported ? 'Supporté' : 'Non supporté',
          details: supported ? 'API disponible' : 'Polyfill requis'
        });
      } catch (error) {
        diagnosticResults.push({
          test: api.name,
          status: 'error',
          message: 'Erreur lors du test',
          details: String(error)
        });
      }
    });

    // Test 3: APIs de stockage (utilise notre gestionnaire Edge)
    const storageStatus = getEdgeStorageStatus();
    
    const storageTests = [
      { 
        name: 'localStorage', 
        test: () => storageStatus.localStorage.available,
        details: `Type: ${storageStatus.localStorage.type}`
      },
      { 
        name: 'sessionStorage', 
        test: () => storageStatus.sessionStorage.available,
        details: `Type: ${storageStatus.sessionStorage.type}`
      },
      { name: 'IndexedDB', test: () => !!window.indexedDB },
      { name: 'WebSQL', test: () => !!(window as any).openDatabase }
    ];

    storageTests.forEach(storage => {
      try {
        const supported = storage.test();
        diagnosticResults.push({
          test: `Stockage: ${storage.name}`,
          status: supported ? 'success' : 'warning',
          message: supported ? 'Disponible' : 'Non disponible',
          details: supported ? (storage.details || 'Stockage fonctionnel') : 'Fallback requis'
        });
      } catch (error) {
        diagnosticResults.push({
          test: `Stockage: ${storage.name}`,
          status: 'error',
          message: 'Erreur lors du test',
          details: String(error)
        });
      }
    });

    // Test 4: APIs Web modernes
    const webApis = [
      { name: 'IntersectionObserver', test: () => !!window.IntersectionObserver },
      { name: 'ResizeObserver', test: () => !!window.ResizeObserver },
      { name: 'MutationObserver', test: () => !!window.MutationObserver },
      { name: 'Performance API', test: () => !!window.performance },
      { name: 'RequestAnimationFrame', test: () => !!window.requestAnimationFrame },
      { name: 'CancelAnimationFrame', test: () => !!window.cancelAnimationFrame },
      { name: 'WebSocket', test: () => !!window.WebSocket },
      { name: 'Service Worker', test: () => !!navigator.serviceWorker },
      { name: 'Push API', test: () => !!(navigator as any).pushManager },
      { name: 'Geolocation API', test: () => !!navigator.geolocation }
    ];

    webApis.forEach(api => {
      try {
        const supported = api.test();
        diagnosticResults.push({
          test: `Web API: ${api.name}`,
          status: supported ? 'success' : 'warning',
          message: supported ? 'Supporté' : 'Non supporté',
          details: supported ? 'API disponible' : 'Fonctionnalité limitée'
        });
      } catch (error) {
        diagnosticResults.push({
          test: `Web API: ${api.name}`,
          status: 'error',
          message: 'Erreur lors du test',
          details: String(error)
        });
      }
    });

    // Test 5: Cookies et sécurité
    try {
      // Test des cookies SameSite
      document.cookie = 'test=edge-compat; SameSite=Lax';
      const cookieTest = document.cookie.includes('test=edge-compat');
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      diagnosticResults.push({
        test: 'Cookies SameSite',
        status: cookieTest ? 'success' : 'warning',
        message: cookieTest ? 'Supportés' : 'Non supportés',
        details: cookieTest ? 'SameSite=Lax fonctionne' : 'Fallback requis'
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'Cookies SameSite',
        status: 'error',
        message: 'Erreur lors du test',
        details: String(error)
      });
    }

    // Test 6: Headers de sécurité
    const securityHeaders = [
      'X-UA-Compatible',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Content-Security-Policy',
      'Strict-Transport-Security'
    ];

    securityHeaders.forEach(header => {
      diagnosticResults.push({
        test: `Header: ${header}`,
        status: 'info',
        message: 'Vérification serveur',
        details: 'Header configuré côté serveur'
      });
    });

    // Test 7: Connectivité API
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        diagnosticResults.push({
          test: 'Connectivité API',
          status: 'success',
          message: 'API accessible',
          details: `Status: ${response.status}, Message: ${data.data?.message || 'OK'}`
        });
      } else {
        diagnosticResults.push({
          test: 'Connectivité API',
          status: 'error',
          message: 'API non accessible',
          details: `Status: ${response.status}`
        });
      }
    } catch (error) {
      diagnosticResults.push({
        test: 'Connectivité API',
        status: 'error',
        message: 'Erreur de connexion',
        details: String(error)
      });
    }

    // Test 8: Performance
    try {
      const start = performance.now();
      // Simuler une opération
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      const end = performance.now();
      const duration = end - start;
      
      diagnosticResults.push({
        test: 'Performance JavaScript',
        status: duration < 10 ? 'success' : 'warning',
        message: `${duration.toFixed(2)}ms`,
        details: duration < 10 ? 'Performance normale' : 'Performance dégradée'
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'Performance JavaScript',
        status: 'error',
        message: 'Erreur lors du test',
        details: String(error)
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diagnostic Edge</h1>
            <p className="text-gray-600">Vérification de la compatibilité Microsoft Edge</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
          </button>
        </div>

        {userAgent && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">User Agent</h3>
            <p className="text-sm text-gray-600 font-mono break-all">{userAgent}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-800">Tests réussis</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-yellow-800">Avertissements</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-800">Erreurs</div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Résultats détaillés</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{result.test}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        result.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {result.message}
                      </span>
                    </div>
                    {result.details && (
                      <p className="mt-1 text-sm text-gray-600">{result.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Cliquez sur "Lancer le diagnostic" pour commencer</p>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Diagnostic en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EdgeDiagnostic;
