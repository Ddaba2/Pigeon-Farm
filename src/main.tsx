import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import TestApp from './components/TestApp.tsx';
import SimpleApp from './components/SimpleApp.tsx';

import './index.css';
import PrivacyPolicy from './components/PrivacyPolicy';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { applyPolyfills } from './utils/edgeCompatibility';
import { runEdgeDiagnostic, initializeEdgeCompatibility } from './utils/edgeDiagnostic';
import { checkEdgeCompatibility, showEdgeWarning } from './utils/edgeCompatibility';

// Appliquer les polyfills pour Edge
applyPolyfills();

// Diagnostic Edge
const diagnostic = runEdgeDiagnostic();

// Initialiser la compatibilité Edge si nécessaire
if (diagnostic.issues.length > 0) {
  console.log('🔧 Initialisation de la compatibilité Edge...');
  initializeEdgeCompatibility();
}

// Vérifier la compatibilité de manière sécurisée
try {
  const isCompatible = checkEdgeCompatibility();
  if (!isCompatible) {
    console.warn('Problèmes de compatibilité détectés');
  }
  showEdgeWarning();
} catch (error) {
  console.warn('Erreur lors de la vérification de compatibilité:', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simple" element={<SimpleApp />} />
        <Route path="/full" element={<App />} />
        <Route path="/test" element={<TestApp />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
