import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { ActionLog } from '../types/types';

function AuditLogs() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch('/auditLogs')
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Historique d'audit</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.timestamp} | {log.entity} #{log.entityId} | {log.action} | {log.username || log.userId}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AuditLogs; 