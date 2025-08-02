import React from 'react';
import { Bird } from 'lucide-react';
import { User } from '../types/types';

interface TestLoginProps {
  onAuthSuccess: (user: User, msg?: string) => void;
}

const TestLogin: React.FC<TestLoginProps> = ({ onAuthSuccess }) => {
  const handleTestLogin = () => {
    const testUser = {
      id: 1,
      username: 'admin',
      role: 'admin',
      email: 'admin@test.com'
    };
    onAuthSuccess(testUser, 'Connexion de test réussie !');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Bird className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PigeonFarm
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestion de Reproduction de Pigeons
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🧪 Mode Test
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Cette version de test contourne l'authentification pour diagnostiquer les problèmes.
            </p>
          </div>

          <button
            onClick={handleTestLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔓 Connexion de Test
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Utilisateur de test : admin</p>
            <p>Rôle : Administrateur</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🔍 Diagnostic
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Test de l'interface utilisateur</li>
            <li>• Test des composants React</li>
            <li>• Test de la navigation</li>
            <li>• Test du mode sombre/clair</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestLogin; 