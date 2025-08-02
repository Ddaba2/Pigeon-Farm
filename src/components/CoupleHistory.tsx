import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { History, Calendar, User, Activity } from 'lucide-react';

interface AuditLog {
  id: number;
  entity: string;
  entity_id: number;
  action: string;
  old_values: any;
  new_values: any;
  user_id: number;
  created_at: string;
  user?: {
    username: string;
  };
}

interface CoupleHistoryProps {
  coupleId: number;
}

function CoupleHistory({ coupleId }: CoupleHistoryProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [coupleId]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getAuditLogs({
        entity: 'couples',
        entityId: coupleId
      });
      
      if (Array.isArray(data)) {
        setAuditLogs(data);
      } else {
        console.warn('Données d\'audit invalides:', data);
        setAuditLogs([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setError(err.message || 'Erreur lors du chargement de l\'historique');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action: string) => {
    switch (action) {
      case 'create':
        return 'Création';
      case 'update':
        return 'Modification';
      case 'delete':
        return 'Suppression';
      default:
        return action;
    }
  };

  const formatValues = (values: any) => {
    if (!values) return 'Aucune donnée';
    
    try {
      if (typeof values === 'string') {
        const parsed = JSON.parse(values);
        return Object.entries(parsed)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
      return Object.entries(values)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return 'Données non formatées';
    }
  };

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

      {auditLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun historique disponible pour ce couple</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    log.action === 'create' ? 'bg-green-500' :
                    log.action === 'update' ? 'bg-blue-500' :
                    log.action === 'delete' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <span className="font-medium text-gray-900">
                    {formatAction(log.action)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(log.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                {log.user && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Par {log.user.username}</span>
                  </div>
                )}
                
                {log.old_values && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Anciennes valeurs:</span>
                    <p className="text-gray-600 mt-1">{formatValues(log.old_values)}</p>
                  </div>
                )}
                
                {log.new_values && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Nouvelles valeurs:</span>
                    <p className="text-gray-600 mt-1">{formatValues(log.new_values)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoupleHistory; 