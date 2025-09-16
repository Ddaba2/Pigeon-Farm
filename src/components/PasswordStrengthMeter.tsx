import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  icon?: React.ReactNode;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRequirements = true,
  className = ''
}) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Au moins 8 caractères',
      test: (pwd) => pwd.length >= 8
    },
    {
      label: 'Au moins une majuscule',
      test: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      label: 'Au moins une minuscule',
      test: (pwd) => /[a-z]/.test(pwd)
    },
    {
      label: 'Au moins un chiffre',
      test: (pwd) => /\d/.test(pwd)
    },
    {
      label: 'Au moins un caractère spécial',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    },
    {
      label: 'Pas de mot de passe commun',
      test: (pwd) => !isCommonPassword(pwd)
    }
  ];

  const calculateStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };

    const passedRequirements = requirements.filter(req => req.test(password)).length;
    const totalRequirements = requirements.length;
    const score = Math.round((passedRequirements / totalRequirements) * 100);

    if (score < 40) {
      return { score, label: 'Faible', color: 'bg-red-500' };
    } else if (score < 70) {
      return { score, label: 'Moyen', color: 'bg-yellow-500' };
    } else if (score < 90) {
      return { score, label: 'Bon', color: 'bg-blue-500' };
    } else {
      return { score, label: 'Très fort', color: 'bg-green-500' };
    }
  };

  const strength = calculateStrength(password);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Force du mot de passe
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {strength.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {strength.score}% - {strength.label}
        </div>
      </div>

      {/* Exigences */}
      {showRequirements && password && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Exigences de sécurité :
          </h4>
          <div className="space-y-1">
            {requirements.map((requirement, index) => {
              const isValid = requirement.test(password);
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 text-sm ${
                    isValid
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isValid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{requirement.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conseils de sécurité */}
      {password && strength.score < 70 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            💡 Conseils pour renforcer votre mot de passe :
          </h5>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Utilisez une combinaison de lettres, chiffres et symboles</li>
            <li>• Évitez les informations personnelles (nom, date de naissance)</li>
            <li>• Utilisez des mots de passe uniques pour chaque compte</li>
            <li>• Considérez l'utilisation d'un gestionnaire de mots de passe</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Fonction pour vérifier les mots de passe communs
function isCommonPassword(password: string): boolean {
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
}

export default PasswordStrengthMeter;
