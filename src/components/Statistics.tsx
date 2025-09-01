import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
import apiService from '../utils/api';

const Statistics: React.FC = () => {
  const [stats, setStats] = useState({
    couples: {
      total: 0,
      active: 0,
      reproduction: 0,
      inactive: 0
    },
    eggs: {
      total: 0,
      incubation: 0,
      hatched: 0,
      failed: 0
    },
    pigeonneaux: {
      total: 0,
      active: 0,
      sold: 0,
      deceased: 0
    },
    health: {
      total: 0,
      vaccinations: 0,
      treatments: 0,
      exams: 0
    }
  });

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await apiService.get('/statistics/detailed');
        if (response.success && response.data) {
          setStats({
            couples: {
              total: response.data.couples?.total || 0,
              active: response.data.couples?.active || 0,
              reproduction: response.data.couples?.reproduction || 0,
              inactive: response.data.couples?.inactive || 0
            },
            eggs: {
              total: response.data.eggs?.total || 0,
              incubation: 0, // À calculer selon la logique métier
              hatched: response.data.eggs?.success1_count || 0,
              failed: response.data.eggs?.failed_count || 0
            },
            pigeonneaux: {
              total: response.data.pigeonneaux?.total || 0,
              active: response.data.pigeonneaux?.active || 0,
              sold: response.data.pigeonneaux?.sold || 0,
              deceased: response.data.pigeonneaux?.deceased || 0
            },
            health: {
              total: response.data.health?.total || 0,
              vaccinations: response.data.health?.vaccinations || 0,
              treatments: response.data.health?.treatments || 0,
              exams: response.data.health?.exams || 0
            }
          });
        }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    loadStatistics();
  }, []);

  return (
    <div className="space-y-6">
          <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistiques</h1>
        <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de votre élevage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.couples.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Œufs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.eggs.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pigeonneaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pigeonneaux.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Soins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.health.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Répartition des Couples</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Actifs</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.couples.active}</span>
                  </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">En reproduction</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.couples.reproduction}</span>
                </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Inactifs</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.couples.inactive}</span>
          </div>
        </div>
      </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut des Œufs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">En incubation</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.eggs.incubation}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Éclos</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.eggs.hatched}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Échoués</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.eggs.failed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Graphique de Performance</h3>
        <div className="h-64 flex items-end justify-center space-x-2">
          <div className="bg-blue-500 rounded-t w-8 h-20"></div>
          <div className="bg-green-500 rounded-t w-8 h-32"></div>
          <div className="bg-purple-500 rounded-t w-8 h-24"></div>
          <div className="bg-red-500 rounded-t w-8 h-28"></div>
          <div className="bg-yellow-500 rounded-t w-8 h-36"></div>
          <div className="bg-indigo-500 rounded-t w-8 h-16"></div>
          </div>
        <div className="flex justify-center space-x-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Jan</span>
          <span>Fév</span>
          <span>Mar</span>
          <span>Avr</span>
          <span>Mai</span>
          <span>Juin</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 