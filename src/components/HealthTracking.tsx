import React, { useState, useEffect } from 'react';
import { Heart, Plus, Search, Filter, Edit, Trash2, Download } from 'lucide-react';
import apiService from '../utils/api';
import pdfExporter from '../utils/pdfExport';

interface HealthRecord {
  id: number;
  type: string;
  targetType: 'couple' | 'pigeonneau';
  targetId: number;
  targetName: string;
  product: string;
  date: string;
  observations?: string;
}

const HealthTracking: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadHealthRecords = async () => {
      try {
        const response = await apiService.getHealthRecords();
        if (response.success && response.data) {
          setRecords(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des enregistrements de santé:', error);
      }
    };

    loadHealthRecords();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    type: 'vaccination',
    targetType: 'couple' as const,
    targetId: '',
    product: '',
    date: new Date().toISOString().split('T')[0],
    observations: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation côté frontend
      if (!formData.targetId || formData.targetId.trim() === '') {
        alert('Veuillez entrer un ID de cible valide');
        return;
      }

      // Validation spécifique selon le type de cible
      if (formData.targetType === 'pigeonneau' && isNaN(parseInt(formData.targetId))) {
        alert('Veuillez entrer un ID de pigeonneau valide (numérique)');
        return;
      }

      if (!formData.product) {
        alert('Veuillez entrer un produit');
        return;
      }

      if (!formData.date) {
        alert('Veuillez entrer une date');
        return;
      }

      // Transformer les données pour le backend
      const backendData = {
        type: formData.type,
        targetType: formData.targetType,
        targetId: formData.targetType === 'couple' ? formData.targetId.trim() : parseInt(formData.targetId),
        product: formData.product,
        date: formData.date,
        observations: formData.observations
      };

      console.log('🔍 Frontend - Données envoyées:', JSON.stringify(backendData, null, 2));

      if (editingRecord) {
        // Modification
        const response = await apiService.updateHealthRecord(editingRecord.id, backendData);
        if (response.success) {
          setRecords(records.map(r => 
            r.id === editingRecord.id 
              ? response.data
              : r
          ));
        }
      } else {
        // Ajout
        const response = await apiService.createHealthRecord(backendData);
        if (response.success) {
          setRecords([...records, response.data]);
        }
      }
      
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'enregistrement de santé');
    }
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      targetType: record.targetType,
      targetId: record.targetId.toString(),
      product: record.product || '',
      date: formatDateForInput(record.date),
      observations: record.observations || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      try {
        const response = await apiService.deleteHealthRecord(id);
        if (response.success) {
          setRecords(records.filter(r => r.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'enregistrement de santé');
      }
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    // Si c'est déjà au format yyyy-MM-dd, on le retourne tel quel
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Sinon on convertit depuis ISO
    return new Date(dateString).toISOString().split('T')[0];
  };

  const resetForm = () => {
    setFormData({
      type: 'vaccination',
      targetType: 'couple',
      targetId: '',
      product: '',
      date: new Date().toISOString().split('T')[0],
      observations: ''
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.targetName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.product || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'traitement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'examen': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleExportPDF = async () => {
    await pdfExporter.exportHealthRecords(records);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suivi de la Santé</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez les soins de vos pigeons</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="h-5 w-5" />
            Exporter PDF
          </button>
          <button
            onClick={() => {
              setEditingRecord(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouvel enregistrement
          </button>
        </div>
      </div>



      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(record.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                      {record.type === 'vaccination' ? 'Vaccination' : 
                       record.type === 'traitement' ? 'Traitement' : 'Examen'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {record.targetName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {record.product || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun enregistrement trouvé
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingRecord ? 'Modifier l\'enregistrement' : 'Nouvel enregistrement de santé'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="vaccination">Vaccination</option>
                    <option value="traitement">Traitement</option>
                    <option value="examen">Examen</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cible *</label>
                  <select
                    required
                    value={formData.targetType}
                    onChange={(e) => setFormData({...formData, targetType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="couple">Couple</option>
                    <option value="pigeonneau">Pigeonneau</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.targetType === 'couple' ? 'ID/numéro de cage *' : 'ID de la cible *'}
                  </label>
                  <input
                    type={formData.targetType === 'couple' ? 'text' : 'number'}
                    required
                    value={formData.targetId}
                    onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder={formData.targetType === 'couple' ? 'Ex: CO0, A82' : 'Ex: 1'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Produit *</label>
                  <input
                    type="text"
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observations</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {editingRecord ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTracking;