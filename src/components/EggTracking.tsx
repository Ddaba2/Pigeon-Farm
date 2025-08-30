import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Calendar, Clock, Search, Filter, Eye } from 'lucide-react';

interface Egg {
  id: number;
  coupleId: number;
  coupleInfo: string;
  layingDate: string;
  expectedHatchingDate: string;
  status: 'incubating' | 'hatched' | 'broken' | 'infertile';
  notes: string;
  location: string;
}

const EggTracking: React.FC = () => {
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEgg, setEditingEgg] = useState<Egg | null>(null);

  useEffect(() => {
    fetchEggs();
  }, []);

  const fetchEggs = async () => {
    try {
      setIsLoading(true);
      // Simulation des données - à remplacer par l'appel API réel
      const mockEggs: Egg[] = [
        {
          id: 1,
          coupleId: 1,
          coupleInfo: 'M001 + F001',
          layingDate: '2024-01-10',
          expectedHatchingDate: '2024-01-25',
          status: 'incubating',
          notes: 'Œufs en bon état',
          location: 'Nid A1'
        },
        {
          id: 2,
          coupleId: 2,
          coupleInfo: 'M002 + F002',
          layingDate: '2024-01-12',
          expectedHatchingDate: '2024-01-27',
          status: 'incubating',
          notes: 'Couveuse artificielle',
          location: 'Couveuse 1'
        },
        {
          id: 3,
          coupleId: 3,
          coupleInfo: 'M003 + F003',
          layingDate: '2024-01-08',
          expectedHatchingDate: '2024-01-23',
          status: 'hatched',
          notes: '2 pigeonneaux nés',
          location: 'Nid B2'
        },
        {
          id: 4,
          coupleId: 1,
          coupleInfo: 'M001 + F001',
          layingDate: '2024-01-05',
          expectedHatchingDate: '2024-01-20',
          status: 'broken',
          notes: 'Œuf cassé accidentellement',
          location: 'Nid A1'
        }
      ];
      
      setEggs(mockEggs);
    } catch (error) {
      console.error('Erreur lors du chargement des œufs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incubating': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'hatched': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'broken': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'infertile': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'incubating': return 'En incubation';
      case 'hatched': return 'Éclos';
      case 'broken': return 'Cassé';
      case 'infertile': return 'Infertile';
      default: return 'Inconnu';
    }
  };

  const getDaysUntilHatching = (expectedDate: string) => {
    const today = new Date();
    const hatchingDate = new Date(expectedDate);
    const diffTime = hatchingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredEggs = eggs.filter(egg => {
    const matchesSearch = 
      egg.coupleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      egg.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      egg.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || egg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddEgg = () => {
    setShowAddModal(true);
    setEditingEgg(null);
  };

  const handleEditEgg = (egg: Egg) => {
    setEditingEgg(egg);
    setShowAddModal(true);
  };

  const handleDeleteEgg = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet œuf ?')) {
      try {
        // Appel API pour supprimer
        setEggs(eggs.filter(e => e.id !== id));
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
              Suivi des Œufs
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Gérez et suivez vos œufs en incubation
            </p>
          </div>
          <button
            onClick={handleAddEgg}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvel Œuf</span>
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
                placeholder="Rechercher par couple, localisation ou notes..."
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
              <option value="incubating">En incubation</option>
              <option value="hatched">Éclos</option>
              <option value="broken">Cassé</option>
              <option value="infertile">Infertile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des œufs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Couple
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date Ponte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Éclosion Prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Localisation
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
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {egg.coupleInfo}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {egg.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(egg.layingDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(egg.expectedHatchingDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {egg.status === 'incubating' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getDaysUntilHatching(egg.expectedHatchingDate)} jours restants
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(egg.status)}`}>
                      {getStatusLabel(egg.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {egg.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditEgg(egg)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEgg(egg.id)}
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
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun œuf trouvé</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche.' 
                : 'Commencez par enregistrer votre premier œuf.'}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Incubation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {eggs.filter(e => e.status === 'incubating').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Éclos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {eggs.filter(e => e.status === 'hatched').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cassés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {eggs.filter(e => e.status === 'broken').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {eggs.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations sur l'incubation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Informations sur l'incubation
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p><strong>Durée d'incubation :</strong> 17-19 jours en moyenne</p>
            <p><strong>Température optimale :</strong> 37.5°C - 38.5°C</p>
            <p><strong>Humidité :</strong> 55-65%</p>
          </div>
          <div>
            <p><strong>Retournement :</strong> 3-4 fois par jour</p>
            <p><strong>Vérification :</strong> Miracule à 7-8 jours</p>
            <p><strong>Préparation éclosion :</strong> Augmenter l'humidité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EggTracking;