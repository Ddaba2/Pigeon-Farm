import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Activity, Heart, Calendar, DollarSign, BarChart3, PieChart, LineChart, Syringe, AlertTriangle } from 'lucide-react';

interface StatisticsData {
  overview: {
    totalCouples: number;
    totalEggs: number;
    totalPigeonneaux: number;
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
  };
  monthlyData: Array<{
    month: string;
    eggs: number;
    pigeonneaux: number;
    revenue: number;
    expenses: number;
  }>;
  breedDistribution: Array<{
    breed: string;
    count: number;
    percentage: number;
  }>;
  healthStats: {
    vaccinations: number;
    treatments: number;
    checkups: number;
    emergencies: number;
  };
  productivity: {
    hatchingRate: number;
    survivalRate: number;
    breedingEfficiency: number;
  };
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      // Simulation des données - à remplacer par l'appel API réel
      const mockStats: StatisticsData = {
        overview: {
          totalCouples: 24,
          totalEggs: 18,
          totalPigeonneaux: 12,
          totalRevenue: 450000,
          totalExpenses: 180000,
          profit: 270000
        },
        monthlyData: [
          { month: 'Jan', eggs: 18, pigeonneaux: 12, revenue: 450000, expenses: 180000 },
          { month: 'Fév', eggs: 22, pigeonneaux: 15, revenue: 520000, expenses: 195000 },
          { month: 'Mar', eggs: 25, pigeonneaux: 18, revenue: 580000, expenses: 210000 },
          { month: 'Avr', eggs: 28, pigeonneaux: 20, revenue: 620000, expenses: 225000 },
          { month: 'Mai', eggs: 30, pigeonneaux: 22, revenue: 680000, expenses: 240000 },
          { month: 'Juin', eggs: 32, pigeonneaux: 25, revenue: 720000, expenses: 255000 }
        ],
        breedDistribution: [
          { breed: 'Racing Homer', count: 12, percentage: 50 },
          { breed: 'Tumbler', count: 6, percentage: 25 },
          { breed: 'Fantail', count: 4, percentage: 17 },
          { breed: 'Autres', count: 2, percentage: 8 }
        ],
        healthStats: {
          vaccinations: 45,
          treatments: 12,
          checkups: 28,
          emergencies: 3
        },
        productivity: {
          hatchingRate: 78.5,
          survivalRate: 92.3,
          breedingEfficiency: 85.7
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XOF';
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitBgColor = (profit: number) => {
    return profit >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune donnée disponible</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Les statistiques ne sont pas encore disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Statistiques de l'Élevage
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Analyse complète de vos performances et indicateurs clés
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">Mensuel</option>
              <option value="quarter">Trimestriel</option>
              <option value="year">Annuel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalCouples}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Œufs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalEggs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pigeonneaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalPigeonneaux}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${getProfitBgColor(stats.overview.profit)}`}>
              <DollarSign className={`h-6 w-6 ${getProfitColor(stats.overview.profit)}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bénéfice</p>
              <p className={`text-2xl font-bold ${getProfitColor(stats.overview.profit)}`}>
                {formatCurrency(stats.overview.profit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Évolution Mensuelle
          </h3>
          <div className="space-y-4">
            {stats.monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {data.month}
                </span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {data.eggs} œufs
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {data.pigeonneaux} pigeonneaux
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution des races */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribution des Races
          </h3>
          <div className="space-y-3">
            {stats.breedDistribution.map((breed, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {breed.breed}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${breed.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {breed.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques de santé et productivité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques de santé */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques de Santé
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Syringe className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.healthStats.vaccinations}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200">Vaccinations</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Heart className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.healthStats.checkups}
              </p>
              <p className="text-sm text-green-700 dark:text-green-200">Contrôles</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Activity className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {stats.healthStats.treatments}
              </p>
              <p className="text-sm text-red-700 dark:text-red-200">Traitements</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {stats.healthStats.emergencies}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-200">Urgences</p>
            </div>
          </div>
        </div>

        {/* Indicateurs de productivité */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Indicateurs de Productivité
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Taux d'éclosion
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.productivity.hatchingRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.productivity.hatchingRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Taux de survie
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.productivity.survivalRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.productivity.survivalRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Efficacité reproduction
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.productivity.breedingEfficiency}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${stats.productivity.breedingEfficiency}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Résumé Financier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(stats.overview.totalRevenue)}
            </p>
            <p className="text-sm text-green-700 dark:text-green-200">Revenus Totaux</p>
          </div>
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(stats.overview.totalExpenses)}
            </p>
            <p className="text-sm text-red-700 dark:text-red-200">Dépenses Totales</p>
          </div>
          <div className={`text-center p-6 rounded-lg ${getProfitBgColor(stats.overview.profit)}`}>
            <DollarSign className={`h-8 w-8 mx-auto mb-2 ${getProfitColor(stats.overview.profit)}`} />
            <p className={`text-2xl font-bold ${getProfitColor(stats.overview.profit)}`}>
              {formatCurrency(stats.overview.profit)}
            </p>
            <p className={`text-sm ${getProfitColor(stats.overview.profit)}`}>
              Bénéfice Net
            </p>
          </div>
        </div>
      </div>

      {/* Conseils d'amélioration */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📊 Conseils d'amélioration
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p><strong>Productivité :</strong> Optimisez la nutrition pour améliorer le taux d'éclosion</p>
            <p><strong>Santé :</strong> Maintenez un calendrier de vaccination strict</p>
            <p><strong>Gestion :</strong> Surveillez les coûts d'alimentation</p>
          </div>
          <div>
            <p><strong>Reproduction :</strong> Sélectionnez les meilleurs reproducteurs</p>
            <p><strong>Marché :</strong> Diversifiez vos races pour attirer plus de clients</p>
            <p><strong>Technologie :</strong> Utilisez des outils de suivi automatisés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 