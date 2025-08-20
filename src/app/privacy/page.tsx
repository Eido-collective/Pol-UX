'use client'

import { Shield, Eye, Lock, Database, Mail, Globe, Calendar } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de confidentialité</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Protection de vos données personnelles et respect de votre vie privée
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notre engagement</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            PolUX s'engage à protéger la confidentialité et la sécurité de vos données personnelles. 
            Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons 
            vos informations lorsque vous utilisez notre plateforme.
          </p>
        </div>

        {/* Responsable du traitement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Responsable du traitement</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="text-gray-900 font-medium">solene@pol-ux.fr</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Site web</p>
                <p className="text-gray-900 font-medium">www.pol-ux.fr</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dernière mise à jour</p>
                <p className="text-gray-900 font-medium">Janvier 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Données collectées */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Données collectées</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Données d'identification</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Nom et prénom</li>
                <li>• Adresse email</li>
                <li>• Nom d'utilisateur</li>
                <li>• Mot de passe (chiffré)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Données de navigation</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Adresse IP</li>
                <li>• Type de navigateur</li>
                <li>• Pages consultées</li>
                <li>• Horodatage des connexions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Données de contenu</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Initiatives créées</li>
                <li>• Commentaires et contributions</li>
                <li>• Préférences et interactions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Finalités du traitement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Finalités du traitement</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <p>
                <strong>Gestion des comptes utilisateurs :</strong> Création, authentification et administration 
                des comptes utilisateurs pour accéder aux fonctionnalités de la plateforme.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <p>
                <strong>Publication d'initiatives :</strong> Permettre aux utilisateurs de créer, modifier 
                et gérer leurs initiatives sur la carte interactive.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">3</span>
              </div>
              <p>
                <strong>Communication :</strong> Envoi d'informations importantes, notifications et 
                communications relatives au service.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">4</span>
              </div>
              <p>
                <strong>Amélioration du service :</strong> Analyse des données d'usage pour améliorer 
                la qualité et les fonctionnalités de la plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Base légale */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Base légale</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Le traitement de vos données personnelles est fondé sur les bases légales suivantes :
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Exécution du contrat :</strong> Pour la fourniture des services demandés</li>
              <li>• <strong>Intérêt légitime :</strong> Pour l'amélioration de nos services et la sécurité</li>
              <li>• <strong>Consentement :</strong> Pour les communications marketing (si applicable)</li>
              <li>• <strong>Obligation légale :</strong> Pour respecter nos obligations réglementaires</li>
            </ul>
          </div>
        </div>

        {/* Destinataires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Destinataires des données</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Vos données personnelles peuvent être partagées avec :
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Notre équipe :</strong> Personnel autorisé de PolUX pour la gestion du service</li>
              <li>• <strong>Prestataires techniques :</strong> Vercel (hébergement) et Supabase (base de données)</li>
              <li>• <strong>Autorités :</strong> En cas d'obligation légale ou de demande judiciaire</li>
              <li>• <strong>Utilisateurs :</strong> Informations publiques des initiatives (nom, description, localisation)</li>
            </ul>
          </div>
        </div>

        {/* Durée de conservation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Durée de conservation</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Données de compte</h3>
              <p>Conservées pendant toute la durée de votre inscription, puis 3 ans après la dernière activité.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Données de navigation</h3>
              <p>Conservées pendant 13 mois maximum.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contenu publié</h3>
              <p>Conservé pendant toute la durée de vie de la plateforme, sauf suppression demandée.</p>
            </div>
          </div>
        </div>

        {/* Vos droits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Vos droits</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <span className="text-gray-700 font-medium">Droit d'accès</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs font-bold">2</span>
                </div>
                <span className="text-gray-700 font-medium">Droit de rectification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xs font-bold">3</span>
                </div>
                <span className="text-gray-700 font-medium">Droit à l'effacement</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xs font-bold">4</span>
                </div>
                <span className="text-gray-700 font-medium">Droit à la portabilité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">5</span>
                </div>
                <span className="text-gray-700 font-medium">Droit d'opposition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-xs font-bold">6</span>
                </div>
                <span className="text-gray-700 font-medium">Droit de limitation</span>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Pour exercer vos droits, contactez-nous à <strong>solene@pol-ux.fr</strong>. 
              Nous répondrons dans un délai maximum de 30 jours.
            </p>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sécurité des données</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
              protéger vos données personnelles contre :
            </p>
            <ul className="space-y-2 ml-4">
              <li>• L'accès non autorisé</li>
              <li>• La divulgation accidentelle</li>
              <li>• La modification ou destruction non autorisée</li>
              <li>• La perte accidentelle</li>
            </ul>
            <p>
              Ces mesures incluent le chiffrement des données, l'authentification sécurisée, 
              les sauvegardes régulières et la formation de notre personnel.
            </p>
          </div>
        </div>

        {/* Contact DPO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact et réclamations</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              vous pouvez nous contacter :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Email : solene@pol-ux.fr</p>
              <p className="text-sm text-gray-600 mt-1">
                Vous avez également le droit de déposer une réclamation auprès de la CNIL 
                (Commission Nationale de l'Informatique et des Libertés) si vous estimez que 
                vos droits ne sont pas respectés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
