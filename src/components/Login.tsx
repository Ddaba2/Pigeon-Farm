import React, { useState } from 'react';
import { User } from '../types/types';
import apiService from '../utils/api';
import ForgotPassword from './ForgotPassword';
import PasswordStrengthMeter from './PasswordStrengthMeter';

// Fonction de validation de la force du mot de passe côté client
const validatePasswordStrength = (password: string) => {
  const errors: string[] = [];
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !isCommonPassword(password)
  };

  if (!requirements.minLength) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!requirements.hasUppercase) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!requirements.hasLowercase) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!requirements.hasNumbers) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!requirements.hasSpecialChar) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  if (!requirements.noCommonPatterns) {
    errors.push('Ce mot de passe est trop commun');
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements
  };
};

// Fonction pour vérifier les mots de passe communs
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'password1', 'qwerty123', 'dragon', 'master',
    'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1',
    '654321', 'jordan23', 'harley', 'shadow', 'superman',
    'michael', 'football', 'baseball', 'ninja', 'azerty',
    '123123', 'princess', 'daniel', 'mustang', 'access',
    'flower', '555555', 'pass', 'ranger', 'hunter', 'buster',
    'soccer', 'hockey', 'killer', 'george', 'sexy', 'andrew',
    'charlie', 'asshole', 'fuckyou', 'dallas', 'jessica',
    'panties', 'pepper', '1234', 'zxcvbn', 'qwertyui',
    '121212', '000000', 'qweasd', 'jennifer', 'zxcvbnm',
    'asdfgh', 'qwerty', 'azerty', '123456789', 'password'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
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

      // Validation stricte du mot de passe pour l'inscription
      if (!isLogin) {
        const passwordValidation = validatePasswordStrength(formData.password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors.join(', '));
        }
      } else {
        // Pour la connexion, validation basique
        if (formData.password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
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
          // Basculer vers le mode connexion après inscription réussie
          setIsLogin(true);
          setFormData({
            username: formData.username, // Garder le nom d'utilisateur
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            acceptTerms: false
          });
          setError(null);
          
          // Afficher un message de succès
          setSuccessMessage('Inscription réussie ! Veuillez maintenant vous connecter avec vos identifiants.');
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

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    
    // Rediriger vers l'endpoint OAuth Google
    window.location.href = 'http://localhost:3002/api/oauth/google';
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
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              {!isLogin && formData.password && (
                <div className="mt-3">
                  <PasswordStrengthMeter password={formData.password} />
                </div>
              )}
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

          {/* Séparateur et bouton Google OAuth - uniquement pour la connexion */}
          {isLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Ou</span>
                </div>
              </div>

              {/* Bouton Google OAuth */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? 'Connexion...' : 'Continuer avec Google'}
                </button>
              </div>
            </>
          )}

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
                setSuccessMessage(null);
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
