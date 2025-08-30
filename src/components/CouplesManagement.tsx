import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, Heart, Activity, Search, Filter, FileText } from 'lucide-react';

interface Couple {
  id: number;
  maleId: string;
  femaleId: string;
  formationDate: string;
  status: 'active' | 'inactive' | 'breeding';
  lastBreeding: string;
  totalEggs: number;
  totalPigeonneaux: number;
  notes: string;
}

const CouplesManagement: React.FC = () => {
  const [couples, setCouples] = useState<Couple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCouple, setEditingCouple] = useState<Couple | null>(null);

  useEffect(() => {
    fetchCouples();
  }, []);

  const fetchCouples = async () => {
    try {
      setIsLoading(true);
      // Simulation des données - à remplacer par l'appel API réel
      const mockCouples: Couple[] = [
        {
          id: 1,
          maleId: 'M001',
          femaleId: 'F001',
          formationDate: '2024-01-01',
          status: 'active',
          lastBreeding: '2024-01-10',
          totalEggs: 6,
          totalPigeonneaux: 4,
          notes: 'Couple très productif'
        },
        {
          id: 2,
          maleId: 'M002',
          femaleId: 'F002',
          formationDate: '2024-01-05',
          status: 'breeding',
          lastBreeding: '2024-01-12',
          totalEggs: 4,
          totalPigeonneaux: 2,
          notes: 'En cours de reproduction'
        },
        {
          id: 3,
          maleId: 'M003',
          femaleId: 'F003',
          formationDate: '2023-12-15',
          status: 'inactive',
          lastBreeding: '2023-12-20',
          totalEggs: 8,
          totalPigeonneaux: 6,
          notes: 'Couple retiré'
        }
      ];
      
      setCouples(mockCouples);
    } catch (error) {
      console.error('Erreur lors du chargement des couples:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'breeding': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'breeding': return 'Reproduction';
      case 'inactive': return 'Inactif';
      default: return 'Inconnu';
    }
  };

  const filteredCouples = couples.filter(couple => {
    const matchesSearch = 
      couple.maleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      couple.femaleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      couple.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || couple.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddCouple = () => {
    setShowAddModal(true);
    setEditingCouple(null);
  };

  const handleEditCouple = (couple: Couple) => {
    setEditingCouple(couple);
    setShowAddModal(true);
  };

  const handleDeleteCouple = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce couple ?')) {
      try {
        // Appel API pour supprimer
        setCouples(couples.filter(c => c.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              Gestion des Couples
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Gérez vos couples de pigeons reproducteurs
            </p>
          </div>
          <button
            onClick={handleAddCouple}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Couple</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID ou notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="breeding">Reproduction</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des couples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Couple
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière Reproduction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Production
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
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {couple.maleId} + {couple.femaleId}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {couple.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(couple.formationDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(couple.status)}`}>
                      {getStatusLabel(couple.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {couple.lastBreeding ? new Date(couple.lastBreeding).toLocaleDateString('fr-FR') : 'Aucune'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {couple.totalEggs} œufs
                        </span>
                        <span className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          {couple.totalPigeonneaux} pigeonneaux
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCouple(couple)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCouple(couple.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun couple trouvé</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche.' 
                : 'Commencez par créer votre premier couple.'}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples Actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {couples.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Reproduction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {couples.filter(c => c.status === 'breeding').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pigeonneaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {couples.reduce((sum, c) => sum + c.totalPigeonneaux, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouplesManagement;