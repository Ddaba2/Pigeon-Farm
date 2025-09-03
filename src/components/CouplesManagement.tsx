import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import apiService from '../utils/api';

interface Couple {
  id: number;
  name: string; // nestNumber from backend
  breed: string; // race from backend
  male: string;
  female: string;
  formationDate: string;
  status: 'active' | 'inactive' | 'reproduction';
  observations?: string;
}

const CouplesManagement: React.FC = () => {
  const [couples, setCouples] = useState<Couple[]>([]);

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadCouples = async () => {
      try {
        const response = await apiService.getCouples();
        if (response.success && response.data) {
          setCouples(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des couples:', error);
      }
    };

    loadCouples();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingCouple, setEditingCouple] = useState<Couple | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    male: '',
    female: '',
    formationDate: new Date().toISOString().split('T')[0],
    status: 'active' as const,
    observations: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Transformer les données pour le backend
      const backendData = {
        nestNumber: formData.name,
        race: formData.breed,
        male: formData.male,
        female: formData.female,
        formationDate: formData.formationDate,
        status: formData.status,
        observations: formData.observations
      };

      if (editingCouple) {
        // Modification
        const response = await apiService.updateCouple(editingCouple.id, backendData);
        if (response.success) {
          setCouples(couples.map(c => 
            c.id === editingCouple.id 
              ? response.data
              : c
          ));
        }
      } else {
        // Ajout
        const response = await apiService.createCouple(backendData);
        if (response.success) {
          setCouples([...couples, response.data]);
        }
      }
      
      setShowModal(false);
      setEditingCouple(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du couple');
    }
  };

  const handleEdit = (couple: Couple) => {
    setEditingCouple(couple);
    
    // Convertir la date ISO en format yyyy-MM-dd pour le champ date
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      name: couple.name || '', // nestNumber from backend
      breed: couple.breed || '', // race from backend
      male: couple.male || '',
      female: couple.female || '',
      formationDate: formatDateForInput(couple.formationDate),
      status: couple.status || 'active',
      observations: couple.observations || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce couple ?')) {
    try {
      const response = await apiService.deleteCouple(id);
      if (response.success) {
          setCouples(couples.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du couple');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      male: '',
      female: '',
      formationDate: new Date().toISOString().split('T')[0],
      status: 'active',
      observations: ''
    });
  };

  const filteredCouples = couples.filter(couple => {
    const matchesSearch = 
      (couple.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (couple.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (couple.male || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (couple.female || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || couple.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'reproduction': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
        {/* En-tête */}
      <div className="flex justify-between items-center">
            <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Couples</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos couples de pigeons</p>
            </div>
            <button
          onClick={() => {
            setEditingCouple(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau couple
            </button>
        </div>



      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Couple
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Race
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mâle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Femelle
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date formation
                </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCouples.map((couple) => (
                    <tr key={couple.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {couple.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {couple.breed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {couple.male}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {couple.female}
                    </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(couple.formationDate).toLocaleDateString('fr-FR')}
                    </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(couple.status)}`}>
                      {couple.status === 'active' ? 'Actif' : 
                       couple.status === 'reproduction' ? 'Reproduction' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                          <button
                        onClick={() => handleEdit(couple)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                          >
                        <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(couple.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun couple trouvé
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCouple ? 'Modifier le couple' : 'Nouveau couple'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID/numéro de cage *
                    </label>
                    <input
                      type="text"
                      required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: CO0, A82"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Race *
                    </label>
                  <input
                    type="text"
                      required
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Racing Homer"
                  />
                </div>
                  </div>
                  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID mâle *
                    </label>
                    <input
                    type="text"
                    required
                    value={formData.male}
                    onChange={(e) => setFormData({...formData, male: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: M002"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID femelle *
                    </label>
                    <input
                      type="text"
                    required
                    value={formData.female}
                    onChange={(e) => setFormData({...formData, female: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: F003"
                  />
                </div>
                  </div>
                  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de formation *
                    </label>
                    <input
                    type="date"
                    required
                    value={formData.formationDate}
                    onChange={(e) => setFormData({...formData, formationDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Actif</option>
                    <option value="reproduction">En reproduction</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observations
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Observations sur le couple..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCouple(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                  {editingCouple ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouplesManagement;