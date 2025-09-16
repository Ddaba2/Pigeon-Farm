import React, { useState } from 'react';
import apiService from '../utils/api';
import PasswordStrengthMeter from './PasswordStrengthMeter';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.forgotPassword(email);
      if (response.success) {
        setSuccess('Code envoyé à votre email');
        setStep('code');
      } else {
        setError(response.message || 'Erreur lors de l\'envoi du code');
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.verifyResetCode(email, code);
      if (response.success) {
        setSuccess('Code vérifié avec succès');
        setStep('password');
      } else {
        setError(response.message || 'Code invalide');
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.resetPassword({ email, code, newPassword });
      if (response.success) {
        setSuccess('Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setError(response.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

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
            {step === 'email' && 'Mot de passe oublié'}
            {step === 'code' && 'Vérification du code'}
            {step === 'password' && 'Nouveau mot de passe'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' && 'Entrez votre email pour recevoir un code de réinitialisation'}
            {step === 'code' && 'Entrez le code reçu par email'}
            {step === 'password' && 'Créez votre nouveau mot de passe'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={
          step === 'email' ? handleSendCode :
          step === 'code' ? handleVerifyCode :
          handleResetPassword
        }>
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

          <div className="space-y-4">
            {step === 'email' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {step === 'code' && (
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Code de vérification
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Entrez le code à 4 chiffres"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Code envoyé à : {email}
                </p>
              </div>
            )}

            {step === 'password' && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {newPassword && (
                    <div className="mt-3">
                      <PasswordStrengthMeter password={newPassword} />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (
                step === 'email' ? 'Envoyer le code' :
                step === 'code' ? 'Vérifier le code' :
                'Réinitialiser le mot de passe'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-blue-600 hover:text-blue-500"
            >
              ← Retour à la connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
