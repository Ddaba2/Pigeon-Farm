import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Couple } from '../types/types';

function CouplesManagement() {
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',           // Nom du couple (au lieu de nestNumber)
    breed: '',          // Race (correct)
    date_formation: '', // Date de formation (au lieu de formationDate)
    male: '',           // Nom du mâle (au lieu de maleId)
    female: '',         // Nom de la femelle (au lieu de femaleId)
    notes: '',          // Observations (au lieu de observations)
    status: 'actif'     // Statut (correct)
  });

  useEffect(() => {
    loadCouples();
  }, []);

  const loadCouples = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getCouples();
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.couples)) {
          setCouples(response.data.couples);
        } else if (response.data.couples === undefined || response.data.couples === null) {
          // Pas de couples encore, c'est normal
          setCouples([]);
        } else {
          console.warn('Structure de données inattendue:', response);
          setCouples([]);
        }
      } else {
        console.warn('Données de couples invalides:', response);
        setCouples([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des couples:', err);
      setError(err.message || 'Erreur lors du chargement des couples');
      setCouples([]);
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
        await api.updateCouple(editingId, formData);
      } else {
        await api.createCouple(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        breed: '',
        date_formation: '',
        male: '',
        female: '',
        notes: '',
        status: 'actif'
      });
      loadCouples();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (couple: Couple) => {
    setEditingId(couple.id);
    setFormData({
      name: couple.name || '',
      breed: couple.breed || '',
      date_formation: couple.date_formation || '',
      male: couple.male || '',
      female: couple.female || '',
      notes: couple.notes || '',
      status: couple.status || 'actif'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce couple ?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.deleteCouple(id);
      loadCouples();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const filteredCouples = couples.filter(couple => {
    const matchesSearch = couple.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         couple.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         couple.male?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         couple.female?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         couple.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || couple.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && couples.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Couples</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Couple
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, race, mâle, femelle..."
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
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="reproduction">En reproduction</option>
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
            {editingId ? 'Modifier le Couple' : 'Nouveau Couple'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du Couple *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ex: Couple A1, Couple Champion..."
                />
              </div>
               
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Race *
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ex: Racing Homer, Tumbler..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de Formation
                </label>
                <input
                  type="date"
                  value={formData.date_formation}
                  onChange={(e) => setFormData({...formData, date_formation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="reproduction">En reproduction</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du Mâle *
                </label>
                <input
                  type="text"
                  value={formData.male}
                  onChange={(e) => setFormData({...formData, male: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ex: Champion, Speed..."
                />
              </div>
               
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la Femelle *
                </label>
                <input
                  type="text"
                  value={formData.female}
                  onChange={(e) => setFormData({...formData, female: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ex: Belle, Swift..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observations sur le couple..."
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
                    name: '',
                    breed: '',
                    date_formation: '',
                    male: '',
                    female: '',
                    notes: '',
                    status: 'actif'
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

      {/* Liste des couples */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Race
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mâle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Femelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCouples.map((couple) => (
                <tr key={couple.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {couple.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {couple.breed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {couple.male}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {couple.female}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {couple.date_formation ? new Date(couple.date_formation).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      couple.status === 'actif' ? 'bg-green-100 text-green-800' :
                      couple.status === 'reproduction' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {couple.status === 'actif' ? 'Actif' :
                       couple.status === 'reproduction' ? 'En reproduction' :
                       couple.status === 'inactif' ? 'Inactif' : couple.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(couple)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(couple.id)}
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
        
        {filteredCouples.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun couple trouvé
          </div>
        )}
      </div>
    </div>
  );
}

export default CouplesManagement;