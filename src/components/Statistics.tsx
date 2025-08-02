import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Calendar } from 'lucide-react';
import { Statistics as StatisticsType } from '../types/types';

function Statistics() {
  const [stats, setStats] = useState<StatisticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [salesForm, setSalesForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getStatisticsByPeriod(period);
      if (data && typeof data === 'object') {
        setStats(data);
      } else {
        console.warn('Données de statistiques invalides:', data);
        setStats(null);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createSale({
        amount: parseFloat(salesForm.amount),
        description: salesForm.description,
        date: salesForm.date
      });
      
      setShowSalesForm(false);
      setSalesForm({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadStatistics();
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de la vente:', err);
      setError(err.message || 'Erreur lors de l\'ajout de la vente');
      } finally {
        setLoading(false);
      }
    };
    
  if (loading && !stats) {
    return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        <button
            onClick={() => setShowSalesForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
            Ajouter une vente
        </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Formulaire d'ajout de vente */}
      {showSalesForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ajouter une vente</h2>
          
          <form onSubmit={handleSalesSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salesForm.amount}
                  onChange={(e) => setSalesForm({...salesForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={salesForm.description}
                  onChange={(e) => setSalesForm({...salesForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
          </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={salesForm.date}
                  onChange={(e) => setSalesForm({...salesForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
          </div>
        </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSalesForm(false);
                  setSalesForm({
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
          </div>
          </form>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenus */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenus</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.revenue?.toFixed(2) || '0'} €
                </p>
          </div>
        </div>
            <div className="mt-4 flex items-center">
              {stats.revenueGrowth && stats.revenueGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${
                stats.revenueGrowth && stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.revenueGrowth ? Math.abs(stats.revenueGrowth).toFixed(1) : '0'}%
              </span>
          </div>
          </div>

          {/* Couples */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Couples</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.couples || '0'}
                </p>
          </div>
        </div>
            <div className="mt-4 flex items-center">
              {stats.couplesGrowth && stats.couplesGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${
                stats.couplesGrowth && stats.couplesGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.couplesGrowth ? Math.abs(stats.couplesGrowth).toFixed(1) : '0'}%
              </span>
            </div>
          </div>

          {/* Œufs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Œufs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.eggs || '0'}
                </p>
          </div>
        </div>
            <div className="mt-4 flex items-center">
              {stats.eggsGrowth && stats.eggsGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${
                stats.eggsGrowth && stats.eggsGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.eggsGrowth ? Math.abs(stats.eggsGrowth).toFixed(1) : '0'}%
              </span>
          </div>
          </div>

          {/* Pigeonneaux */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pigeonneaux</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pigeonneaux || '0'}
                </p>
          </div>
        </div>
            <div className="mt-4 flex items-center">
              {stats.pigeonneauxGrowth && stats.pigeonneauxGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${
                stats.pigeonneauxGrowth && stats.pigeonneauxGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.pigeonneauxGrowth ? Math.abs(stats.pigeonneauxGrowth).toFixed(1) : '0'}%
              </span>
          </div>
          </div>
        </div>
      )}

      {/* Graphiques ou tableaux détaillés */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Détails des statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">Ventes récentes</h3>
              {stats.recentSales && stats.recentSales.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentSales.map((sale: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{sale.description}</span>
                      <span className="text-sm font-medium">{sale.amount} €</span>
      </div>
                  ))}
        </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune vente récente</p>
              )}
            </div>
            
                <div>
              <h3 className="text-md font-medium mb-2">Activité</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Couples actifs</span>
                  <span className="text-sm font-medium">{stats.activeCouples || '0'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Œufs fécondés</span>
                  <span className="text-sm font-medium">{stats.fertilizedEggs || '0'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Taux de survie</span>
                  <span className="text-sm font-medium">{stats.survivalRate ? `${stats.survivalRate}%` : '0%'}</span>
                </div>
              </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

export default Statistics; 