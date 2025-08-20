'use client'

import { Heart, MapPin, Users, Lightbulb, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos de PolUX</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Carte interactive dédiée aux acteurs, initiatives et ressources sur le numérique écoresponsable. 
            Favorisons ensemble la transition numérique écologique.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notre Mission</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            PolUX est née de la conviction que le numérique peut et doit être un levier pour la transition écologique. 
            Notre plateforme vise à connecter les acteurs du numérique écoresponsable, à valoriser leurs initiatives 
            et à faciliter l&apos;accès aux ressources nécessaires pour un numérique plus durable.
          </p>
        </div>

        {/* Valeurs */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Localisation</h3>
            <p className="text-gray-600 text-sm">
              Cartographier et localiser les initiatives pour faciliter les rencontres et collaborations locales.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Communauté</h3>
            <p className="text-gray-600 text-sm">
              Créer une communauté engagée autour du numérique écoresponsable et favoriser les échanges.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
            <p className="text-gray-600 text-sm">
              Promouvoir l&apos;innovation responsable et partager les bonnes pratiques du numérique durable.
            </p>
          </div>
        </div>

        {/* Équipe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notre Équipe</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Solène Zulfiqar</h3>
              <p className="text-gray-600 mb-2">Fondatrice et Responsable</p>
              <p className="text-gray-700 text-sm">
                Passionnée par le numérique écoresponsable, Solène a créé PolUX pour connecter 
                les acteurs de la transition numérique écologique et faciliter l&apos;accès aux ressources.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WGC Concept</h3>
              <p className="text-gray-600 mb-2">Entreprise Individuelle</p>
              <p className="text-gray-700 text-sm">
                Structure porteuse du projet PolUX, spécialisée dans le développement de solutions 
                numériques écoresponsables et l&apos;accompagnement de la transition écologique.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-green-600" />
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
      </div>
    </div>
  )
}
