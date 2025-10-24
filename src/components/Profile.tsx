import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Camera, 
  Lock, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Shield,
  Upload,
  X,
  Bell
} from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import { User as UserType } from '../types/types';
import apiService from '../utils/api';

interface ProfileProps {
  user: UserType;
  onUpdate: (user: UserType) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'danger'>('profile');
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    full_name: user.full_name || '',
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    deletePassword: '',
    confirmDelete: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    delete: false
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour les données du formulaire quand l'utilisateur change
  useEffect(() => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      deletePassword: '',
      confirmDelete: ''
    });
    setAvatarPreview(user.avatar_url || null);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Gestion de l'avatar
    if (name === 'avatar_url' && value) {
      setAvatarPreview(value);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide (JPG, PNG, GIF, etc.)');
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximum : 5MB');
        return;
      }

      clearMessages();
      setLoading(true);

      try {
        // Créer un aperçu et sauvegarder automatiquement
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          
          try {
            const response = await apiService.put('/users/profile/me/avatar', {
              avatarUrl: base64String
            });

            if (response.success) {
              const updatedUser = { ...user, ...response.data };
              onUpdate(updatedUser);
              setAvatarPreview(base64String);
              setSuccess('Photo de profil mise à jour avec succès !');
              
              try {
                // Import dynamique pour compatibilité module
                const storageManager = await import('../utils/storageManager');
                storageManager.edgeLocalStorage.setItem('user', JSON.stringify(updatedUser));
              } catch (error) {
                // Silencieux
              }
            }
          } catch (error: any) {
            setError(error.response?.data?.error?.message || 'Erreur lors de la mise à jour de la photo');
          } finally {
            setLoading(false);
          }
        };
        reader.readAsDataURL(file);
        
      } catch (error: any) {
        setError('Erreur lors du traitement de l\'image');
        setLoading(false);
      }
    }
  };


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await apiService.put('/users/profile/me', {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        avatar_url: formData.avatar_url
      });

      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        onUpdate(updatedUser);
        setSuccess('Profil mis à jour avec succès !');
        
        // Sauvegarder en localStorage
              try {
                // Import dynamique pour compatibilité module
                const storageManager = await import('../utils/storageManager');
                storageManager.edgeLocalStorage.setItem('user', JSON.stringify(updatedUser));
              } catch (error) {
                // Silencieux
              }
      }
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validation côté client
    if (!formData.currentPassword) {
      setError('Le mot de passe actuel est requis');
      return;
    }

    if (!formData.newPassword) {
      setError('Le nouveau mot de passe est requis');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.put('/users/profile/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        setSuccess('Mot de passe modifié avec succès !');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };


  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formData.deletePassword) {
      setError('Le mot de passe est requis pour supprimer le compte');
      return;
    }

    if (formData.confirmDelete !== 'SUPPRIMER') {
      setError('Veuillez taper "SUPPRIMER" pour confirmer la suppression');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.delete('/users/profile/me', {
        password: formData.deletePassword,
        confirmDelete: formData.confirmDelete
      });

      if (response.success) {
        // Déconnexion et redirection
        const edgeLocalStorage = (await import('../utils/storageManager')).edgeLocalStorage;
        edgeLocalStorage.removeItem('user');
        edgeLocalStorage.removeItem('sessionId');
        setSuccess('Compte supprimé avec succès. Redirection...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erreur suppression compte:', error);
      setError(error.response?.data?.error?.message || error.message || 'Erreur lors de la suppression du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et paramètres de compte</p>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Profil', icon: User },
            { id: 'security', label: 'Sécurité', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'danger', label: 'Zone de danger', icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Section Avatar */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Photo de profil
            </h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar_file"
                  name="avatar_file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div 
                  className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-colors relative group"
                  onClick={() => fileInputRef.current?.click()}
                  title="Cliquez pour changer votre photo de profil"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarPreview(null)}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Cliquez sur l'image pour changer votre photo
                  </p>
                  <p className="text-xs text-gray-500">
                    Formats acceptés : JPG, PNG, GIF. Taille maximum : 5MB
                  </p>
                  {loading && (
                    <p className="text-sm text-blue-600 mt-2">
                      Sauvegarde en cours...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section Informations personnelles */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Informations personnelles
            </h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
              onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Parlez-nous de vous..."
            />
          </div>

              <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Mise à jour...' : 'Mettre à jour'}</span>
          </button>
              </div>
        </form>
      </div>

          {/* Informations du compte */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Informations du compte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Rôle</span>
                  <p className="text-sm text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Statut</span>
                  <p className="text-sm text-gray-900 capitalize">{user.status}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Membre depuis</span>
                  <p className="text-sm text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Inconnu'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Dernière connexion</span>
                  <p className="text-sm text-gray-900">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
      <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Changer le mot de passe
          </h3>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel *
            </label>
              <div className="relative">
            <input
                  type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
          </div>

          <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe *
            </label>
              <div className="relative">
            <input
                  type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
            </label>
              <div className="relative">
            <input
                  type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>{loading ? 'Changement...' : 'Changer le mot de passe'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <NotificationSettings />
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-l-4 border-red-400 bg-red-50 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Zone de danger</strong> - Ces actions sont irréversibles
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-red-600" />
            Supprimer le compte
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Une fois votre compte supprimé, toutes vos données seront définitivement effacées. 
            Cette action ne peut pas être annulée.
          </p>

          <form onSubmit={handleAccountDeletion} className="space-y-6">
            <div>
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer avec votre mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.delete ? 'text' : 'password'}
                  id="deletePassword"
                  name="deletePassword"
                  value={formData.deletePassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('delete')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.delete ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmDelete" className="block text-sm font-medium text-gray-700 mb-2">
                Tapez "SUPPRIMER" pour confirmer *
              </label>
              <input
                type="text"
                id="confirmDelete"
                name="confirmDelete"
                value={formData.confirmDelete}
                onChange={handleInputChange}
                required
                placeholder="SUPPRIMER"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
                <Trash2 className="h-4 w-4" />
                <span>{loading ? 'Suppression...' : 'Supprimer le compte'}</span>
          </button>
            </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default Profile; 