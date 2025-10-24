import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (type === 'privacy') {
      return (
                 <div className="space-y-6">
           {/* Title */}
           <div className="text-center">
             {/* Logo */}
             <div className="flex justify-center mb-4">
               <img
                 src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
                 alt="PigeonFarm Logo" 
                 className="h-16 w-auto"
               />
             </div>
             
             <h2 className="text-2xl font-bold text-gray-900 mb-2">
               Politique d'Utilisation
             </h2>
             <p className="text-gray-600">
               Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
             </p>
           </div>

          {/* Introduction */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Introduction
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Bienvenue sur PigeonFarm, votre plateforme de gestion d'élevage de pigeons. 
              Cette politique d'utilisation décrit comment nous collectons, utilisons et protégeons 
              vos informations personnelles lorsque vous utilisez notre service.
            </p>
          </div>

          {/* Information Collection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Collecte d'Informations
            </h3>
            <p className="text-gray-700 mb-3">
              Informations que nous collectons :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Informations de compte :</strong> nom d'utilisateur, email, nom complet</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Données d'élevage :</strong> informations sur vos pigeons, couples, œufs</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Données d'utilisation :</strong> statistiques, préférences, historique</span>
              </li>
            </ul>
          </div>

          {/* Data Usage */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Utilisation des Données
            </h3>
            <p className="text-gray-700 mb-3">
              Nous utilisons vos données pour :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Fournir et maintenir le service PigeonFarm</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Personnaliser votre expérience utilisateur</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Améliorer nos services et fonctionnalités</span>
              </li>
            </ul>
          </div>

          {/* Data Protection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Protection des Données
            </h3>
            <p className="text-gray-700 mb-3">
              Conformément à la <strong>Loi malienne sur la protection des données personnelles du 21 mai 2013</strong>, 
              nous mettons en place des mesures de sécurité appropriées :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Chiffrement des données sensibles</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Accès restreint aux données personnelles</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Sauvegardes régulières et sécurisées</span>
              </li>
            </ul>
          </div>

          {/* Loi Malienne */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Conformité Loi Malienne
            </h3>
            <p className="text-gray-700 mb-3">
              PigeonFarm respecte la <strong>Loi malienne sur la protection des données personnelles du 21 mai 2013</strong> :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Article 3 :</strong> Consentement libre et éclairé</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Article 4 :</strong> Finalité légitime et déterminée</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Article 7 :</strong> Sécurité et confidentialité</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact
            </h3>
            <p className="text-gray-700 mb-3">
              Pour toute question concernant cette politique :
            </p>
                         <div className="space-y-1 text-gray-700">
               <p><strong>Email :</strong> contactpigeonfarm@gmail.com</p>
               <p><strong>Adresse :</strong> PigeonFarm, Kalaban Coura ACI, Mali</p>
             </div>
          </div>
        </div>
      );
    } else {
      return (
                 <div className="space-y-6">
           {/* Title */}
           <div className="text-center">
             {/* Logo */}
             <div className="flex justify-center mb-4">
               <img 
                 src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
                 alt="PigeonFarm Logo" 
                 className="h-16 w-auto"
               />
             </div>
             
             <h2 className="text-2xl font-bold text-gray-900 mb-2">
               Conditions Générales d'Utilisation
             </h2>
             <p className="text-gray-600">
               Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
             </p>
           </div>

          {/* Introduction */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Introduction
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation 
              de la plateforme PigeonFarm. En utilisant notre service, vous acceptez 
              d'être lié par ces conditions.
            </p>
          </div>

          {/* Service Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Description du Service
            </h3>
            <p className="text-gray-700 mb-3">
              PigeonFarm est une plateforme de gestion d'élevage de pigeons qui propose :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Gestion des couples de pigeons reproducteurs</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Suivi des pontes et des œufs</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Gestion des pigeonneaux</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Suivi sanitaire et médical</span>
              </li>
            </ul>
          </div>

          {/* User Obligations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Obligations de l'Utilisateur
            </h3>
            <p className="text-gray-700 mb-3">
              En utilisant PigeonFarm, vous vous engagez à :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Fournir des informations exactes et à jour</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Respecter la législation en vigueur sur l'élevage</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Protéger vos identifiants de connexion</span>
              </li>
            </ul>
          </div>

          {/* Prohibited Uses */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Utilisations Interdites
            </h3>
            <p className="text-gray-700 mb-3">
              Il est strictement interdit de :
            </p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Utiliser le service pour des activités illégales</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Tenter de pirater ou compromettre la sécurité</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Partager des informations fausses ou trompeuses</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact
            </h3>
            <p className="text-gray-700 mb-3">
              Pour toute question concernant ces conditions :
            </p>
                         <div className="space-y-1 text-gray-700">
               <p><strong>Email :</strong> contactpigeonfarm@gmail.com</p>
               <p><strong>Adresse :</strong> PigeonFarm, Kalaban Coura ACI, Mali</p>
             </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {type === 'privacy' ? 'Politique d\'Utilisation' : 'Conditions Générales'}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Fermer
            </button>
            <div className="text-sm text-gray-500">
              {type === 'privacy' 
                ? 'Conforme à la Loi malienne sur la protection des données personnelles du 21 mai 2013'
                : 'Soumis au droit malien'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalModal; 