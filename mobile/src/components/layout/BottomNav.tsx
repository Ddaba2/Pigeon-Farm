import React from 'react';
import { Home, Users, Egg, Bird, ShoppingCart, Heart, BarChart3, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';

const ALL_TABS = [
  { id: 'dashboard',   label: 'Accueil', icon: Home,         always: true },
  { id: 'couples',     label: 'Couples', icon: Users,        always: true },
  { id: 'eggs',        label: 'Œufs',   icon: Egg,          always: true },
  { id: 'pigeonneaux', label: 'Pigeons', icon: Bird,         always: true },
  { id: 'sales',       label: 'Ventes',  icon: ShoppingCart, always: true },
  { id: 'health',      label: 'Santé',   icon: Heart,        always: true },
  { id: 'stats',       label: 'Stats',   icon: BarChart3,    always: false }, // caché pour employé
  { id: 'settings',    label: 'Params',  icon: Settings,     always: true },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  const { canViewStats } = usePermissions();

  const tabs = ALL_TABS.filter(t => t.always || canViewStats);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 pb-safe">
      <div className={`grid h-16`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === id
                ? 'text-primary-600'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium leading-none">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
