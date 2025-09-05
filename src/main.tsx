import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Charger les polyfills Edge en premier
import './utils/polyfills';
import { initializeEdgeConfig } from './utils/edgeConfig';
import './utils/storageManager'; // Charger le gestionnaire de stockage Edge

import App from './App.tsx';
import TestApp from './components/TestApp.tsx';
import SimpleApp from './components/SimpleApp.tsx';
import EdgeCompatibilityWrapper from './components/EdgeCompatibilityWrapper.tsx';
import EdgeDiagnostic from './components/EdgeDiagnostic.tsx';
import DarkModeTest from './components/DarkModeTest.tsx';

import './index.css';
import PrivacyPolicy from './components/PrivacyPolicy';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Initialiser la configuration Edge
initializeEdgeConfig();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EdgeCompatibilityWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/simple" element={<SimpleApp />} />
          <Route path="/full" element={<App />} />
          <Route path="/test" element={<TestApp />} />
          <Route path="/edge-diagnostic" element={<EdgeDiagnostic />} />
          <Route path="/dark-mode-test" element={<DarkModeTest />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </EdgeCompatibilityWrapper>
  </StrictMode>
);


