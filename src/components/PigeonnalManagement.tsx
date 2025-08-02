import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Pigeonneau } from '../types/types';

function PigeonnalManagement() {
  const [pigeonneaux, setPigeonneaux] = useState<Pigeonneau[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    coupleId: '',
    eggRecordId: '',
    birthDate: '',
    sex: 'unknown',
    status: 'alive',
    salePrice: '',
    saleDate: '',
    buyer: '',
    observations: ''
  });

  useEffect(() => {
    loadPigeonneaux();
  }, []);

  const loadPigeonneaux = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getPigeonneaux();
      if (Array.isArray(data)) {
        setPigeonneaux(data);
      } else {
        console.warn('Données de pigeonneaux invalides:', data);
        setPigeonneaux([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des pigeonneaux:', err);
      setError(err.message || 'Erreur lors du chargement des pigeonneaux');
      setPigeonneaux([]);
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
        await api.updatePigeonneau(editingId, formData);
      } else {
        await api.createPigeonneau(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        coupleId: '',
        eggRecordId: '',
        birthDate: '',
        sex: 'unknown',
        status: 'alive',
        salePrice: '',
        saleDate: '',
        buyer: '',
        observations: ''
      });
      loadPigeonneaux();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pigeonneau: Pigeonneau) => {
    setEditingId(pigeonneau.id);
    setFormData({
      coupleId: pigeonneau.coupleId?.toString() || '',
      eggRecordId: pigeonneau.eggRecordId?.toString() || '',
      birthDate: pigeonneau.birthDate || '',
      sex: pigeonneau.sex || 'unknown',
      status: pigeonneau.status || 'alive',
      salePrice: pigeonneau.salePrice?.toString() || '',
      saleDate: pigeonneau.saleDate || '',
      buyer: pigeonneau.buyer || '',
      observations: pigeonneau.observations || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pigeonneau ?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.deletePigeonneau(id);
      loadPigeonneaux();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const filteredPigeonneaux = pigeonneaux.filter(pigeonneau => {
    const matchesSearch = pigeonneau.coupleId?.toString().includes(searchTerm) ||
                         pigeonneau.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pigeonneau.buyer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || pigeonneau.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && pigeonneaux.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Pigeonneaux</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Pigeonneau
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par couple, observations, acheteur..."
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
            <option value="alive">Vivant</option>
            <option value="sold">Vendu</option>
            <option value="dead">Mort</option>
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
            {editingId ? 'Modifier le Pigeonneau' : 'Nouveau Pigeonneau'}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Œuf (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.eggRecordId}
                  onChange={(e) => setFormData({...formData, eggRecordId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de Naissance *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexe
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({...formData, sex: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unknown">Inconnu</option>
                  <option value="male">Mâle</option>
                  <option value="female">Femelle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alive">Vivant</option>
                  <option value="sold">Vendu</option>
                  <option value="dead">Mort</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de Vente
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de Vente
                </label>
                <input
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acheteur
                </label>
                <input
                  type="text"
                  value={formData.buyer}
                  onChange={(e) => setFormData({...formData, buyer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de l'acheteur"
                />
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
                placeholder="Observations sur le pigeonneau..."
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
                    eggRecordId: '',
                    birthDate: '',
                    sex: 'unknown',
                    status: 'alive',
                    salePrice: '',
                    saleDate: '',
                    buyer: '',
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

      {/* Liste des pigeonneaux */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Couple
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Race
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Naissance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sexe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPigeonneaux.map((pigeonneau) => (
                <tr key={pigeonneau.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pigeonneau.coupleId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pigeonneau.race || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pigeonneau.birthDate ? new Date(pigeonneau.birthDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pigeonneau.sex === 'male' ? 'Mâle' : 
                     pigeonneau.sex === 'female' ? 'Femelle' : 'Inconnu'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pigeonneau.status === 'alive' ? 'bg-green-100 text-green-800' :
                      pigeonneau.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pigeonneau.status === 'alive' ? 'Vivant' :
                       pigeonneau.status === 'sold' ? 'Vendu' :
                       pigeonneau.status === 'dead' ? 'Mort' : pigeonneau.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pigeonneau.salePrice ? `${pigeonneau.salePrice}€` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pigeonneau)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pigeonneau.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPigeonneaux.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun pigeonneau trouvé
          </div>
        )}
      </div>
    </div>
  );
}

export default PigeonnalManagement;