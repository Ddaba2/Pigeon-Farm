import React from 'react';
import { BarChart3, Users, FileText, Activity, Heart, TrendingUp, FileText as FileTextIcon, Settings, Accessibility } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onAccessibilityToggle: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, userRole, onAccessibilityToggle }) => {
  const { preferences } = useAccessibility();
  
  const tabs = [
    // Les admins n'ont pas accès au tableau de bord normal, ils utilisent l'interface admin
    ...(userRole !== 'admin' ? [{ id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 }] : []),
    { id: 'couples', label: 'Couples', icon: Users },
    { id: 'eggs', label: 'Œufs', icon: FileText },
    { id: 'pigeonneaux', label: 'Pigeonneaux', icon: Activity },
    { id: 'health', label: 'Santé', icon: Heart },
    { id: 'statistics', label: 'Statistiques', icon: TrendingUp },
    { id: 'help', label: 'Aide', icon: Settings },
  ];
  
  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" role="navigation" aria-label="Navigation principale">
      <div className="flex items-center gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sections de l'application">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-accessible flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus-visible-ring ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                aria-label={`Aller à ${tab.label}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={onAccessibilityToggle}
          className="btn-accessible p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus-visible-ring"
          aria-label="Ouvrir les paramètres d'accessibilité"
          title="Paramètres d'accessibilité"
        >
          <Accessibility className="h-5 w-5" />
          {preferences.highContrast && (
            <span className="sr-only">Mode contraste élevé activé</span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;