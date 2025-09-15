import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle, Zap, Heart } from 'lucide-react';
import { 
  getNotifications, 
  getNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications
} from '../utils/api';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'update' | 'health';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationsProps {
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Icônes par type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'update':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'health':
        return <Heart className="h-5 w-5 text-pink-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Couleurs par type de notification
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'update':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'health':
        return 'border-pink-200 bg-pink-50 dark:bg-pink-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsResponse, countResponse] = await Promise.all([
        getNotifications(),
        getNotificationCount()
      ]);

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data);
      }

      if (countResponse.success) {
        setUnreadCount(countResponse.data.count);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des notifications:', error);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error: any) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  // Supprimer une notification
  const deleteNotificationById = async (notificationId: number) => {
    try {
      const response = await deleteNotification(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
        setUnreadCount(prev => {
          const deletedNotification = notifications.find(n => n.id === notificationId);
          return deletedNotification && !deletedNotification.is_read ? prev - 1 : prev;
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  // Supprimer toutes les notifications lues
  const deleteAllReadNotifications = async () => {
    try {
      const response = await deleteReadNotifications();
      
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notif => !notif.is_read)
        );
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression des notifications lues:', error);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    loadNotifications();
  }, []);

  // Fermer le modal en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              {notifications.filter(n => n.is_read).length > 0 && (
                <button
                  onClick={deleteAllReadNotifications}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Supprimer les lues</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadNotifications}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucune notification</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    notification.is_read 
                      ? 'opacity-75' 
                      : 'border-l-4 border-l-blue-500'
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          notification.is_read 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      
                      <p className={`mt-1 text-sm ${
                        notification.is_read 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotificationById(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
