import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Egg } from '../types/types';

function EggTracking() {
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    coupleId: '',
    egg1Date: '',
    egg2Date: '',
    hatchDate1: '',
    hatchDate2: '',
    success1: false,
    success2: false,
    observations: ''
  });

  useEffect(() => {
    loadEggs();
  }, []);

  const loadEggs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getEggs();
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.eggs)) {
          setEggs(response.data.eggs);
        } else if (response.data.eggs === undefined || response.data.eggs === null) {
          // Pas d'œufs encore, c'est normal
          setEggs([]);
        } else {
          console.warn('Structure de données inattendue:', response);
          setEggs([]);
        }
      } else {
        console.warn('Données d\'œufs invalides:', response);
        setEggs([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des œufs:', err);
      setError(err.message || 'Erreur lors du chargement des œufs');
      setEggs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        await api.updateEgg(editingId, formData);
      } else {
        await api.createEgg(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        coupleId: '',
        egg1Date: '',
        egg2Date: '',
        hatchDate1: '',
        hatchDate2: '',
        success1: false,
        success2: false,
        observations: ''
      });
      loadEggs();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (egg: Egg) => {
    setEditingId(egg.id);
    setFormData({
      coupleId: egg.coupleId?.toString() || '',
      egg1Date: egg.egg1Date || '',
      egg2Date: egg.egg2Date || '',
      hatchDate1: egg.hatchDate1 || '',
      hatchDate2: egg.hatchDate2 || '',
      success1: egg.success1 || false,
      success2: egg.success2 || false,
      observations: egg.observations || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet œuf ?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.deleteEgg(id);
      loadEggs();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const filteredEggs = eggs.filter(egg => {
    const matchesSearch = egg.coupleId?.toString().includes(searchTerm) ||
                         egg.observations?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Déterminer le statut basé sur les dates et succès
    const hasEgg1 = egg.egg1Date;
    const hasEgg2 = egg.egg2Date;
    const hasHatch1 = egg.hatchDate1;
    const hasHatch2 = egg.hatchDate2;
    const success1 = egg.success1;
    const success2 = egg.success2;
    
    let eggStatus = 'laid';
    if (hasHatch1 || hasHatch2) {
      eggStatus = 'hatched';
    } else if (hasEgg1 || hasEgg2) {
      eggStatus = 'fertilized';
    }
    
    const matchesFilter = filterStatus === 'all' || eggStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && eggs.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Suivi des Œufs</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel Œuf
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par couple, observations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="laid">Pondus</option>
            <option value="fertilized">Fécondés</option>
            <option value="hatched">Éclos</option>
          </select>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier l\'Œuf' : 'Nouvel Œuf'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Couple *
                </label>
                <input
                  type="number"
                  value={formData.coupleId}
                  onChange={(e) => setFormData({...formData, coupleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Œuf 1
                </label>
                <input
                  type="date"
                  value={formData.egg1Date}
                  onChange={(e) => setFormData({...formData, egg1Date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Œuf 2
                </label>
                <input
                  type="date"
                  value={formData.egg2Date}
                  onChange={(e) => setFormData({...formData, egg2Date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Éclosion 1
                </label>
                <input
                  type="date"
                  value={formData.hatchDate1}
                  onChange={(e) => setFormData({...formData, hatchDate1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Éclosion 2
                </label>
                <input
                  type="date"
                  value={formData.hatchDate2}
                  onChange={(e) => setFormData({...formData, hatchDate2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="success1"
                  checked={formData.success1}
                  onChange={(e) => setFormData({...formData, success1: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="success1" className="ml-2 block text-sm text-gray-900">
                  Succès Œuf 1
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="success2"
                  checked={formData.success2}
                  onChange={(e) => setFormData({...formData, success2: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="success2" className="ml-2 block text-sm text-gray-900">
                  Succès Œuf 2
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observations sur les œufs..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : (editingId ? 'Modifier' : 'Créer')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    coupleId: '',
                    egg1Date: '',
                    egg2Date: '',
                    hatchDate1: '',
                    hatchDate2: '',
                    success1: false,
                    success2: false,
                    observations: ''
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

      {/* Liste des œufs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Couple
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Œuf 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Œuf 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Éclosion 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Éclosion 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Succès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEggs.map((egg) => {
                const hasEgg1 = egg.egg1Date;
                const hasEgg2 = egg.egg2Date;
                const hasHatch1 = egg.hatchDate1;
                const hasHatch2 = egg.hatchDate2;
                
                let status = 'Pondus';
                if (hasHatch1 || hasHatch2) {
                  status = 'Éclos';
                } else if (hasEgg1 || hasEgg2) {
                  status = 'Fécondés';
                }

                return (
                  <tr key={egg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {egg.coupleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {egg.egg1Date ? new Date(egg.egg1Date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {egg.egg2Date ? new Date(egg.egg2Date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {egg.hatchDate1 ? new Date(egg.hatchDate1).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {egg.hatchDate2 ? new Date(egg.hatchDate2).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {egg.success1 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Œuf 1
                          </span>
                        )}
                        {egg.success2 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Œuf 2
                          </span>
                        )}
                        {!egg.success1 && !egg.success2 && (
                          <span className="text-gray-500 text-xs">Aucun</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(egg)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(egg.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredEggs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun œuf trouvé
          </div>
        )}
      </div>
    </div>
  );
}

export default EggTracking;