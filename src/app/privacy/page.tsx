'use client'

import Link from 'next/link'
import { Shield, Mail, Building, User } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary mb-4">Politique de Confidentialité</h1>
          <p className="text-theme-secondary">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        {/* Contenu */}
        <div className="bg-theme-card rounded-lg shadow-theme-lg border border-theme-primary p-8">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">1. Introduction</h2>
                <p className="text-theme-secondary leading-relaxed">
                  Pol-UX s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité 
                  explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
              </section>

              {/* Collecte des données */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">2. Collecte des Données</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-theme-primary mb-2">Données que vous nous fournissez :</h3>
                    <ul className="list-disc list-inside text-theme-secondary space-y-1 ml-4">
                      <li>Informations de compte (nom, prénom, email, nom d'utilisateur)</li>
                      <li>Contenu que vous publiez (initiatives, articles, conseils, posts forum)</li>
                      <li>Messages et communications</li>
                      <li>Préférences et paramètres</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-theme-primary mb-2">Données collectées automatiquement :</h3>
                    <ul className="list-disc list-inside text-theme-secondary space-y-1 ml-4">
                      <li>Adresse IP et informations de localisation</li>
                      <li>Données de navigation et d'utilisation</li>
                      <li>Cookies et technologies similaires</li>
                      <li>Informations sur votre appareil</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Utilisation des données */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">3. Utilisation des Données</h2>
                <p className="text-theme-secondary leading-relaxed mb-4">
                  Nous utilisons vos données pour :
                </p>
                <ul className="list-disc list-inside text-theme-secondary space-y-1 ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Personnaliser votre expérience</li>
                  <li>Communiquer avec vous</li>
                  <li>Assurer la sécurité de la plateforme</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              {/* Partage des données */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">4. Partage des Données</h2>
                <p className="text-theme-secondary leading-relaxed mb-4">
                  Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf :
                </p>
                <ul className="list-disc list-inside text-theme-secondary space-y-1 ml-4">
                  <li>Avec votre consentement explicite</li>
                  <li>Pour respecter des obligations légales</li>
                  <li>Avec nos prestataires de services (hébergement, email)</li>
                  <li>Pour protéger nos droits et la sécurité des utilisateurs</li>
                </ul>
              </section>

              {/* Sécurité */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">5. Sécurité des Données</h2>
                <p className="text-theme-secondary leading-relaxed">
                  Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre 
                  l'accès non autorisé, la modification, la divulgation ou la destruction. Ces mesures incluent 
                  le chiffrement, l'authentification sécurisée et la surveillance continue de nos systèmes.
                </p>
              </section>

              {/* Vos droits */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">6. Vos Droits</h2>
                <p className="text-theme-secondary leading-relaxed mb-4">
                  Conformément au RGPD, vous avez les droits suivants :
                </p>
                <ul className="list-disc list-inside text-theme-secondary space-y-1 ml-4">
                  <li>Droit d'accès à vos données personnelles</li>
                  <li>Droit de rectification des données inexactes</li>
                  <li>Droit d'effacement de vos données</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité de vos données</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">7. Cookies</h2>
                <p className="text-theme-secondary leading-relaxed mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez 
                  contrôler l'utilisation des cookies via les paramètres de votre navigateur.
                </p>
                <div className="bg-theme-tertiary rounded-lg p-4">
                  <h4 className="font-medium text-theme-primary mb-2">Types de cookies utilisés :</h4>
                  <ul className="list-disc list-inside text-theme-secondary space-y-1 ml-4">
                    <li>Cookies de session (nécessaires au fonctionnement)</li>
                    <li>Cookies de préférences (thème, langue)</li>
                    <li>Cookies analytiques (statistiques d'utilisation)</li>
                  </ul>
                </div>
              </section>

              {/* Conservation */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">8. Conservation des Données</h2>
                <p className="text-theme-secondary leading-relaxed">
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
                  ou pour respecter nos obligations légales. Les données sont supprimées ou anonymisées lorsque 
                  elles ne sont plus nécessaires.
                </p>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">9. Modifications de cette Politique</h2>
                <p className="text-theme-secondary leading-relaxed">
                  Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Les modifications 
                  importantes seront notifiées via notre plateforme ou par email. Nous vous encourageons à consulter 
                  régulièrement cette page.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-theme-primary mb-4">10. Contact</h2>
                <div className="bg-theme-tertiary rounded-lg p-6">
                  <p className="text-theme-secondary mb-4">
                    Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                    contactez-nous :
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="text-theme-secondary">Email : solene@pol-ux.fr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-green-600" />
                      <span className="text-theme-secondary">Entreprise : WGC Concept – Entreprise Individuelle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-theme-secondary">Responsable : Solène Zulfiqar</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
