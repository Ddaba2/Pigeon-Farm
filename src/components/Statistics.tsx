import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Calendar, Plus, Edit, Trash2, DollarSign, Download } from 'lucide-react';
import apiService from '../utils/api';
import pdfExporter from '../utils/pdfExport';

interface Sale {
  id: number;
  targetType: 'couple' | 'pigeonneau' | 'oeuf' | 'male' | 'female';
  targetId: string;
  targetName: string;
  buyerName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: 'virement' | 'espece' | 'cheque' | 'mobile_money';
  date: string;
  observations?: string;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState({
    couples: {
      total: 0,
      active: 0,
      reproduction: 0,
      inactive: 0
    },
    eggs: {
      total: 0,
      incubation: 0,
      hatched: 0,
      failed: 0
    },
    pigeonneaux: {
      total: 0,
      active: 0,
      sold: 0,
      deceased: 0
    },
    health: {
      total: 0,
      vaccinations: 0,
      treatments: 0,
      exams: 0
    },
    sales: {
      total: 0,
      totalRevenue: 0
    }
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    targetType: 'pigeonneau' as const,
    targetId: '',
    buyerName: '',
    quantity: '',
    unitPrice: '',
    paymentMethod: 'espece' as const,
    date: new Date().toISOString().split('T')[0],
    observations: ''
  });

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await apiService.get('/statistics/detailed');
        if (response.success && response.data) {
          setStats({
            couples: {
              total: response.data.couples?.total || 0,
              active: response.data.couples?.active || 0,
              reproduction: response.data.couples?.reproduction || 0,
              inactive: response.data.couples?.inactive || 0
            },
            eggs: {
              total: response.data.eggs?.total || 0,
              incubation: 0, // À calculer selon la logique métier
              hatched: response.data.eggs?.success1_count || 0,
              failed: response.data.eggs?.failed_count || 0
            },
            pigeonneaux: {
              total: response.data.pigeonneaux?.total || 0,
              active: response.data.pigeonneaux?.active || 0,
              sold: response.data.pigeonneaux?.sold || 0,
              deceased: response.data.pigeonneaux?.deceased || 0
            },
            health: {
              total: response.data.health?.total || 0,
              vaccinations: response.data.health?.vaccinations || 0,
              treatments: response.data.health?.treatments || 0,
              exams: response.data.health?.exams || 0
            },
            sales: {
              total: response.data.sales?.total || 0,
              totalRevenue: response.data.sales?.totalRevenue || 0
            }
          });
        }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    const loadSales = async () => {
      try {
        const response = await apiService.get('/sales');
        if (response.success && response.data) {
          setSales(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des ventes:', error);
      }
    };

    loadStatistics();
    loadSales();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation côté frontend
      if (!formData.targetId || formData.targetId.trim() === '') {
        alert('Veuillez entrer un ID de cible valide');
        return;
      }

      if (!formData.buyerName || formData.buyerName.trim() === '') {
        alert('Veuillez entrer le nom de l\'acheteur');
        return;
      }

      if (!formData.quantity || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) <= 0) {
        alert('Veuillez entrer une quantité valide');
        return;
      }

      if (!formData.unitPrice || isNaN(parseFloat(formData.unitPrice)) || parseFloat(formData.unitPrice) <= 0) {
        alert('Veuillez entrer un prix unitaire valide');
        return;
      }

             if (!formData.date) {
         alert('Veuillez entrer une date');
         return;
       }

       if (!formData.paymentMethod) {
         alert('Veuillez sélectionner un mode de paiement');
         return;
       }

       // Calculer le montant total
       const totalAmount = parseInt(formData.quantity) * parseFloat(formData.unitPrice);

       // Transformer les données pour le backend
       const backendData = {
         targetType: formData.targetType,
         targetId: formData.targetId.trim(),
         buyerName: formData.buyerName.trim(),
         quantity: parseInt(formData.quantity),
         unitPrice: parseFloat(formData.unitPrice),
         totalAmount: totalAmount,
         paymentMethod: formData.paymentMethod,
         date: formData.date,
         observations: formData.observations
       };

      if (editingSale) {
        // Modification
        const response = await apiService.put(`/sales/${editingSale.id}`, backendData);
        if (response.success) {
          setSales(sales.map(s => 
            s.id === editingSale.id 
              ? response.data
              : s
          ));
        }
      } else {
        // Ajout
        const response = await apiService.post('/sales', backendData);
        if (response.success) {
          setSales([...sales, response.data]);
        }
      }
      
      setShowModal(false);
      setEditingSale(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la vente');
    }
  };

