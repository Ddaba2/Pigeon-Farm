import React, { useState } from 'react';
import { User } from '../types/types';
import apiService from '../utils/api';
import ForgotPassword from './ForgotPassword';

interface LoginProps {
  onAuthSuccess: (user: User, msg?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validations côté client
      if (!formData.username.trim()) {
        throw new Error('Le nom d\'utilisateur est requis');
      }

      if (!formData.password.trim()) {
        throw new Error('Le mot de passe est requis');
      }

      if (formData.username.length < 3) {
        throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      }

      if (formData.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      if (isLogin) {
        const response = await apiService.login({
          username: formData.username,
          password: formData.password
        });

        if (response.success && response.user) {
          onAuthSuccess(response.user, 'Connexion réussie !');
        }
      } else {
        // Validations supplémentaires pour l'inscription
        if (!formData.email.trim()) {
          throw new Error('L\'adresse email est requise');
        }

        if (!formData.email.includes('@')) {
          throw new Error('Veuillez saisir une adresse email valide');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        if (!formData.acceptTerms) {
          throw new Error('Vous devez accepter les conditions d\'utilisation');
        }

        const response = await apiService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || formData.username,
          acceptTerms: formData.acceptTerms
        });

        if (response.success) {
          onAuthSuccess(response.user, 'Inscription réussie !');
        }
      }
    } catch (error: any) {
      // Messages d'erreur plus spécifiques
      let errorMessage = error.message || 'Une erreur s\'est produite';
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et votre mot de passe.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = 'Utilisateur non trouvé. Vérifiez votre nom d\'utilisateur.';
      } else if (error.message.includes('409') || error.message.includes('Conflict')) {
        errorMessage = 'Ce nom d\'utilisateur ou cette adresse email est déjà utilisé.';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage = 'Erreur du serveur. Veuillez réessayer dans quelques instants.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Afficher le composant de réinitialisation de mot de passe
  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png"
            alt="Logo PigeonFarm"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error.includes('401') || error.includes('Unauthorized') ? 'Identifiants incorrects' :
                     error.includes('404') || error.includes('Not Found') ? 'Utilisateur non trouvé' :
                     error.includes('500') || error.includes('Internal Server Error') ? 'Erreur du serveur' :
                     error.includes('Network') || error.includes('fetch') ? 'Problème de connexion' :
                     'Nom d\'utilisateur ou mot de passe incorrecte'}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {error.includes('401') || error.includes('Unauthorized') ? 
                        'Vérifiez votre nom d\'utilisateur et votre mot de passe.' :
                       error.includes('404') || error.includes('Not Found') ? 
                        'Aucun compte trouvé avec ces identifiants.' :
                       error.includes('500') || error.includes('Internal Server Error') ? 
                        'Le serveur rencontre un problème temporaire. Veuillez réessayer.' :
                       error.includes('Network') || error.includes('fetch') ? 
                        'Vérifiez votre connexion internet et réessayez.' :
                        'Vérifiez votre nom d\'utilisateur et votre mot de passe.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J'accepte les{' '}
                  <a href="/politique-confidentialite" className="text-blue-600 hover:text-blue-500">
                    conditions d'utilisation
                  </a>
                </label>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </div>

          <div className="text-center space-y-2">
            {isLogin && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  fullName: '',
                  acceptTerms: false
                });
              }}
              className="text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
