import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, UserCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
             
             <FileText className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
             <h1 className="text-3xl font-bold text-gray-900 mb-2">
               Conditions Générales d'Utilisation
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
              Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation 
              de la plateforme PigeonFarm. En utilisant notre service, vous acceptez 
              d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, 
              veuillez ne pas utiliser notre service.
            </p>
          </div>

          {/* Service Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-indigo-600 mr-2" />
              Description du Service
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                PigeonFarm est une plateforme de gestion d'élevage de pigeons qui propose :
              </p>
              <ul className="space-y-2 text-gray-700">
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
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Statistiques et rapports d'élevage</span>
                </li>
              </ul>
            </div>
          </div>

          {/* User Obligations */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-6 w-6 text-indigo-600 mr-2" />
              Obligations de l'Utilisateur
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                En utilisant PigeonFarm, vous vous engagez à :
              </p>
              <ul className="space-y-2 text-gray-700">
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
                  <span>Ne pas utiliser le service à des fins illégales</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Protéger vos identifiants de connexion</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Respecter les droits de propriété intellectuelle</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Prohibited Uses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              Utilisations Interdites
            </h2>
            <div className="bg-red-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Il est strictement interdit de :
              </p>
              <ul className="space-y-2 text-gray-700">
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
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Utiliser le service pour du spam ou du harcèlement</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Reproduire ou distribuer le contenu sans autorisation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Scale className="h-6 w-6 text-indigo-600 mr-2" />
              Propriété Intellectuelle
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Tous les droits de propriété intellectuelle relatifs à PigeonFarm, 
                y compris mais sans s'y limiter, le code source, les designs, 
                les textes et les fonctionnalités, appartiennent à PigeonFarm.
              </p>
              <p className="text-gray-700">
                Vous conservez la propriété de vos données d'élevage et de votre contenu, 
                mais accordez à PigeonFarm une licence d'utilisation pour fournir le service.
              </p>
            </div>
          </div>

          {/* Privacy and Data */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-indigo-600 mr-2" />
              Confidentialité et Données
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                La protection de vos données est une priorité pour PigeonFarm :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Vos données sont chiffrées et sécurisées</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Nous ne vendons jamais vos informations personnelles</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Vous contrôlez totalement vos données</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Conformité RGPD et lois françaises</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Service Availability */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Disponibilité du Service
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                PigeonFarm s'efforce de maintenir un service disponible 24h/24 et 7j/7, 
                mais ne peut garantir une disponibilité continue. Le service peut être 
                temporairement indisponible pour :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Maintenance planifiée</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Mises à jour techniques</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Problèmes techniques imprévus</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Force majeure</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Limitation de Responsabilité
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Dans toute la mesure permise par la loi, PigeonFarm ne sera pas responsable :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Des pertes de données ou interruptions de service</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Des dommages indirects ou consécutifs</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Des erreurs dans les données d'élevage</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Des décisions prises sur la base des informations du service</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Termination */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Résiliation
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Vous pouvez résilier votre compte à tout moment. PigeonFarm peut également 
                suspendre ou résilier votre compte en cas de :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Violation des présentes conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Activité frauduleuse ou abusive</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Non-paiement des frais de service</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Modifications des Conditions
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                PigeonFarm se réserve le droit de modifier ces conditions à tout moment. 
                Les modifications seront notifiées via l'application ou par email. 
                Votre utilisation continue du service après les modifications 
                constitue votre acceptation des nouvelles conditions.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            <div className="bg-indigo-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Pour toute question concernant ces conditions générales :
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
              Ces conditions générales sont soumises au <strong>droit malien</strong> et à la 
              <strong>Loi sur la protection des données personnelles du 21 mai 2013</strong>. 
              Tout litige sera soumis à la compétence des tribunaux maliens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 