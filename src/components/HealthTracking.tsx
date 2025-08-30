import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Heart, Calendar, AlertTriangle, Search, Filter, Activity, Thermometer, Syringe } from 'lucide-react';

interface HealthRecord {
  id: number;
  pigeonId: string;
  pigeonInfo: string;
  recordDate: string;
  type: 'vaccination' | 'treatment' | 'checkup' | 'emergency' | 'prevention';
  status: 'scheduled' | 'completed' | 'cancelled' | 'urgent';
  description: string;
  veterinarian: string;
  cost: number;
  nextVisit: string;
  notes: string;
}

const HealthTracking: React.FC = () => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      setIsLoading(true);
      // Simulation des données - à remplacer par l'appel API réel
      const mockRecords: HealthRecord[] = [
        {
          id: 1,
          pigeonId: 'M001',
          pigeonInfo: 'Mâle Racing Homer',
          recordDate: '2024-01-15',
          type: 'vaccination',
          status: 'completed',
          description: 'Vaccin contre la variole aviaire',
          veterinarian: 'Dr. Martin',
          cost: 2500,
          nextVisit: '2024-07-15',
          notes: 'Réaction normale, aucun effet secondaire'
        },
        {
          id: 2,
          pigeonId: 'F002',
          pigeonInfo: 'Femelle Tumbler',
          recordDate: '2024-01-12',
          type: 'checkup',
          status: 'completed',
          description: 'Examen de routine',
          veterinarian: 'Dr. Martin',
          cost: 1500,
          nextVisit: '2024-04-12',
          notes: 'Santé excellente, poids optimal'
        },
        {
          id: 3,
          pigeonId: 'M003',
          pigeonInfo: 'Mâle Racing Homer',
          recordDate: '2024-01-10',
          type: 'treatment',
          status: 'completed',
          description: 'Traitement contre les parasites',
          veterinarian: 'Dr. Martin',
          cost: 3000,
          nextVisit: '2024-02-10',
          notes: 'Parasites éliminés, surveillance continue'
        },
        {
          id: 4,
          pigeonId: 'F001',
          pigeonInfo: 'Femelle Racing Homer',
          recordDate: '2024-01-20',
          type: 'vaccination',
          status: 'scheduled',
          description: 'Vaccin contre la maladie de Newcastle',
          veterinarian: 'Dr. Martin',
          cost: 2000,
          nextVisit: '2024-01-20',
          notes: 'Programmé pour la semaine prochaine'
        }
      ];
      
      setHealthRecords(mockRecords);
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers de santé:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'treatment': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'checkup': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'emergency': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'prevention': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vaccination': return 'Vaccination';
      case 'treatment': return 'Traitement';
      case 'checkup': return 'Contrôle';
      case 'emergency': return 'Urgence';
      case 'prevention': return 'Prévention';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'urgent': return 'Urgent';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return <Syringe className="h-4 w-4" />;
      case 'treatment': return <Activity className="h-4 w-4" />;
      case 'checkup': return <Heart className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'prevention': return <Thermometer className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = 
      record.pigeonInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddRecord = () => {
    setShowAddModal(true);
    setEditingRecord(null);
  };

  const handleEditRecord = (record: HealthRecord) => {
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleDeleteRecord = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier de santé ?')) {
      try {
        // Appel API pour supprimer
        setHealthRecords(healthRecords.filter(r => r.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getUpcomingVisits = () => {
    const today = new Date();
    return healthRecords
      .filter(record => record.status === 'scheduled' && new Date(record.nextVisit) >= today)
      .sort((a, b) => new Date(a.nextVisit).getTime() - new Date(b.nextVisit).getTime())
      .slice(0, 5);
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
              Suivi de la Santé
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Gérez la santé et les soins de vos pigeons
            </p>
          </div>
          <button
            onClick={handleAddRecord}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Dossier</span>
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
                placeholder="Rechercher par pigeon, description, vétérinaire ou notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="vaccination">Vaccination</option>
              <option value="treatment">Traitement</option>
              <option value="checkup">Contrôle</option>
              <option value="emergency">Urgence</option>
              <option value="prevention">Prévention</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Programmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visites à venir */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Visites à venir
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getUpcomingVisits().map((record) => (
            <div key={record.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {record.pigeonInfo}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                  {getTypeIcon(record.type)}
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                {record.description}
              </p>
              <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                <span>Dr. {record.veterinarian}</span>
                <span>{new Date(record.nextVisit).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          ))}
          {getUpcomingVisits().length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              Aucune visite programmée
            </div>
          )}
        </div>
      </div>

      {/* Liste des dossiers de santé */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pigeon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Coût
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.pigeonInfo}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {record.pigeonId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(record.recordDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                      {getTypeIcon(record.type)}
                      <span className="ml-1">{getTypeLabel(record.type)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate">{record.description}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Dr. {record.veterinarian}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.cost.toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
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
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun dossier de santé trouvé</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.' 
                : 'Commencez par créer votre premier dossier de santé.'}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Syringe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vaccinations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthRecords.filter(r => r.type === 'vaccination').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contrôles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthRecords.filter(r => r.type === 'checkup').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Programmés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthRecords.filter(r => r.status === 'scheduled').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Coût</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthRecords.reduce((sum, r) => sum + r.cost, 0).toLocaleString()} XOF
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils de santé */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
          🏥 Conseils de santé préventive
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800 dark:text-green-200">
          <div>
            <p><strong>Vaccinations :</strong> Annuelles contre la variole et Newcastle</p>
            <p><strong>Contrôles :</strong> Trimestriels pour détecter les problèmes</p>
            <p><strong>Hygiène :</strong> Nettoyage régulier des volières</p>
          </div>
          <div>
            <p><strong>Nutrition :</strong> Alimentation équilibrée et eau propre</p>
            <p><strong>Quarantaine :</strong> Pour les nouveaux pigeons</p>
            <p><strong>Surveillance :</strong> Comportement et appétit quotidiens</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthTracking;