import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Users, Database, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
                     {/* Title */}
           <div className="text-center mb-8">
             {/* Logo */}
             <div className="flex justify-center mb-4">
               <img 
                 src="/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" 
                 alt="PigeonFarm Logo" 
                 className="h-24 w-auto"
               />
             </div>
             
             <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
             <h1 className="text-3xl font-bold text-gray-900 mb-2">
               Politique d'Utilisation
             </h1>
             <p className="text-gray-600">
               Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
             </p>
           </div>

          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Bienvenue sur PigeonFarm, votre plateforme de gestion d'élevage de pigeons. 
              Cette politique d'utilisation décrit comment nous collectons, utilisons et protégeons 
              vos informations personnelles lorsque vous utilisez notre service.
            </p>
          </div>

          {/* Information Collection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-6 w-6 text-indigo-600 mr-2" />
              Collecte d'Informations
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-3">Informations que nous collectons :</h3>
              <ul className="space-y-2 text-gray-700">
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
          </div>

          {/* Data Usage */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 text-indigo-600 mr-2" />
              Utilisation des Données
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-3">Nous utilisons vos données pour :</h3>
              <ul className="space-y-2 text-gray-700">
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
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Communiquer avec vous concernant votre compte</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Protection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 text-indigo-600 mr-2" />
              Protection des Données
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Conformément à la <strong>Loi malienne sur la protection des données personnelles du 21 mai 2013</strong>, 
                nous mettons en place des mesures de sécurité appropriées pour protéger vos informations :
              </p>
              <ul className="space-y-2 text-gray-700">
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
                  <span>Surveillance continue de la sécurité</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Sauvegardes régulières et sécurisées</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Loi Malienne */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-indigo-600 mr-2" />
              Conformité Loi Malienne
            </h2>
            <div className="bg-green-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                PigeonFarm respecte scrupuleusement la <strong>Loi malienne sur la protection des données personnelles du 21 mai 2013</strong> :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Article 3 :</strong> Consentement libre et éclairé pour la collecte des données</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Article 4 :</strong> Finalité légitime et déterminée de la collecte</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Article 5 :</strong> Proportionalité et adéquation des données collectées</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Article 6 :</strong> Conservation limitée dans le temps</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Article 7 :</strong> Sécurité et confidentialité des données</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-indigo-600 mr-2" />
              Partage des Données
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
                Vos données peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Avec votre consentement explicite</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Pour respecter les obligations légales</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Avec nos prestataires de services de confiance</span>
                </li>
              </ul>
            </div>
          </div>

          {/* User Rights */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vos Droits
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Vous avez le droit de :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Accéder à vos données personnelles</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Corriger ou mettre à jour vos informations</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Demander la suppression de vos données</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Retirer votre consentement à tout moment</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            <div className="bg-indigo-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Si vous avez des questions concernant cette politique d'utilisation ou 
                souhaitez exercer vos droits, contactez-nous :
              </p>
                             <div className="space-y-2 text-gray-700">
                 <p><strong>Email :</strong> contactpigeonfarm@gmail.com</p>
                 <p><strong>Adresse :</strong> PigeonFarm, Kalaban Coura ACI, Mali</p>
                 <p><strong>Téléphone :</strong> (+223) 83 78 40 97</p>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Cette politique d'utilisation est conforme à la <strong>Loi malienne sur la protection des données personnelles du 21 mai 2013</strong> 
              et respecte les droits des citoyens maliens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 