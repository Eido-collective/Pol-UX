'use client'

import { Building, Mail, Globe, Shield, FileText } from 'lucide-react'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions légales</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Informations légales concernant le site PolUX et ses services
          </p>
        </div>

        {/* Éditeur */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Éditeur</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WGC Concept</h3>
              <p className="text-gray-600 mb-1">Entreprise Individuelle</p>
              <p className="text-gray-700">
                Structure porteuse du projet PolUX, spécialisée dans le développement de solutions 
                numériques écoresponsables et l&apos;accompagnement de la transition écologique.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsable de publication</h3>
              <p className="text-gray-700">Solène Zulfiqar</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a 
                  href="mailto:solene@pol-ux.fr" 
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  solene@pol-ux.fr
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Site web</p>
                <a 
                  href="https://www.pol-ux.fr" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.pol-ux.fr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Hébergement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hébergement</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vercel</h3>
              <p className="text-gray-700 mb-2">
                Plateforme de déploiement et d&apos;hébergement pour applications web modernes.
              </p>
              <p className="text-gray-600 text-sm">
                Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supabase</h3>
              <p className="text-gray-700 mb-2">
                Plateforme de base de données et d&apos;authentification.
              </p>
              <p className="text-gray-600 text-sm">
                Adresse : 201 Post Street, San Francisco, CA 94108, États-Unis
              </p>
            </div>
          </div>
        </div>

        {/* Propriété intellectuelle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Propriété intellectuelle</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur 
              et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
              les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p>
              La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit 
              est formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
            <p>
              Les marques et logos utilisés sur ce site sont la propriété de leurs détenteurs respectifs.
            </p>
          </div>
        </div>

        {/* Responsabilité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Responsabilité</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est 
              périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions 
              ou des lacunes.
            </p>
            <p>
              Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de 
              bien vouloir le signaler par email à l&apos;adresse solene@pol-ux.fr, en décrivant le problème 
              de la manière la plus précise possible.
            </p>
            <p>
              Tout contenu téléchargé se fait aux risques et périls de l&apos;utilisateur et sous sa seule 
              responsabilité. En conséquence, PolUX ne saurait être tenu responsable d&apos;un quelconque 
              dommage subi par l&apos;ordinateur de l&apos;utilisateur ou d&apos;une quelconque perte de données 
              consécutives au téléchargement.
            </p>
          </div>
        </div>

        {/* Liens hypertextes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Liens hypertextes</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Les liens hypertextes mis en place dans le cadre du présent site web en direction d&apos;autres 
              ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de PolUX.
            </p>
            <p>
              Les utilisateurs et visiteurs du site web ne peuvent pas mettre en place un hyperlien 
              en direction de ce site sans l&apos;autorisation expresse et préalable de PolUX.
            </p>
          </div>
        </div>

        {/* Droit applicable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Droit applicable</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Tout litige en relation avec l&apos;utilisation du site PolUX est soumis au droit français. 
              Hormis les cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction 
              aux tribunaux compétents de France.
            </p>
            <p>
              Dernière mise à jour : Janvier 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
