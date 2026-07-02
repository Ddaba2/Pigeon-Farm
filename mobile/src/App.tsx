import React, { useState, useEffect } from 'react';
import { initDatabase } from './db/DatabaseService';
import { scheduleHealthReminders } from './services/notificationService';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNav } from './components/layout/BottomNav';
import { SyncBanner } from './components/layout/SyncBanner';
import { SetupScreen } from './components/auth/SetupScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { CouplesList } from './components/couples/CouplesList';
import { EggsList } from './components/eggs/EggsList';
import { PigeonneauxList } from './components/pigeonneaux/PigeonneauxList';
import { SalesList } from './components/sales/SalesList';
import { HealthList } from './components/health/HealthList';
import { StatisticsPage } from './components/statistics/StatisticsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { useApp } from './context/AppContext';
import { usePermissions } from './hooks/usePermissions';

function Screen() {
  const { activeTab } = useApp();
  const { canViewStats } = usePermissions();

  return (
    <>
      {activeTab === 'dashboard'   && <Dashboard />}
      {activeTab === 'couples'     && <CouplesList />}
      {activeTab === 'eggs'        && <EggsList />}
      {activeTab === 'pigeonneaux' && <PigeonneauxList />}
      {activeTab === 'sales'       && <SalesList />}
      {activeTab === 'health'      && <HealthList />}
      {activeTab === 'stats'       && (
        canViewStats
          ? <StatisticsPage />
          : <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
              <p className="text-4xl mb-4">🔒</p>
              <p className="text-gray-500 dark:text-gray-400">Accès réservé aux Gérants et Administrateurs</p>
            </div>
      )}
      {activeTab === 'settings'    && <SettingsPage />}
    </>
  );
}

function AuthGate() {
  const { isSetupDone, isAuthenticated, farmMode } = useAuth();

  if (!isSetupDone) return <SetupScreen />;
  if (farmMode === 'multi' && !isAuthenticated) return <LoginScreen />;

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <SyncBanner />
        <main className="flex-1 overflow-auto pb-16">
          <Screen />
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-primary-600 flex flex-col items-center justify-center gap-4">
      <img src="/logo.png" alt="Pigeon Farm" className="w-36 h-36 object-contain drop-shadow-xl" />
      <h1 className="text-3xl font-bold text-white">Pigeon Farm</h1>
      <p className="text-primary-100 text-sm">Initialisation…</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-semibold text-gray-800">Erreur de démarrage</h2>
      <p className="text-sm text-gray-500 break-words max-w-xs">{message}</p>
      <button onClick={() => window.location.reload()} className="bg-primary-600 text-white px-6 py-3 rounded-full font-semibold">
        Réessayer
      </button>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initDatabase()
      .then(() => {
        setReady(true);
        // Programmer les rappels sanitaires (best-effort, silencieux si refus)
        scheduleHealthReminders().catch(() => {});
      })
      .catch(e => setError(e?.message ?? 'Erreur inconnue'));
  }, []);

  if (error)  return <ErrorScreen message={error} />;
  if (!ready) return <LoadingScreen />;

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
