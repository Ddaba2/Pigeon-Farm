import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Smartphone, Clock, Globe, Save, RotateCcw, Settings } from 'lucide-react';
import { apiService } from '../utils/api';

interface NotificationPreferences {
  userId: number;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  criticalAlertsOnly: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les préférences
  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/user-preferences');
      
      if (response.success) {
        setPreferences(response.data);
      } else {
        setError('Erreur lors du chargement des préférences');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des préférences:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors du chargement des préférences';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les préférences
  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Only send the preference values, not metadata like createdAt/updatedAt
      const { userId, createdAt, updatedAt, ...preferenceData } = preferences;
      const response = await apiService.put('/user-preferences', preferenceData);
      
      if (response.success) {
        setSuccess('Préférences sauvegardées avec succès');
        setPreferences(response.data);
      } else {
        setError('Erreur lors de la sauvegarde des préférences');
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors de la sauvegarde des préférences';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Réinitialiser les préférences
  const resetPreferences = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser vos préférences ?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiService.post('/user-preferences/reset');
      
      if (response.success) {
        setSuccess('Préférences réinitialisées avec succès');
        setPreferences(response.data);
      } else {
        setError('Erreur lors de la réinitialisation des préférences');
      }
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation des préférences:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors de la réinitialisation des préférences';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour une préférence
  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: value
    });
  };

  // Charger les préférences au montage
  useEffect(() => {
    loadPreferences();
  }, []);

  // Masquer le message de succès après 3 secondes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des préférences...</span>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Impossible de charger les préférences</p>
          <button
            onClick={loadPreferences}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Préférences de Notification
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetPreferences}
            disabled={saving}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
          
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Types de notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Types de Notifications
        </h3>
        
        <div className="space-y-4">
          {/* Notifications Push */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Notifications Push</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recevoir des notifications dans le navigateur
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notifications Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Notifications Email</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recevoir des alertes par email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notifications SMS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Notifications SMS</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recevoir des alertes par SMS (fonctionnalité à venir)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
                disabled
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Préférences avancées */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Préférences Avancées
        </h3>
        
        <div className="space-y-4">
          {/* Alertes critiques uniquement */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellOff className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Alertes critiques uniquement</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ne recevoir que les alertes de priorité haute
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.criticalAlertsOnly}
                onChange={(e) => updatePreference('criticalAlertsOnly', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Heures silencieuses */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-indigo-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Heures silencieuses</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Période pendant laquelle les notifications sont réduites
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 ml-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Début
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fin
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Fuseau horaire */}
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-cyan-500" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuseau horaire
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => updatePreference('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Informations
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Les alertes critiques sont toujours envoyées, même pendant les heures silencieuses</li>
          <li>• Les notifications push nécessitent l'autorisation de votre navigateur</li>
          <li>• Les emails sont envoyés à l'adresse associée à votre compte</li>
          <li>• Les préférences sont sauvegardées automatiquement</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;