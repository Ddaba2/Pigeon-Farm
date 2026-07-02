import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppStats } from '../types';
import { query } from '../db/DatabaseService';
import { useDarkMode } from '../hooks/useDarkMode';

interface CountRow { count: number }
interface SalesRow { count: number; total: number }

interface AppContextType {
  stats: AppStats;
  refreshStats: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const defaultStats: AppStats = {
  totalCouples: 0,
  activeCouples: 0,
  totalEggs: 0,
  totalPigeonneaux: 0,
  pigeonneauxVivants: 0,
  totalSales: 0,
  totalRevenue: 0,
  pendingSync: 0,
};

const AppContext = createContext<AppContextType>({
  stats: defaultStats,
  refreshStats: async () => {},
  activeTab: 'dashboard',
  setActiveTab: () => {},
  isDark: false,
  toggleDark: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AppStats>(defaultStats);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isDark, toggleDark } = useDarkMode();

  const refreshStats = useCallback(async () => {
    try {
      const [couples, active, eggs, pigeons, vivants, salesRows, p1, p2, p3, p4, p5] = await Promise.all([
        query<CountRow>('SELECT COUNT(*) as count FROM couples'),
        query<CountRow>('SELECT COUNT(*) as count FROM couples WHERE status = "actif"'),
        query<CountRow>('SELECT COUNT(*) as count FROM eggs'),
        query<CountRow>('SELECT COUNT(*) as count FROM pigeonneaux'),
        query<CountRow>('SELECT COUNT(*) as count FROM pigeonneaux WHERE status = "vivant"'),
        query<SalesRow>('SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as total FROM sales'),
        query<CountRow>('SELECT COUNT(*) as count FROM couples WHERE synced = 0'),
        query<CountRow>('SELECT COUNT(*) as count FROM eggs WHERE synced = 0'),
        query<CountRow>('SELECT COUNT(*) as count FROM pigeonneaux WHERE synced = 0'),
        query<CountRow>('SELECT COUNT(*) as count FROM health_records WHERE synced = 0'),
        query<CountRow>('SELECT COUNT(*) as count FROM sales WHERE synced = 0'),
      ]);

      const pendingSync = [p1, p2, p3, p4, p5].reduce((s, r) => s + (r[0]?.count ?? 0), 0);

      setStats({
        totalCouples:     couples[0]?.count   ?? 0,
        activeCouples:    active[0]?.count    ?? 0,
        totalEggs:        eggs[0]?.count      ?? 0,
        totalPigeonneaux: pigeons[0]?.count   ?? 0,
        pigeonneauxVivants: vivants[0]?.count ?? 0,
        totalSales:       salesRows[0]?.count ?? 0,
        totalRevenue:     salesRows[0]?.total ?? 0,
        pendingSync,
      });
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  }, []);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  return (
    <AppContext.Provider value={{ stats, refreshStats, activeTab, setActiveTab, isDark, toggleDark }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
