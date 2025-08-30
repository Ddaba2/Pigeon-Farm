import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Activity, Calendar, Heart, Search, Filter, Users, Feather } from 'lucide-react';

interface Pigeonneau {
  id: number;
  coupleId: number;
  coupleInfo: string;
  birthDate: string;
  age: number;
  status: 'newborn' | 'growing' | 'weaned' | 'ready' | 'sold' | 'deceased';
  weight: number;
  color: string;
  sex: 'male' | 'female' | 'unknown';
  notes: string;
  location: string;
}

const PigeonnalManagement: React.FC = () => {
  const [pigeonneaux, setPigeonneaux] = useState<Pigeonneau[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPigeonneau, setEditingPigeonneau] = useState<Pigeonneau | null>(null);

  useEffect(() => {
    fetchPigeonneaux();
  }, []);

  const fetchPigeonneaux = async () => {
    try {
      setIsLoading(true);
      // Simulation des données - à remplacer par l'appel API réel
      const mockPigeonneaux: Pigeonneau[] = [
        {
          id: 1,
          coupleId: 1,
          coupleInfo: 'M001 + F001',
          birthDate: '2024-01-15',
          age: 5,
          status: 'growing',
          weight: 85,
          color: 'Gris',
          sex: 'male',
          notes: 'Développement normal',
          location: 'Nid A1'
        },
        {
          id: 2,
          coupleId: 2,
          coupleInfo: 'M002 + F002',
          birthDate: '2024-01-10',
          age: 10,
          status: 'weaned',
          weight: 120,
          color: 'Blanc',
          sex: 'female',
          notes: 'Sevré avec succès',
          location: 'Volière 1'
        },
        {
          id: 3,
          coupleId: 3,
          coupleInfo: 'M003 + F003',
          birthDate: '2024-01-05',
          age: 15,
          status: 'ready',
          weight: 150,
          color: 'Brun',
          sex: 'male',
          notes: 'Prêt pour la vente',
          location: 'Volière 2'
        },
        {
          id: 4,
          coupleId: 1,
          coupleInfo: 'M001 + F001',
          birthDate: '2024-01-12',
          age: 8,
          status: 'newborn',
          weight: 45,
          color: 'Gris',
          sex: 'unknown',
          notes: 'Né hier',
          location: 'Nid A1'
        }
      ];
      
      setPigeonneaux(mockPigeonneaux);
    } catch (error) {
      console.error('Erreur lors du chargement des pigeonneaux:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'newborn': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'growing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'weaned': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'ready': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'sold': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'deceased': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'newborn': return 'Nouveau-né';
      case 'growing': return 'En croissance';
      case 'weaned': return 'Sevré';
      case 'ready': return 'Prêt';
      case 'sold': return 'Vendu';
      case 'deceased': return 'Décédé';
      default: return 'Inconnu';
    }
  };

  const getSexColor = (sex: string) => {
    switch (sex) {
      case 'male': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'female': return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      case 'unknown': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getSexLabel = (sex: string) => {
    switch (sex) {
      case 'male': return 'Mâle';
      case 'female': return 'Femelle';
      case 'unknown': return 'Inconnu';
      default: return 'Inconnu';
    }
  };

  const filteredPigeonneaux = pigeonneaux.filter(pigeonneau => {
    const matchesSearch = 
      pigeonneau.coupleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pigeonneau.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pigeonneau.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pigeonneau.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pigeonneau.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddPigeonneau = () => {
    setShowAddModal(true);
    setEditingPigeonneau(null);
  };

  const handleEditPigeonneau = (pigeonneau: Pigeonneau) => {
    setEditingPigeonneau(pigeonneau);
    setShowAddModal(true);
  };

  const handleDeletePigeonneau = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pigeonneau ?')) {
      try {
        // Appel API pour supprimer
        setPigeonneaux(pigeonneaux.filter(p => p.id !== id));
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
              Gestion des Pigeonneaux
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Suivez le développement de vos jeunes pigeons
            </p>
          </div>
          <button
            onClick={handleAddPigeonneau}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Pigeonneau</span>
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
                placeholder="Rechercher par couple, localisation, couleur ou notes..."
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
              <option value="newborn">Nouveau-né</option>
              <option value="growing">En croissance</option>
              <option value="weaned">Sevré</option>
              <option value="ready">Prêt</option>
              <option value="sold">Vendu</option>
              <option value="deceased">Décédé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des pigeonneaux */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pigeonneau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Couple
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Âge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Caractéristiques
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
              {filteredPigeonneaux.map((pigeonneau) => (
                <tr key={pigeonneau.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ID: {pigeonneau.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(pigeonneau.birthDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {pigeonneau.coupleInfo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{pigeonneau.age} jours</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pigeonneau.status)}`}>
                      {getStatusLabel(pigeonneau.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSexColor(pigeonneau.sex)}`}>
                          {getSexLabel(pigeonneau.sex)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">•</span>
                        <span>{pigeonneau.color}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {pigeonneau.weight}g
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {pigeonneau.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPigeonneau(pigeonneau)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePigeonneau(pigeonneau.id)}
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
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun pigeonneau trouvé</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche.' 
                : 'Commencez par enregistrer votre premier pigeonneau.'}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nouveau-nés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pigeonneaux.filter(p => p.status === 'newborn').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Croissance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pigeonneaux.filter(p => p.status === 'growing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <Feather className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sevrés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pigeonneaux.filter(p => p.status === 'weaned').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prêts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pigeonneaux.filter(p => p.status === 'ready').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations sur le développement */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
          🌱 Développement des pigeonneaux
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800 dark:text-green-200">
          <div>
            <p><strong>0-7 jours :</strong> Nourrissage par les parents</p>
            <p><strong>8-14 jours :</strong> Développement des plumes</p>
            <p><strong>15-21 jours :</strong> Sevrage progressif</p>
          </div>
          <div>
            <p><strong>22-28 jours :</strong> Premiers vols</p>
            <p><strong>29-35 jours :</strong> Indépendance complète</p>
            <p><strong>36+ jours :</strong> Prêt pour la vente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PigeonnalManagement;