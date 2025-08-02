import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🧪 Test Application PigeonFarm
        </h1>
        <p className="text-gray-600 mb-4">
          Si vous voyez cette page, l'application React fonctionne correctement.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ React fonctionne</p>
          <p>✅ TypeScript fonctionne</p>
          <p>✅ Tailwind CSS fonctionne</p>
          <p>✅ Composants se chargent</p>
        </div>
        <button 
          onClick={() => alert('Test réussi !')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tester l'interactivité
        </button>
      </div>
    </div>
  );
};

export default TestApp; 