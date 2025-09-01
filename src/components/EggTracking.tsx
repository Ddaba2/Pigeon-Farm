import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import apiService from '../utils/api';

interface Egg {
  id: number;
  coupleId: number;
  coupleName: string;
  egg1Date: string;
  egg2Date?: string;
  hatchDate1?: string;
  hatchDate2?: string;
  success1: boolean;
  success2?: boolean;
  observations?: string;
  status: 'incubation' | 'hatched' | 'failed';
}

const EggTracking: React.FC = () => {
  const [eggs, setEggs] = useState<Egg[]>([]);

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadEggs = async () => {
      try {
        const response = await apiService.getEggs();
        if (response.success && response.data) {
          setEggs(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des œufs:', error);
      }
    };

    loadEggs();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingEgg, setEditingEgg] = useState<Egg | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    coupleId: '',
    coupleName: '',
    egg1Date: new Date().toISOString().split('T')[0],
    egg2Date: '',
    hatchDate1: '',
    hatchDate2: '',
    success1: false,
    success2: false,
    observations: '',
    status: 'incubation' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
      if (editingEgg) {
      // Modification
      setEggs(eggs.map(e => 
        e.id === editingEgg.id 
          ? { 
              ...formData, 
              id: e.id,
              coupleId: parseInt(formData.coupleId),
              success1: formData.success1,
              success2: formData.success2
            }
          : e
      ));
      } else {
      // Ajout
      const newEgg: Egg = {
        ...formData,
        id: Math.max(...eggs.map(e => e.id)) + 1,
        coupleId: parseInt(formData.coupleId),
        success1: formData.success1,
        success2: formData.success2
      };
      setEggs([...eggs, newEgg]);
    }
    
    setShowModal(false);
    setEditingEgg(null);
    resetForm();
  };

  const handleEdit = (egg: Egg) => {
      setEditingEgg(egg);
      setFormData({
      coupleId: egg.coupleId.toString(),
      coupleName: egg.coupleName,
        egg1Date: egg.egg1Date,
        egg2Date: egg.egg2Date || '',
        hatchDate1: egg.hatchDate1 || '',
        hatchDate2: egg.hatchDate2 || '',
        success1: egg.success1,
      success2: egg.success2 || false,
      observations: egg.observations || '',
      status: egg.status
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement d\'œufs ?')) {
      setEggs(eggs.filter(e => e.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      coupleId: '',
      coupleName: '',
      egg1Date: new Date().toISOString().split('T')[0],
      egg2Date: '',
      hatchDate1: '',
      hatchDate2: '',
      success1: false,
      success2: false,
      observations: '',
      status: 'incubation'
    });
  };

  const filteredEggs = eggs.filter(egg => {
    const matchesSearch = 
      egg.coupleName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || egg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incubation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'hatched': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const calculateIncubationDays = (eggDate: string) => {
    const eggDateObj = new Date(eggDate);
    const today = new Date();
    const diffTime = today.getTime() - eggDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

    return (
    <div className="space-y-6">
        {/* En-tête */}
      <div className="flex justify-between items-center">
            <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suivi des Œufs</h1>
          <p className="text-gray-600 dark:text-gray-400">Suivez la ponte et l'éclosion de vos œufs</p>
            </div>
            <button
          onClick={() => {
            setEditingEgg(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouvel enregistrement
            </button>
        </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Recherche
            </label>
              <input
                type="text"
              placeholder="Rechercher un couple..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="incubation">En incubation</option>
              <option value="hatched">Éclos</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
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
                  Date ponte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Éclosion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Succès
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
              {filteredEggs.map((egg) => (
                    <tr key={egg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {egg.coupleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>Œuf 1: {new Date(egg.egg1Date).toLocaleDateString('fr-FR')}</div>
                      {egg.egg2Date && (
                        <div>Œuf 2: {new Date(egg.egg2Date).toLocaleDateString('fr-FR')}</div>
                      )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {egg.hatchDate1 ? (
                        <div>Œuf 1: {new Date(egg.hatchDate1).toLocaleDateString('fr-FR')}</div>
                      ) : (
                        <div className="text-gray-500">J+{calculateIncubationDays(egg.egg1Date)}</div>
                      )}
                      {egg.hatchDate2 && (
                        <div>Œuf 2: {new Date(egg.hatchDate2).toLocaleDateString('fr-FR')}</div>
                      )}
                    </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        egg.success1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        Œuf 1: {egg.success1 ? 'Réussi' : 'Échoué'}
                      </div>
                      {egg.success2 !== undefined && (
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-1 ${
                          egg.success2 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          Œuf 2: {egg.success2 ? 'Réussi' : 'Échoué'}
                        </div>
                      )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(egg.status)}`}>
                      {egg.status === 'incubation' ? 'En incubation' : 
                       egg.status === 'hatched' ? 'Éclos' : 'Échoué'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                          <button
                        onClick={() => handleEdit(egg)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                          >
                        <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(egg.id)}
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

        {filteredEggs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun enregistrement d'œufs trouvé
              </div>
        )}
          </div>
          
      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingEgg ? 'Modifier l\'enregistrement' : 'Nouvel enregistrement d\'œufs'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID du couple *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.coupleId}
                    onChange={(e) => setFormData({...formData, coupleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du couple *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.coupleName}
                    onChange={(e) => setFormData({...formData, coupleName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Couple Alpha"
                  />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date ponte œuf 1 *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.egg1Date}
                      onChange={(e) => setFormData({...formData, egg1Date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date ponte œuf 2
                    </label>
                    <input
                      type="date"
                      value={formData.egg2Date}
                      onChange={(e) => setFormData({...formData, egg2Date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date éclosion œuf 1
                    </label>
                    <input
                      type="date"
                      value={formData.hatchDate1}
                      onChange={(e) => setFormData({...formData, hatchDate1: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date éclosion œuf 2
                    </label>
                    <input
                      type="date"
                      value={formData.hatchDate2}
                      onChange={(e) => setFormData({...formData, hatchDate2: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.success1}
                      onChange={(e) => setFormData({...formData, success1: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Succès œuf 1
                    </span>
                    </label>
                  </div>
                  
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.success2}
                      onChange={(e) => setFormData({...formData, success2: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Succès œuf 2
                    </span>
                    </label>
                  </div>
                </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="incubation">En incubation</option>
                  <option value="hatched">Éclos</option>
                  <option value="failed">Échoué</option>
                </select>
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observations
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Observations sur les œufs..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEgg(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                  {editingEgg ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EggTracking;