'use client'

import Link from 'next/link'
import { MapPin, MessageSquare, Lightbulb, BookOpen, Users } from 'lucide-react'
import { useStats } from '@/hooks/useStats'
import { useRecentInitiatives } from '@/hooks/useRecentInitiatives'

export default function HomePage() {
  const { stats, isLoading: statsLoading } = useStats()
  const { initiatives, isLoading: initiativesLoading } = useRecentInitiatives()

  const features = [
    {
      title: 'Carte Interactive',
      description: 'Découvrez les initiatives écologiques près de chez vous avec notre carte interactive.',
      icon: MapPin,
      href: '/map',
      color: 'text-blue-500'
    },
    {
      title: 'Forum Collaboratif',
      description: 'Échangez avec la communauté, partagez vos idées et posez vos questions.',
      icon: MessageSquare,
      href: '/forum',
      color: 'text-green-500'
    },
    {
      title: 'Conseils Écologiques',
      description: 'Découvrez des conseils pratiques pour réduire votre impact environnemental.',
      icon: Lightbulb,
      href: '/tips',
      color: 'text-yellow-500'
    },
    {
      title: 'Articles Informatifs',
      description: 'Lisez des articles détaillés sur les enjeux environnementaux et les solutions.',
      icon: BookOpen,
      href: '/articles',
      color: 'text-purple-500'
    }
  ]

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'EVENT': return 'Événement'
      case 'PROJECT': return 'Projet'
      case 'ACTOR': return 'Acteur'
      case 'COMPANY': return 'Entreprise'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EVENT': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'PROJECT': return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'ACTOR': return 'bg-purple-500/20 text-purple-500 border-purple-500/30'
      case 'COMPANY': return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
      default: return 'bg-theme-tertiary text-theme-secondary border-theme-primary'
    }
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Hero Section */}
      <section className="bg-theme-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-6">
              Découvrez et participez aux{' '}
              <span className="text-green-500">initiatives écologiques</span>{' '}
              partout en France
            </h1>
            <p className="text-xl text-theme-secondary mb-8 max-w-3xl mx-auto">
              Rejoignez la communauté Pol-UX pour explorer, partager et contribuer aux projets environnementaux 
              qui façonnent l&apos;avenir de notre planète.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/map"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Explorer la carte
              </Link>
              <Link
                href="/register"
                className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Rejoindre la communauté
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-primary mb-4">
              Une plateforme complète pour l&apos;écologie
            </h2>
            <p className="text-lg text-theme-secondary">
              Tout ce dont vous avez besoin pour découvrir et participer aux initiatives environnementales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group bg-theme-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-theme-primary"
                >
                  <div className="w-12 h-12 rounded-lg bg-theme-tertiary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-theme-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-theme-secondary">
                    {feature.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Initiatives Section */}
      <section className="py-20 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-primary mb-4">
              Initiatives récentes
            </h2>
            <p className="text-lg text-theme-secondary">
              Découvrez les dernières initiatives ajoutées à notre plateforme
            </p>
          </div>

          {initiativesLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-theme-secondary">Chargement des initiatives...</p>
            </div>
          ) : initiatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {initiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="bg-theme-card rounded-xl shadow-lg p-6 border border-theme-primary"
                >
                  <div className="flex items-center justify-between mb-4">
                                         <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(initiative.type)}`}>
                       {getTypeLabel(initiative.type)}
                     </span>
                    <span className="text-sm text-theme-tertiary">
                      {new Date(initiative.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-theme-primary mb-2">
                    {initiative.title}
                  </h3>
                  <p className="text-theme-secondary mb-4 line-clamp-3">
                    {initiative.description}
                  </p>
                  <div className="flex items-center text-sm text-theme-tertiary">
                    <MapPin className="w-4 h-4 mr-1" />
                    {initiative.city}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-theme-secondary">Aucune initiative récente pour le moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/map"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Voir toutes les initiatives
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-primary mb-4">
              Notre communauté en chiffres
            </h2>
            <p className="text-lg text-theme-secondary">
              Les vraies statistiques de notre plateforme
            </p>
          </div>

          {statsLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-theme-secondary">Chargement des statistiques...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-theme-primary mb-2">
                  {stats?.initiatives || 0}
                </div>
                <p className="text-theme-secondary">Initiatives</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-theme-primary mb-2">
                  {stats?.articles || 0}
                </div>
                <p className="text-theme-secondary">Articles</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-theme-primary mb-2">
                  {stats?.tips || 0}
                </div>
                <p className="text-theme-secondary">Conseils</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-theme-primary mb-2">
                  {stats?.forumPosts || 0}
                </div>
                <p className="text-theme-secondary">Posts Forum</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-theme-primary mb-2">
                  {stats?.users || 0}
                </div>
                <p className="text-theme-secondary">Membres</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Créez votre compte gratuitement et commencez à explorer, partager et contribuer aux initiatives écologiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-green-500 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Créer un compte
            </Link>
            <Link
              href="/map"
              className="border-2 border-white text-white hover:bg-white hover:text-green-500 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explorer maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
