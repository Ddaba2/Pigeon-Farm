import React, { useState } from 'react';
import { 
  HelpCircle, 
  Users, 
  FileText, 
  Activity, 
  Heart, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Accessibility,
  Keyboard,
  Eye,
  Type
} from 'lucide-react';
import KeyboardShortcuts from './KeyboardShortcuts';
import AccessibilityTest from './AccessibilityTest';
import { createAppShortcuts } from '../hooks/useKeyboardNavigation';

const Documentation: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    gettingStarted: true,
    features: false,
    accessibility: false,
    faq: false,
    contact: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const features = [
    {
      icon: Users,
      title: "Gestion des Couples",
      description: "Créez et gérez vos couples de pigeons avec numérotation des nids et suivi des races.",
      color: "blue"
    },
    {
      icon: FileText,
      title: "Suivi des Pontes",
      description: "Enregistrez les dates de ponte et suivez le taux d'éclosion de vos œufs.",
      color: "green"
    },
    {
      icon: Activity,
      title: "Gestion des Pigeonneaux",
      description: "Suivez la naissance, la croissance et le statut de vos pigeonneaux.",
      color: "purple"
    },
    {
      icon: Heart,
      title: "Suivi Sanitaire",
      description: "Enregistrez les interventions sanitaires, vaccinations et traitements.",
      color: "red"
    },
    {
      icon: BarChart3,
      title: "Statistiques",
      description: "Visualisez vos performances avec des graphiques et analyses détaillées.",
      color: "orange"
    },
    {
      icon: TrendingUp,
      title: "Ventes",
      description: "Gérez vos ventes de pigeonneaux et suivez votre chiffre d'affaires.",
      color: "emerald"
    }
  ];

  const faqItems = [
    {
      question: "Comment ajouter un nouveau couple ?",
      answer: "Allez dans la section 'Couples', cliquez sur 'Ajouter' et remplissez le formulaire avec le numéro de nid, la race et les identifiants des pigeons."
    },
    {
      question: "Comment enregistrer une ponte ?",
      answer: "Dans 'Suivi ponte', sélectionnez le couple, ajoutez les dates de ponte et suivez l'éclosion des œufs."
    },
    {
      question: "Comment gérer les pigeonneaux nés ?",
      answer: "Utilisez 'Pigeonneaux' pour enregistrer les naissances, le sexe, le poids et le statut de chaque pigeonneau."
    },
    {
      question: "Comment faire le suivi sanitaire ?",
      answer: "Dans 'Suivi sanitaire', enregistrez les vaccinations, traitements et interventions pour vos pigeons."
    },
    {
      question: "Comment voir mes statistiques ?",
      answer: "La section 'Statistiques' affiche automatiquement vos performances, taux d'éclosion et chiffre d'affaires."
    },
    {
      question: "Comment gérer les ventes ?",
      answer: "Dans 'Statistiques', utilisez la section 'Ventes' pour enregistrer vos ventes de pigeonneaux."
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contactpigeonfarm@gmail.com",
      color: "blue"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "(+223) 83 78 40 97",
      color: "green"
    },
    {
      icon: MapPin,
      title: "Adresse",
      value: "Kalaban Coura ACI, Mali",
      color: "purple"
    },
    {
      icon: Clock,
      title: "Support",
      value: "Lun-Ven: 8h-18h",
      color: "orange"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Centre d'aide</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Trouvez toutes les informations nécessaires pour utiliser efficacement PigeonFarm et optimiser votre élevage de pigeons.
        </p>
      </div>

      {/* Section Bienvenue */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenue sur PigeonFarm</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              PigeonFarm est votre partenaire numérique pour une gestion professionnelle de votre élevage de pigeons. Suivez vos couples, pontes, pigeonneaux, santé et ventes en toute simplicité.
            </p>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Star className="h-5 w-5" />
              <span className="font-medium">Application recommandée pour les éleveurs professionnels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Fonctionnalités */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span>Fonctionnalités principales</span>
          </h2>
          <button
            onClick={() => toggleSection('features')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span className="font-medium">
              {expandedSections.features ? "Masquer" : "Afficher"}
            </span>
            {expandedSections.features ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {expandedSections.features && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
                green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
                purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
                red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
                orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
                emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
              };
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
                  <div className={`p-3 rounded-lg w-fit mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section Accessibilité */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Accessibility className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span>Accessibilité</span>
          </h2>
          <button
            onClick={() => toggleSection('accessibility')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span className="font-medium">
              {expandedSections.accessibility ? 'Masquer' : 'Afficher'}
            </span>
            {expandedSections.accessibility ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {expandedSections.accessibility && (
          <div className="space-y-6">
            {/* Raccourcis clavier */}
            <KeyboardShortcuts 
              shortcuts={createAppShortcuts(() => {}, () => {}, () => {})}
              className="mb-6"
            />

            {/* Fonctionnalités d'accessibilité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contraste élevé
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Activez le mode contraste élevé pour améliorer la lisibilité. 
                  Utilisez le bouton d'accessibilité dans la barre de navigation.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Type className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Texte agrandi
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Augmentez la taille du texte pour une meilleure lisibilité. 
                  Idéal pour les utilisateurs malvoyants.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Keyboard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Navigation clavier
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Utilisez Tab pour naviguer et Entrée pour activer. 
                  Tous les éléments sont accessibles au clavier.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Accessibility className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lecteurs d'écran
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Compatible avec NVDA, JAWS et VoiceOver. 
                  Tous les éléments ont des étiquettes appropriées.
                </p>
              </div>
            </div>

            {/* Conseils d'accessibilité */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Conseils pour une meilleure accessibilité
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• Utilisez les raccourcis clavier pour naviguer plus rapidement</li>
                <li>• Activez le contraste élevé si vous avez des difficultés visuelles</li>
                <li>• Utilisez un lecteur d'écran pour une navigation vocale</li>
                <li>• Agrandissez le texte si nécessaire pour une meilleure lisibilité</li>
                <li>• Utilisez la touche Tab pour naviguer entre les éléments</li>
              </ul>
            </div>

            {/* Test d'accessibilité */}
            <AccessibilityTest />
          </div>
        )}
      </div>

      {/* Section FAQ */}
      <div className="space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
          <h2 className="text-xl font-bold mb-2 text-yellow-800 dark:text-yellow-200 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Sauvegarde et restauration</h2>
          <p className="text-gray-700 dark:text-gray-200 mb-2">Utilisez la section "Sauvegarde" pour sauvegarder vos données et les restaurer en cas de problème.</p>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span>Questions fréquentes</span>
          </h2>
          <button
            onClick={() => toggleSection('faq')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span className="font-medium">
              {expandedSections.faq ? "Masquer" : "Afficher"}
            </span>
            {expandedSections.faq ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {expandedSections.faq && (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Contact */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Phone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span>Support et contact</span>
          </h2>
          <button
            onClick={() => toggleSection('contact')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span className="font-medium">
              {expandedSections.contact ? "Masquer" : "Afficher"}
            </span>
            {expandedSections.contact ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {expandedSections.contact && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
                green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
                purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
                orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
              };
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all duration-200">
                  <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${colorClasses[contact.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {contact.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section Conseils */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conseils d'utilisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Sauvegardez régulièrement vos données</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Utilisez des identifiants uniques pour vos pigeons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Effectuez rapidement le suivi sanitaire</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Consultez régulièrement vos statistiques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Maintenez vos données à jour</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Utilisez les notifications pour rester informé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 