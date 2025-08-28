import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeLocalStorage } from '../utils/edgeCompatibility';
import LegalModal from './LegalModal';

interface LoginProps {
  onAuthSuccess: (user: any, message?: string) => void;
}

function Login({ onAuthSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code' | 'new-password'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' }>({
    isOpen: false,
    type: 'privacy'
  });

  const [forgotPasswordModal, setForgotPasswordModal] = useState<{ isOpen: boolean; step: 'email' | 'code' | 'new-password' }>({
    isOpen: false,
    step: 'email'
  });

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });

  const navigate = useNavigate();

  const openLegalModal = (type: 'privacy' | 'terms') => {
    setLegalModal({ isOpen: true, type });
  };

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, type: 'privacy' });
  };

  const openForgotPasswordModal = () => {
    setForgotPasswordModal({ isOpen: true, step: 'email' });
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordModal({ isOpen: false, step: 'email' });
  };

  const goToForgotPasswordStep = (step: 'email' | 'code' | 'new-password') => {
    setForgotPasswordModal(prev => ({ ...prev, step }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (isLogin) {
      return formData.username && formData.password;
    } else {
      return formData.username && formData.email && formData.password && 
             formData.confirmPassword && formData.fullName && formData.acceptTerms;
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.forgotPassword({ email: resetEmail });
      setSuccess('Code à 4 chiffres envoyé à votre email');
      goToForgotPasswordStep('code');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    if (!resetCode || resetCode.length !== 4) {
      setError('Veuillez entrer le code à 4 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.verifyResetCode({ email: resetEmail, code: resetCode });
      setSuccess('Code vérifié avec succès ! Créez votre nouveau mot de passe');
      goToForgotPasswordStep('new-password');
    } catch (err: any) {
      setError(err.message || 'Code invalide. Vérifiez votre email et réessayez');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.resetPassword({ 
        email: resetEmail, 
        code: resetCode, 
        newPassword 
      });
      setSuccess('Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter');
      closeForgotPasswordModal();
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation. Vérifiez votre code et réessayez');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Connexion simplifiée sans JWT
        const res = await api.login({
          username: formData.username,
          password: formData.password
        });

        if (res.user) {
          // Stocker les informations utilisateur directement
          safeLocalStorage.setItem('user', JSON.stringify(res.user));
          onAuthSuccess(res.user, 'Connexion réussie !');
        } else {
          throw new Error('Informations utilisateur non reçues');
        }
      } else {
        // Inscription
        await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          acceptTerms: formData.acceptTerms
        });

        // Rediriger vers la page de connexion après inscription réussie
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          acceptTerms: false
        });
      }
    } catch (err: any) {
      console.error('Erreur d\'authentification:', err);
      setError(err.message || 'Erreur lors de l\'authentification');
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion Google supprimée

  const handleVerifyEmail = async () => {
    if (!formData.email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.verifyEmail({ email: formData.email });
      setSuccess('Email de vérification envoyé');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.resendVerification({ email: formData.email });
      setSuccess('Email de vérification renvoyé');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = safeLocalStorage.getItem('token');
    if (token) {
      // Vérifier la validité du token
      api.verifyToken().then((user: any) => {
        onAuthSuccess(user, 'Session restaurée');
      }).catch(() => {
        safeLocalStorage.removeItem('token');
      });
    }
  }, [onAuthSuccess]);

  // Gestion des erreurs et succès
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

    // Interface de mot de passe oublié (toutes les étapes)
  if (forgotPasswordStep === 'code' || forgotPasswordStep === 'new-password') {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
                alt="PigeonFarm Logo" 
                className="h-20 w-auto"
              />
            </div>
            
                         {/* Indicateur d'étapes */}
             <div className="flex justify-center mb-6">
               <div className="flex space-x-3">
                 <div className={`w-3 h-3 rounded-full ${forgotPasswordStep === 'code' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                 <div className={`w-3 h-3 rounded-full ${forgotPasswordStep === 'new-password' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
               </div>
             </div>
             
             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
               {forgotPasswordStep === 'code' ? '🔢 Code de réinitialisation' : '🔑 Nouveau mot de passe'}
             </h2>
             <p className="mt-2 text-center text-sm text-gray-600">
               {forgotPasswordStep === 'code' 
                 ? 'Entrez le code à 4 chiffres reçu par email' 
                 : 'Créez votre nouveau mot de passe'
               }
             </p>
          </div>

            {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
              </div>
            )}

                     <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
             {/* Étape 1: Saisie de l'email */}
             {forgotPasswordStep === 'email' && (
               <div className="space-y-6">
                 <div>
                   <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                     📧 Votre email
                   </label>
                   <input
                     id="resetEmail"
                     name="resetEmail"
                     type="email"
                     required
                     value={resetEmail}
                     onChange={(e) => setResetEmail(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                     placeholder="votre@email.com"
                   />
                 </div>
                 
                 <button
                   type="button"
                   onClick={handleForgotPassword}
                   disabled={isLoading || !resetEmail}
                   className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   {isLoading ? '📤 Envoi en cours...' : '📤 Envoyer le code'}
                 </button>
               </div>
             )}

             {/* Étape 2: Saisie du code */}
             {forgotPasswordStep === 'code' && (
              <div className="space-y-6">
                  <div>
                    <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      🔢 Code de réinitialisation (4 chiffres)
                    </label>
                    <input
                      id="resetCode"
                      name="resetCode"
                      type="text"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                      value={resetCode}
                      onChange={(e) => {
                        // Ne permettre que les chiffres
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setResetCode(value);
                      }}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="0000"
                      style={{ letterSpacing: '0.5em' }}
                    />
                    <p className="mt-3 text-sm text-gray-500 text-center">
                      📧 Code envoyé à <strong className="text-indigo-600">{resetEmail}</strong>
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleVerifyResetCode}
                      disabled={isLoading || resetCode.length !== 4}
                      className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? '🔍 Vérification...' : '✅ Vérifier le code'}
                    </button>
                    
                    {/* Bouton pour renvoyer le code */}
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                    >
                      🔄 Renvoyer le code
                    </button>
                  </div>
                </div>
              )}

                         {forgotPasswordStep === 'new-password' && (
               <div className="space-y-6">
                 <div>
                   <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                     🔑 Nouveau mot de passe
                   </label>
                   <div className="relative">
                     <input
                       id="newPassword"
                       name="newPassword"
                       type={showPassword ? 'text' : 'password'}
                       required
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                       placeholder="Minimum 6 caractères"
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                     >
                       {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                   </div>
                   {newPassword && newPassword.length < 6 && (
                     <p className="mt-1 text-sm text-red-500">⚠️ Le mot de passe doit contenir au moins 6 caractères</p>
                   )}
                 </div>

                 <div>
                   <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                     🔒 Confirmer le mot de passe
                   </label>
                   <div className="relative">
                     <input
                       id="confirmNewPassword"
                       name="confirmNewPassword"
                       type={showConfirmPassword ? 'text' : 'password'}
                       required
                       value={confirmNewPassword}
                       onChange={(e) => setConfirmNewPassword(e.target.value)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                       placeholder="Confirmez votre mot de passe"
                     />
                     <button
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                     >
                       {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                   </div>
                   {confirmNewPassword && newPassword !== confirmNewPassword && (
                     <p className="mt-1 text-sm text-red-500">⚠️ Les mots de passe ne correspondent pas</p>
                   )}
                 </div>

                 <button
                   type="button"
                   onClick={handleResetPassword}
                   disabled={isLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                   className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   {isLoading ? '🔄 Réinitialisation...' : '✅ Réinitialiser le mot de passe'}
                 </button>
               </div>
             )}

                         <div className="text-center">
             <button 
                 type="button"
                 onClick={() => {
                   setForgotPasswordStep('email');
                   setError(null);
                   setSuccess(null);
                   setResetEmail('');
                   setResetCode('');
                   setNewPassword('');
                   setConfirmNewPassword('');
                 }}
                 className="text-indigo-600 hover:text-indigo-500"
               >
                 ← Retour à la connexion
             </button>
             </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
                 <div>
           {/* Logo */}
           <div className="flex justify-center mb-4">
             <img 
               src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
               alt="PigeonFarm Logo" 
               className="h-20 w-auto"
             />
           </div>
           
           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
             {isLogin ? 'Connexion' : 'Inscription'}
           </h2>
           <p className="mt-2 text-center text-sm text-gray-600">
             {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
           </p>
         </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required={!isLogin}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                  id="username"
                  name="username"
                  type="text"
              required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nom d'utilisateur"
            />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nom complet *
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isLogin}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Prénom et nom"
                  />
                </div>
              </div>
            )}

            

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
              required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
            />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

                         {!isLogin && (
             <div>
                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                   Confirmer le mot de passe
               </label>
                 <div className="mt-1 relative">
                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
             <input
                     id="confirmPassword"
                     name="confirmPassword"
                     type={showConfirmPassword ? 'text' : 'password'}
                     required={!isLogin}
                     value={formData.confirmPassword}
                     onChange={handleInputChange}
                     className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                     placeholder="Confirmer le mot de passe"
             />
                 <button
                   type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
                   >
                     {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                   </button>
             </div>
               </div>
             )}

             {/* Case à cocher pour accepter les conditions - placée après la confirmation du mot de passe */}
             {!isLogin && (
               <div className="flex items-center">
                 <input
                   id="acceptTerms"
                   name="acceptTerms"
                   type="checkbox"
                   checked={formData.acceptTerms}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     acceptTerms: e.target.checked
                   }))}
                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                 />
                 <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                   J'accepte la{' '}
                   <button
                     type="button"
                     onClick={() => openLegalModal('privacy')}
                     className="text-indigo-600 hover:text-indigo-500 underline bg-transparent border-none p-0 cursor-pointer"
                   >
                     politique d'utilisation
                   </button>{' '}
                   et les{' '}
                   <button
                     type="button"
                     onClick={() => openLegalModal('terms')}
                     className="text-indigo-600 hover:text-indigo-500 underline bg-transparent border-none p-0 cursor-pointer"
                   >
                     conditions générales
                   </button>{' '}
                   *
                 </label>
               </div>
             )}
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading || !validateForm()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </div>

                                           {isLogin && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Mot de passe oublié ?
                </button>
            </div>
            )}



           

          {/* Connexion Google supprimée */}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  fullName: '',
                  acceptTerms: false
                });
              }}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>

             {/* Modal pour les pages légales */}
       <LegalModal
         isOpen={legalModal.isOpen}
         onClose={closeLegalModal}
         type={legalModal.type}
       />

       {/* Modal pour le mot de passe oublié */}
       {forgotPasswordModal.isOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               {/* Logo */}
               <div className="flex justify-center mb-4">
                 <img 
                   src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
                   alt="PigeonFarm Logo" 
                   className="h-16 w-auto"
                 />
               </div>

               {/* Indicateur d'étapes */}
               <div className="flex justify-center mb-6">
                 <div className="flex space-x-3">
                   <div className={`w-3 h-3 rounded-full ${forgotPasswordModal.step === 'email' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                   <div className={`w-3 h-3 rounded-full ${forgotPasswordModal.step === 'code' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                   <div className={`w-3 h-3 rounded-full ${forgotPasswordModal.step === 'new-password' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                 </div>
               </div>

               {/* Titre et description */}
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">
                   {forgotPasswordModal.step === 'email' ? '🔐 Mot de passe oublié ?' : 
                    forgotPasswordModal.step === 'code' ? '🔢 Code de réinitialisation' : '🔑 Nouveau mot de passe'}
                 </h2>
                 <p className="text-sm text-gray-600">
                   {forgotPasswordModal.step === 'email' ? 'Entrez votre email pour recevoir un code à 4 chiffres' :
                    forgotPasswordModal.step === 'code' 
                     ? 'Entrez le code à 4 chiffres reçu par email' 
                     : 'Créez votre nouveau mot de passe'
                   }
                 </p>
               </div>

               {/* Messages d'erreur et de succès */}
               {error && (
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                   {error}
                 </div>
               )}

               {success && (
                 <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                   {success}
                 </div>
               )}

               {/* Étape 1: Saisie de l'email */}
               {forgotPasswordModal.step === 'email' && (
                 <div className="space-y-4">
                   <div>
                     <label htmlFor="modalResetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                       📧 Votre email
                     </label>
                     <input
                       id="modalResetEmail"
                       type="email"
                       required
                       value={resetEmail}
                       onChange={(e) => setResetEmail(e.target.value)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                       placeholder="votre@email.com"
                     />
                   </div>
                   
                   <button
                     type="button"
                     onClick={handleForgotPassword}
                     disabled={isLoading || !resetEmail}
                     className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     {isLoading ? '📤 Envoi en cours...' : '📤 Envoyer le code'}
                   </button>
                 </div>
               )}

               {/* Étape 2: Saisie du code */}
               {forgotPasswordModal.step === 'code' && (
                 <div className="space-y-4">
                   <div>
                     <label htmlFor="modalResetCode" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                       🔢 Code de réinitialisation (4 chiffres)
                     </label>
                     <input
                       id="modalResetCode"
                       type="text"
                       maxLength={4}
                       pattern="[0-9]{4}"
                       required
                       value={resetCode}
                       onChange={(e) => {
                         const value = e.target.value.replace(/[^0-9]/g, '');
                         setResetCode(value);
                       }}
                       className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                       placeholder="0000"
                       style={{ letterSpacing: '0.5em' }}
                     />
                     <p className="text-sm text-gray-500 text-center mt-2">
                       📧 Code envoyé à <strong className="text-indigo-600">{resetEmail}</strong>
                     </p>
                   </div>
                   
                   <button
                     type="button"
                     onClick={handleVerifyResetCode}
                     disabled={isLoading || resetCode.length !== 4}
                     className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     {isLoading ? '🔍 Vérification...' : '✅ Vérifier le code'}
                   </button>
                   
                   <button
                     type="button"
                     onClick={handleForgotPassword}
                     disabled={isLoading}
                     className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                   >
                     🔄 Renvoyer le code
                   </button>
                 </div>
               )}

               {/* Étape 3: Nouveau mot de passe */}
               {forgotPasswordModal.step === 'new-password' && (
                 <div className="space-y-4">
                   <div>
                     <label htmlFor="modalNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                       🔑 Nouveau mot de passe
                     </label>
                     <div className="relative">
                       <input
                         id="modalNewPassword"
                         type={showPassword ? 'text' : 'password'}
                         required
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                         placeholder="Minimum 6 caractères"
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                       >
                         {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                     </div>
                     {newPassword && newPassword.length < 6 && (
                       <p className="text-sm text-red-500">⚠️ Le mot de passe doit contenir au moins 6 caractères</p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="modalConfirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                       🔒 Confirmer le mot de passe
                     </label>
                     <div className="relative">
                       <input
                         id="modalConfirmNewPassword"
                         type={showConfirmPassword ? 'text' : 'password'}
                         required
                         value={confirmNewPassword}
                         onChange={(e) => setConfirmNewPassword(e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                         placeholder="Confirmez votre mot de passe"
                       />
                       <button
                         type="button"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                       >
                         {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                     </div>
                     {confirmNewPassword && newPassword !== confirmNewPassword && (
                       <p className="text-sm text-red-500">⚠️ Les mots de passe ne correspondent pas</p>
                     )}
                   </div>

                   <button
                     type="button"
                     onClick={handleResetPassword}
                     disabled={isLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                     className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     {isLoading ? '🔄 Réinitialisation...' : '✅ Réinitialiser le mot de passe'}
                   </button>
                 </div>
               )}

               {/* Bouton de fermeture */}
               <div className="text-center mt-6">
                 <button
                   type="button"
                   onClick={closeForgotPasswordModal}
                   className="text-indigo-600 hover:text-indigo-500 text-sm"
                 >
                   ← Retour à la connexion
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

export default Login;