import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Charger les polyfills Edge en premier
import './utils/polyfills';
import { initializeEdgeConfig } from './utils/edgeConfig';
import './utils/storageManager'; // Charger le gestionnaire de stockage Edge

import App from './App.tsx';
import './index.css';
import PrivacyPolicy from './components/PrivacyPolicy';
import OAuthSuccess from './components/OAuthSuccess';
import OAuthError from './components/OAuthError';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Initialiser la configuration Edge
initializeEdgeConfig();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
        <Route path="/auth/success" element={<OAuthSuccess onAuthSuccess={() => {}} />} />
        <Route path="/auth/error" element={<OAuthError />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);


