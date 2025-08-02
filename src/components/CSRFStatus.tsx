import React from 'react';
import { Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useCSRF } from '../hooks/useCSRF';

interface CSRFStatusProps {
  className?: string;
}

const CSRFStatus: React.FC<CSRFStatusProps> = ({ className = '' }) => {
  const { token, loading, error, refreshToken } = useCSRF();

  const getStatusIcon = () => {
    if (loading) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (token) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Shield className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (loading) return 'Chargement...';
    if (error) return 'Erreur CSRF';
    if (token) return 'CSRF OK';
    return 'CSRF';
  };

  const getTooltipText = () => {
    if (loading) return 'Récupération du token CSRF...';
    if (error) return `Erreur CSRF: ${error}`;
    if (token) return 'Protection CSRF active';
    return 'Statut CSRF inconnu';
  };

  return (
    <div 
      className={`flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium ${className}`}
      title={getTooltipText()}
    >
      {getStatusIcon()}
      <span className="hidden sm:inline">{getStatusText()}</span>
      
      {error && (
        <button
          onClick={refreshToken}
          className="ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Rafraîchir le token CSRF"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default CSRFStatus; 