     const handleEdit = (sale: Sale) => {
     setEditingSale(sale);
     setFormData({
       targetType: sale.targetType,
       targetId: sale.targetId || '',
       buyerName: sale.buyerName || '',
       quantity: sale.quantity.toString(),
       unitPrice: sale.unitPrice.toString(),
       paymentMethod: sale.paymentMethod || 'espece',
       date: formatDateForInput(sale.date),
       observations: sale.observations || ''
     });
     setShowModal(true);
   };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      try {
        const response = await apiService.delete(`/sales/${id}`);
        if (response.success) {
          setSales(sales.filter(s => s.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la vente');
      }
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    return new Date(dateString).toISOString().split('T')[0];
  };

     const resetForm = () => {
     setFormData({
       targetType: 'pigeonneau',
       targetId: '',
       buyerName: '',
       quantity: '',
       unitPrice: '',
       paymentMethod: 'espece',
       date: new Date().toISOString().split('T')[0],
       observations: ''
     });
   };

  const handleExportPDF = async () => {
    await pdfExporter.exportStatistics(stats, sales);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistiques</h1>
        <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de votre élevage</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="h-5 w-5" />
          Exporter PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Couples</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.couples.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Œufs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.eggs.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pigeonneaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pigeonneaux.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Soins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.health.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sales.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Répartition des Couples</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Actifs</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.couples.active}</span>
                  </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">En reproduction</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.couples.reproduction}</span>
                </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Inactifs</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.couples.inactive}</span>
          </div>
        </div>
      </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut des Œufs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">En incubation</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.eggs.incubation}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Éclos</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.eggs.hatched}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Échoués</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.eggs.failed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Ventes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestion des Ventes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total des ventes: {stats.sales.totalRevenue.toLocaleString('fr-FR')} XOF</p>
          </div>
          <button
            onClick={() => {
              setEditingSale(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouvelle vente
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cible</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acheteur</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mode de paiement</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix unitaire</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {sale.targetType === 'couple' ? 'Couple' : 
                         sale.targetType === 'pigeonneau' ? 'Pigeonneau' :
                         sale.targetType === 'oeuf' ? 'Œuf' :
                         sale.targetType === 'male' ? 'Mâle' : 'Femelle'}
                      </span>
                      {sale.targetName || sale.targetId}
                    </div>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900 dark:text-white">
                       {sale.buyerName}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900 dark:text-white">
                       <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                         {sale.paymentMethod === 'virement' ? 'Virement' :
                          sale.paymentMethod === 'espece' ? 'Espèce' :
                          sale.paymentMethod === 'cheque' ? 'Chèque' : 'Mobile Money'}
                       </span>
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900 dark:text-white">
                       {sale.quantity}
                     </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {sale.unitPrice.toLocaleString('fr-FR')} XOF
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {sale.totalAmount.toLocaleString('fr-FR')} XOF
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
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
        
        {sales.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune vente enregistrée
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification de vente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingSale ? 'Modifier la vente' : 'Nouvelle vente'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de cible *
                  </label>
                  <select
                    required
                    value={formData.targetType}
                    onChange={(e) => setFormData({...formData, targetType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="couple">Couple</option>
                    <option value="pigeonneau">Pigeonneau</option>
                    <option value="oeuf">Œuf</option>
                    <option value="male">Mâle</option>
                    <option value="female">Femelle</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID/numéro de la cible *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.targetId}
                    onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: CO0, A82, M002"
                  />
                </div>
              </div>
              
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Nom de l'acheteur *
                   </label>
                   <input
                     type="text"
                     required
                     value={formData.buyerName}
                     onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                     placeholder="Ex: Moussa Diarra"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Mode de paiement *
                   </label>
                   <select
                     required
                     value={formData.paymentMethod}
                     onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                   >
                     <option value="espece">Espèce</option>
                     <option value="virement">Virement</option>
                     <option value="cheque">Chèque</option>
                     <option value="mobile_money">Mobile Money</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Date de vente *
                   </label>
                   <input
                     type="date"
                     required
                     value={formData.date}
                     onChange={(e) => setFormData({...formData, date: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                   />
                 </div>
               </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 1"
                    min="1"
                    step="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix unitaire (XOF) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 50000"
                    min="0"
                    step="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant total (XOF)
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-medium">
                    {(() => {
                      const quantity = parseInt(formData.quantity) || 0;
                      const unitPrice = parseFloat(formData.unitPrice) || 0;
                      const total = quantity * unitPrice;
                      return total.toLocaleString('fr-FR');
                    })()} XOF
                  </div>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Observations sur la vente..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSale(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  {editingSale ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics; 