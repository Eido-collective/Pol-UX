'use client'

import { MapPin, Users, Lightbulb, Globe, Leaf, Mail } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-theme-primary mb-4">À propos de PolUX</h1>
          <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
            Découvrez notre mission et notre équipe dédiée au numérique écoresponsable
          </p>
        </div>

        {/* Mission */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Notre Mission</h2>
          </div>
          <p className="text-theme-secondary leading-relaxed">
            PolUX est une plateforme collaborative dédiée à la promotion des initiatives écologiques 
            dans le secteur du numérique. Notre objectif est de connecter les acteurs du développement 
            durable, de faciliter le partage de bonnes pratiques et d&apos;accélérer la transition 
            vers un numérique plus responsable.
          </p>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-theme-primary">Localisation</h3>
              </div>
              <p className="text-theme-secondary text-sm">
                Initiatives géolocalisées partout en France
              </p>
            </div>

            <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-theme-primary">Communauté</h3>
              </div>
              <p className="text-theme-secondary text-sm">
                Acteurs engagés dans la transition écologique
              </p>
            </div>

            <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-theme-primary">Innovation</h3>
              </div>
              <p className="text-theme-secondary text-sm">
                Solutions numériques écoresponsables
              </p>
            </div>
          </div>
        </div>

        {/* Équipe */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary">Notre Équipe</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Solène Zulfiqar</h3>
              <p className="text-theme-secondary mb-2">Fondatrice et Responsable</p>
              <p className="text-theme-secondary text-sm">
                Passionnée par l&apos;écologie et le numérique, Solène a créé PolUX pour 
                faciliter la mise en relation des acteurs du numérique écoresponsable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">WGC Concept</h3>
              <p className="text-theme-secondary mb-2">Entreprise Individuelle</p>
              <p className="text-theme-secondary text-sm">
                Structure porteuse du projet PolUX, spécialisée dans le développement 
                de solutions numériques écoresponsables et l&apos;accompagnement de la 
                transition écologique.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Contact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Email</p>
                <a 
                  href="mailto:solene@pol-ux.fr" 
                  className="text-theme-primary hover:text-green-600 transition-colors"
                >
                  solene@pol-ux.fr
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Site web</p>
                <a 
                  href="https://www.pol-ux.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-theme-primary hover:text-green-600 transition-colors"
                >
                  www.pol-ux.fr
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
