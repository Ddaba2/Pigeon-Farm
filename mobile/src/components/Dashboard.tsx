import React, { useEffect, useState } from 'react';
import { Users, Egg, Bird, TrendingUp, AlertTriangle, ChevronRight, Heart, ShoppingCart, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { getUpcomingDue } from '../services/healthService';
import { getSales } from '../services/saleService';
import { getCouples } from '../services/coupleService';
import { HealthRecord, Sale, Couple } from '../types';
import { TARGET_LABELS } from './sales/SalesList';

function StatCard({ label, value, icon: Icon, color, onClick }: {
  label: string; value: string | number; icon: React.ElementType; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card flex items-center gap-3 active:scale-95 transition-transform w-full text-left">
      <div className={`rounded-xl p-3 ${color} shrink-0`}><Icon size={22} className="text-white" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{label}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
    </button>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-100">{value.toLocaleString('fr-FR')}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { stats, refreshStats, setActiveTab } = useApp();
  const { canSell, canAdd } = usePermissions();
  const [alerts, setAlerts]           = useState<HealthRecord[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [allSales, setAllSales]       = useState<Sale[]>([]);
  const [couples, setCouples]         = useState<Couple[]>([]);

  useEffect(() => {
    refreshStats();
    getUpcomingDue().then(setAlerts);
    getSales().then(s => { setAllSales(s); setRecentSales(s.slice(0, 3)); });
    getCouples().then(setCouples);
  }, []);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = allSales
    .filter(s => (s.date ?? '').startsWith(thisMonth))
    .reduce((sum, s) => sum + s.amount, 0);

  const activeCouples = couples.filter(c => c.status === 'actif').length;
  const maxStat = Math.max(stats.totalCouples, stats.totalEggs, stats.pigeonneauxVivants, 1);

  const quickActions = [
    { label: 'Nouveau couple',     tab: 'couples',     icon: Users,        color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',   show: canAdd },
    { label: 'Nouvelle ponte',     tab: 'eggs',        icon: Egg,          color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', show: canAdd },
    { label: 'Nouveau pigeonneau', tab: 'pigeonneaux', icon: Bird,         color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',  show: canAdd },
    { label: 'Enregistrer vente',  tab: 'sales',       icon: ShoppingCart, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', show: canSell },
    { label: 'Soin / Vaccin',      tab: 'health',      icon: Heart,        color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',        show: canAdd },
  ].filter(a => a.show);

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="logo" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pigeon Farm</h1>
          <p className="text-sm text-gray-400 capitalize">{today}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Couples actifs"      value={activeCouples}     icon={Users}       color="bg-blue-500"    onClick={() => setActiveTab('couples')} />
        <StatCard label="Pontes enregistrées" value={stats.totalEggs}   icon={Egg}         color="bg-yellow-500"  onClick={() => setActiveTab('eggs')} />
        <StatCard label="Pigeonneaux vivants" value={stats.pigeonneauxVivants} icon={Bird} color="bg-primary-600" onClick={() => setActiveTab('pigeonneaux')} />
        <StatCard label="Revenus totaux FCFA" value={stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString('fr-FR') : '0'} icon={TrendingUp} color="bg-purple-500" onClick={() => setActiveTab('sales')} />
      </div>

      {/* Alertes rappels sanitaires */}
      {alerts.length > 0 && (
        <button
          onClick={() => setActiveTab('health')}
          className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400 shrink-0" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">{alerts.length} rappel(s) sanitaire(s)</h3>
          </div>
          {alerts.slice(0, 2).map(a => (
            <div key={a.id} className="flex justify-between items-center py-0.5">
              <span className="text-sm text-orange-700 dark:text-orange-300">{a.product || a.type}</span>
              <span className="badge bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200">
                {a.next_due ? new Date(a.next_due).toLocaleDateString('fr-FR') : '—'}
              </span>
            </div>
          ))}
          {alerts.length > 2 && <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">+{alerts.length - 2} autres…</p>}
        </button>
      )}

      {/* Vue d'ensemble */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={18} className="text-primary-600" />
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Vue d'ensemble</h3>
        </div>
        <div className="space-y-3">
          <MiniBar label="Couples"     value={stats.totalCouples}     max={maxStat} color="bg-blue-400" />
          <MiniBar label="Pontes"      value={stats.totalEggs}        max={maxStat} color="bg-yellow-400" />
          <MiniBar label="Pigeonneaux" value={stats.totalPigeonneaux} max={maxStat} color="bg-primary-500" />
          <MiniBar label="Vendus"      value={stats.totalPigeonneaux - stats.pigeonneauxVivants} max={maxStat} color="bg-purple-400" />
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 mt-3 pt-3 flex justify-between">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ventes totales</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{stats.totalSales}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Revenus totaux</p>
            <p className="font-bold text-primary-700 dark:text-primary-400">{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ce mois</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{monthRevenue.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>
      </div>

      {/* Dernières ventes */}
      {recentSales.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Dernières ventes</h3>
            <button onClick={() => setActiveTab('sales')} className="text-xs text-primary-600 dark:text-primary-400 font-medium">Voir tout</button>
          </div>
          <div className="space-y-2">
            {recentSales.map(s => (
              <div key={s.id} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.buyer_name || 'Acheteur inconnu'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {TARGET_LABELS[s.target_type]} · {new Date(s.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className="font-bold text-primary-700 dark:text-primary-400">{s.amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides (filtrées par rôle) */}
      {quickActions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(({ label, tab, icon: Icon, color }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 p-3 rounded-xl ${color} active:scale-95 transition-transform`}
              >
                <Icon size={16} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
