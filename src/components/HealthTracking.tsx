import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { HealthRecord } from '../types/types';

function HealthTracking() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    type: 'vaccination',
    product: '',
    targetType: 'couple',
    targetId: '',
    date: '',
    nextDue: '',
    observations: ''
  });

  useEffect(() => {
    loadHealthRecords();
  }, []);

  const loadHealthRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getHealthRecords();
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.healthRecords)) {
          setHealthRecords(response.data.healthRecords);
        } else if (response.data.healthRecords === undefined || response.data.healthRecords === null) {
          // Pas d'enregistrements encore, c'est normal
          setHealthRecords([]);
        } else {
          console.warn('Structure de données inattendue:', response);
          setHealthRecords([]);
        }
      } else {
        console.warn('Données de santé invalides:', response);
        setHealthRecords([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des enregistrements de santé:', err);
      setError(err.message || 'Erreur lors du chargement des enregistrements de santé');
      setHealthRecords([]);
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
        await api.updateHealthRecord(editingId, formData);
      } else {
        await api.createHealthRecord(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        type: 'vaccination',
        product: '',
        targetType: 'couple',
        targetId: '',
        date: '',
        nextDue: '',
        observations: ''
      });
      loadHealthRecords();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingId(record.id);
    setFormData({
      type: record.type || 'vaccination',
      product: record.product || '',
      targetType: record.targetType || 'couple',
      targetId: record.targetId?.toString() || '',
      date: record.date || '',
      nextDue: record.nextDue || '',
      observations: record.observations || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement de santé ?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.deleteHealthRecord(id);
      loadHealthRecords();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = record.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.targetId?.toString().includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || record.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && healthRecords.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Suivi de Santé</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel Enregistrement
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par produit, observations, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">Tous les types</option>
            <option value="vaccination">Vaccination</option>
            <option value="treatment">Traitement</option>
            <option value="prevention">Prévention</option>
            <option value="checkup">Contrôle</option>
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
            {editingId ? 'Modifier l\'Enregistrement' : 'Nouvel Enregistrement de Santé'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'Intervention *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="vaccination">Vaccination</option>
                  <option value="treatment">Traitement</option>
                  <option value="prevention">Prévention</option>
                  <option value="checkup">Contrôle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit *
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Nom du produit utilisé"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Cible *
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({...formData, targetType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="couple">Couple</option>
                  <option value="pigeonneau">Pigeonneau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de la Cible *
                </label>
                <input
                  type="number"
                  value={formData.targetId}
                  onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder={`ID du ${formData.targetType}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'Intervention *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prochaine Intervention
                </label>
                <input
                  type="date"
                  value={formData.nextDue}
                  onChange={(e) => setFormData({...formData, nextDue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="Observations sur l'intervention..."
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
                    type: 'vaccination',
                    product: '',
                    targetType: 'couple',
                    targetId: '',
                    date: '',
                    nextDue: '',
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

      {/* Liste des enregistrements */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prochaine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === 'vaccination' ? 'bg-blue-100 text-blue-800' :
                      record.type === 'treatment' ? 'bg-red-100 text-red-800' :
                      record.type === 'prevention' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.type === 'vaccination' ? 'Vaccination' :
                       record.type === 'treatment' ? 'Traitement' :
                       record.type === 'prevention' ? 'Prévention' :
                       record.type === 'checkup' ? 'Contrôle' : record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.targetType === 'couple' ? `Couple ${record.targetId}` : `Pigeonneau ${record.targetId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.nextDue ? new Date(record.nextDue).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
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
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun enregistrement de santé trouvé
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthTracking;