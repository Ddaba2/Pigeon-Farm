import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { History, Calendar, User, Activity } from 'lucide-react';

// Audit supprimé

interface CoupleHistoryProps {
  coupleId: number;
}

function CoupleHistory({ coupleId }: CoupleHistoryProps) {
  // Audit supprimé
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [coupleId]);

  // Audit supprimé

  // Fonctions d'audit supprimées

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Historique du Couple {coupleId}</h3>
      </div>

      <div className="text-center py-8 text-gray-500">
        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Historique d'audit supprimé</p>
      </div>
    </div>
  );
}

export default CoupleHistory; 