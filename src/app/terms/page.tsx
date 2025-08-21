'use client'

import { FileText, Shield, Users, AlertTriangle, CheckCircle, Mail } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">Conditions d&apos;utilisation</h1>
          <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
            Conditions générales d&apos;utilisation de la plateforme PolUX
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Présentation</h2>
          </div>
          <p className="text-theme-secondary leading-relaxed">
            Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;utilisation de la plateforme 
            PolUX, accessible à l&apos;adresse www.pol-ux.fr. En utilisant cette plateforme, vous acceptez 
            d&apos;être lié par ces conditions.
          </p>
        </div>

        {/* Définitions */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Définitions</h2>
          <div className="space-y-4 text-theme-secondary">
            <div>
              <strong>PolUX :</strong> Plateforme web dédiée aux acteurs, initiatives et ressources 
              sur le numérique écoresponsable.
            </div>
            <div>
              <strong>Utilisateur :</strong> Toute personne qui utilise la plateforme PolUX, 
              qu&apos;elle soit inscrite ou non.
            </div>
            <div>
              <strong>Initiative :</strong> Contenu créé par un utilisateur décrivant un projet, 
              événement, acteur ou entreprise lié au numérique écoresponsable.
            </div>
            <div>
              <strong>Éditeur :</strong> WGC Concept, entreprise individuelle responsable de la plateforme.
            </div>
          </div>
        </div>

        {/* Acceptation des conditions */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Acceptation des conditions</h2>
          </div>
          <div className="space-y-4 text-theme-secondary">
            <p>
              En accédant et en utilisant la plateforme PolUX, vous acceptez d&apos;être lié par ces 
              conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas 
              utiliser la plateforme.
            </p>
            <p>
              Ces conditions peuvent être modifiées à tout moment. Les modifications prendront effet 
              dès leur publication sur la plateforme. Il est de votre responsabilité de consulter 
              régulièrement ces conditions.
            </p>
          </div>
        </div>

        {/* Utilisation de la plateforme */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Utilisation de la plateforme</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-3">Utilisation autorisée</h3>
              <ul className="space-y-2 text-theme-secondary ml-4">
                <li>• Consulter les initiatives publiées sur la carte interactive</li>
                <li>• Créer un compte utilisateur pour publier des initiatives</li>
                <li>• Participer aux discussions et commentaires</li>
                <li>• Utiliser les fonctionnalités de recherche et de filtrage</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-3">Utilisation interdite</h3>
              <ul className="space-y-2 text-theme-secondary ml-4">
                <li>• Publier du contenu illégal, diffamatoire ou offensant</li>
                <li>• Violer les droits de propriété intellectuelle</li>
                <li>• Tenter d&apos;accéder aux systèmes de manière non autorisée</li>
                <li>• Utiliser la plateforme à des fins commerciales non autorisées</li>
                <li>• Publier des informations personnelles sans consentement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Création de compte */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Création de compte</h2>
          </div>
          <div className="space-y-4 text-theme-secondary">
            <p>
              Pour publier des initiatives, vous devez créer un compte utilisateur. Vous vous engagez à :
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Fournir des informations exactes et à jour</li>
              <li>• Protéger la confidentialité de vos identifiants</li>
              <li>• Notifier immédiatement toute utilisation non autorisée</li>
              <li>• Être responsable de toutes les activités effectuées sous votre compte</li>
            </ul>
            <p>
              PolUX se réserve le droit de suspendre ou supprimer tout compte en cas de violation 
              de ces conditions.
            </p>
          </div>
        </div>

        {/* Publication de contenu */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Publication de contenu</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-3">Responsabilité</h3>
              <p className="text-theme-secondary">
                Vous êtes entièrement responsable du contenu que vous publiez sur la plateforme. 
                Vous garantissez que ce contenu est exact, légal et respecte les droits des tiers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-3">Contenu autorisé</h3>
              <ul className="space-y-2 text-theme-secondary ml-4">
                <li>• Initiatives liées au numérique écoresponsable</li>
                <li>• Événements, projets et acteurs du secteur</li>
                <li>• Informations utiles à la communauté</li>
                <li>• Contenu respectueux et constructif</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-3">Contenu interdit</h3>
              <ul className="space-y-2 text-theme-secondary ml-4">
                <li>• Contenu illégal ou diffamatoire</li>
                <li>• Spam ou publicité non autorisée</li>
                <li>• Contenu offensant ou discriminatoire</li>
                <li>• Violation de droits d&apos;auteur</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Propriété intellectuelle */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Propriété intellectuelle</h2>
          <div className="space-y-4 text-theme-secondary">
            <p>
              <strong>Contenu de PolUX :</strong> La plateforme et son contenu original sont protégés 
              par les droits d&apos;auteur. Toute reproduction sans autorisation est interdite.
            </p>
            <p>
              <strong>Contenu utilisateur :</strong> Vous conservez vos droits sur le contenu que vous 
              publiez, mais accordez à PolUX une licence non exclusive pour l&apos;utiliser sur la plateforme.
            </p>
            <p>
              <strong>Marques :</strong> Les marques et logos utilisés appartiennent à leurs propriétaires respectifs.
            </p>
          </div>
        </div>

        {/* Limitation de responsabilité */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Limitation de responsabilité</h2>
          </div>
          <div className="space-y-4 text-theme-secondary">
            <p>
              PolUX s&apos;efforce de maintenir la plateforme accessible et fonctionnelle, mais ne peut 
              garantir une disponibilité continue ou l&apos;absence d&apos;erreurs.
            </p>
            <p>
              PolUX ne peut être tenu responsable :
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Du contenu publié par les utilisateurs</li>
              <li>• Des dommages indirects ou accessoires</li>
              <li>• Des pertes de données ou interruptions de service</li>
              <li>• Des actions de tiers non contrôlés par PolUX</li>
            </ul>
          </div>
        </div>

        {/* Protection des données */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Protection des données</h2>
          </div>
          <div className="space-y-4 text-theme-secondary">
            <p>
              La collecte et le traitement de vos données personnelles sont régis par notre 
              <a href="/politique-confidentialite" className="text-blue-600 hover:text-blue-700 font-medium">
                Politique de confidentialité
              </a>.
            </p>
            <p>
              En utilisant la plateforme, vous consentez à la collecte et au traitement de vos 
              données conformément à cette politique.
            </p>
          </div>
        </div>

        {/* Résiliation */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Résiliation</h2>
          <div className="space-y-4 text-theme-secondary">
            <p>
              Vous pouvez supprimer votre compte à tout moment en nous contactant. PolUX peut 
              également suspendre ou supprimer votre compte en cas de violation de ces conditions.
            </p>
            <p>
              En cas de résiliation, vos données personnelles seront supprimées conformément à 
              notre politique de confidentialité, mais le contenu public pourra être conservé.
            </p>
          </div>
        </div>

        {/* Droit applicable */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Droit applicable</h2>
          <div className="space-y-4 text-theme-secondary">
            <p>
              Ces conditions sont régies par le droit français. Tout litige sera soumis à la 
              compétence des tribunaux français.
            </p>
            <p>
              Si une disposition de ces conditions est jugée invalide, les autres dispositions 
              resteront en vigueur.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Contact</h2>
          <div className="space-y-4 text-theme-secondary">
            <p>
              Pour toute question concernant ces conditions d&apos;utilisation, contactez-nous :
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <a 
                href="mailto:solene@pol-ux.fr" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                solene@pol-ux.fr
              </a>
            </div>
            <p className="text-sm text-theme-secondary mt-4">
              Dernière mise à jour : Janvier 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
