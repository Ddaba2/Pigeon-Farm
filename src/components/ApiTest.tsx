import React, { useState } from 'react';
import apiService from '../utils/api';

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Connexion de base
      addResult('🧪 Test 1: Test de connexion API...');
      
      // Test 2: Récupération des couples
      addResult('🧪 Test 2: Récupération des couples...');
      const couplesResponse = await apiService.getCouples();
      if (couplesResponse.success) {
        addResult(`✅ Couples récupérés: ${couplesResponse.data?.couples?.length || 0} trouvé(s)`);
      } else {
        addResult(`❌ Erreur couples: ${couplesResponse.message || couplesResponse.error}`);
      }

      // Test 3: Récupération des œufs
      addResult('🧪 Test 3: Récupération des œufs...');
      const eggsResponse = await apiService.getEggs();
      if (eggsResponse.success) {
        addResult(`✅ Œufs récupérés: ${eggsResponse.data?.eggs?.length || 0} trouvé(s)`);
      } else {
        addResult(`❌ Erreur œufs: ${eggsResponse.message || eggsResponse.error}`);
      }

      // Test 4: Récupération des pigeonneaux
      addResult('🧪 Test 4: Récupération des pigeonneaux...');
      const pigeonneauxResponse = await apiService.getPigeonneaux();
      if (pigeonneauxResponse.success) {
        addResult(`✅ Pigeonneaux récupérés: ${pigeonneauxResponse.data?.pigeonneaux?.length || 0} trouvé(s)`);
      } else {
        addResult(`❌ Erreur pigeonneaux: ${pigeonneauxResponse.message || pigeonneauxResponse.error}`);
      }

      // Test 5: Récupération des dossiers de santé
      addResult('🧪 Test 5: Récupération des dossiers de santé...');
      const healthResponse = await apiService.getHealthRecords();
      if (healthResponse.success) {
        addResult(`✅ Dossiers de santé récupérés: ${healthResponse.data?.healthRecords?.length || 0} trouvé(s)`);
      } else {
        addResult(`❌ Erreur santé: ${healthResponse.message || healthResponse.error}`);
      }

      // Test 6: Récupération des statistiques
      addResult('🧪 Test 6: Récupération des statistiques...');
      const statsResponse = await apiService.getDashboardStats();
      if (statsResponse.success) {
        addResult(`✅ Statistiques récupérées: ${Object.keys(statsResponse.data || {}).length} métriques`);
      } else {
        addResult(`❌ Erreur statistiques: ${statsResponse.message || statsResponse.error}`);
      }

      addResult('🎉 Tests terminés !');

    } catch (error) {
      addResult(`💥 Erreur critique: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateCouple = async () => {
    setIsLoading(true);
    addResult('🧪 Test de création d\'un couple...');
    
    try {
      const testCouple = {
        nestNumber: 'TEST-001',
        race: 'Test Race',
        formationDate: new Date().toISOString().split('T')[0],
        maleId: 'TEST-M',
        femaleId: 'TEST-F',
        observations: 'Couple de test créé automatiquement',
        status: 'active'
      };

      const response = await apiService.createCouple(testCouple);
      
      if (response.success) {
        addResult(`✅ Couple créé avec succès! ID: ${response.data?.id}`);
        
        // Test de suppression
        addResult('🧪 Test de suppression du couple de test...');
        const deleteResponse = await apiService.deleteCouple(response.data.id);
        if (deleteResponse.success) {
          addResult('✅ Couple de test supprimé avec succès!');
        } else {
          addResult(`❌ Erreur lors de la suppression: ${deleteResponse.message}`);
        }
      } else {
        addResult(`❌ Erreur lors de la création: ${response.message || response.error}`);
      }
    } catch (error) {
      addResult(`💥 Erreur critique: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🧪 Test de Connexion API et Base de Données
        </h1>
        
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={testApiConnection}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? '⏳ Test en cours...' : '🧪 Tester la Connexion API'}
            </button>
            
            <button
              onClick={testCreateCouple}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? '⏳ Test en cours...' : '➕ Tester Création Couple'}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🗑️ Effacer les Résultats
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📊 Résultats des Tests
          </h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Cliquez sur "Tester la Connexion API" pour commencer les tests...
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono p-2 bg-white dark:bg-gray-600 rounded border">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Informations de Test
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>URL API:</strong> http://localhost:3002/api</p>
            <p><strong>Base de données:</strong> MySQL (pigeon_manager)</p>
            <p><strong>Authentification:</strong> JWT Token</p>
            <p><strong>Statut:</strong> {isLoading ? '⏳ Test en cours...' : '🟢 Prêt pour les tests'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 