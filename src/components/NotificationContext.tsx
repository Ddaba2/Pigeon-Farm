import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getNotifications();
      
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn('Données de notifications invalides:', data);
        setNotifications([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError(err.message || 'Erreur lors du chargement des notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err: any) {
      console.error('Erreur lors du marquage comme lu:', err);
      setError(err.message || 'Erreur lors du marquage comme lu');
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
    
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 