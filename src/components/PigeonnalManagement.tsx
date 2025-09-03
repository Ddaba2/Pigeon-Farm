import React, { useState, useEffect } from 'react';
import { Activity, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import apiService from '../utils/api';

interface Pigeonneau {
  id: number;
  coupleId: number;
  coupleName?: string;
  birthDate: string;
  sex: 'male' | 'female' | 'unknown';
  weight: number;
  status: 'active' | 'sold' | 'deceased';
  salePrice?: number;
  observations?: string;
}

const PigeonnalManagement: React.FC = () => {
  const [pigeonneaux, setPigeonneaux] = useState<Pigeonneau[]>([]);

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadPigeonneaux = async () => {
      try {
        const response = await apiService.getPigeonneaux();
        if (response.success && response.data) {
          setPigeonneaux(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des pigeonneaux:', error);
      }
    };

    loadPigeonneaux();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingPigeonneau, setEditingPigeonneau] = useState<Pigeonneau | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    coupleId: '',
    birthDate: new Date().toISOString().split('T')[0],
    sex: 'unknown' as const,
    weight: '',
    status: 'active' as const,
    salePrice: '',
    observations: ''
  });

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation côté frontend
      if (!formData.coupleId || formData.coupleId.trim() === '') {
        alert('Veuillez entrer un ID/numéro de cage valide');
        return;
      }

      if (!formData.birthDate) {
        alert('Veuillez entrer une date de naissance');
        return;
      }

      // Le poids est optionnel, mais s'il est fourni, il doit être valide
      if (formData.weight && isNaN(parseFloat(formData.weight))) {
        alert('Veuillez entrer un poids valide');
        return;
      }

      // Transformer les données pour le backend
      const backendData = {
        coupleId: formData.coupleId.trim(),
        eggRecordId: null, // Pour l'instant, on peut laisser null
        birthDate: formData.birthDate,
        sex: formData.sex,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weaningDate: null, // Optionnel
        status: formData.status,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        saleDate: null, // Optionnel
        buyer: null, // Optionnel
        observations: formData.observations
      };

      console.log('🔍 Frontend - Données envoyées:', JSON.stringify(backendData, null, 2));

      if (editingPigeonneau) {
        // Modification
        const response = await apiService.updatePigeonneau(editingPigeonneau.id, backendData);
        if (response.success) {
          setPigeonneaux(pigeonneaux.map(p => 
            p.id === editingPigeonneau.id 
              ? response.data
              : p
          ));
        }
      } else {
        // Ajout
        const response = await apiService.createPigeonneau(backendData);
        if (response.success) {
          setPigeonneaux([...pigeonneaux, response.data]);
        }
      }
      
      setShowModal(false);
      setEditingPigeonneau(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du pigeonneau');
    }
  };

  const handleEdit = (pigeonneau: Pigeonneau) => {
    setEditingPigeonneau(pigeonneau);
    setFormData({
      coupleId: pigeonneau.coupleId.toString(),
      birthDate: pigeonneau.birthDate,
      sex: pigeonneau.sex,
      weight: pigeonneau.weight.toString(),
      status: pigeonneau.status,
      salePrice: pigeonneau.salePrice?.toString() || '',
      observations: pigeonneau.observations || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pigeonneau ?')) {
      try {
        const response = await apiService.deletePigeonneau(id);
        if (response.success) {
          setPigeonneaux(pigeonneaux.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du pigeonneau');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      coupleId: '',
      birthDate: new Date().toISOString().split('T')[0],
      sex: 'unknown',
      weight: '',
      status: 'active',
      salePrice: '',
      observations: ''
    });
  };

  const filteredPigeonneaux = pigeonneaux.filter(pigeonneau => {
    const matchesSearch = (pigeonneau.coupleName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pigeonneau.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'deceased': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Pigeonneaux</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos pigeonneaux et leurs ventes</p>
        </div>
        <button
          onClick={() => {
            setEditingPigeonneau(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau pigeonneau
        </button>
      </div>



      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Couple</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date naissance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sexe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Poids</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPigeonneaux.map((pigeonneau) => (
                <tr key={pigeonneau.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{pigeonneau.coupleName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(pigeonneau.birthDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {pigeonneau.sex === 'male' ? 'Mâle' : pigeonneau.sex === 'female' ? 'Femelle' : 'Inconnu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{pigeonneau.weight}g</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pigeonneau.status)}`}>
                      {pigeonneau.status === 'active' ? 'Actif' : pigeonneau.status === 'sold' ? 'Vendu' : 'Décédé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pigeonneau)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pigeonneau.id)}
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
        
        {filteredPigeonneaux.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun pigeonneau trouvé
        </div>
      )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingPigeonneau ? 'Modifier le pigeonneau' : 'Nouveau pigeonneau'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID/numéro de cage *</label>
                  <input
                    type="text"
                    required
                    value={formData.coupleId}
                    onChange={(e) => setFormData({...formData, coupleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: CO0, A82"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de naissance *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexe *</label>
                  <select
                    required
                    value={formData.sex}
                    onChange={(e) => setFormData({...formData, sex: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="unknown">Inconnu</option>
                    <option value="male">Mâle</option>
                    <option value="female">Femelle</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poids (g)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Actif</option>
                    <option value="sold">Vendu</option>
                    <option value="deceased">Décédé</option>
                  </select>
              </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix de vente (FCFA)</label>
                    <input
                      type="number"
                      value={formData.salePrice || ''}
                      onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  </div>
                  
                  <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observations</label>
                <textarea
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPigeonneau(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {editingPigeonneau ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PigeonnalManagement;