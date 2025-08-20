'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Leaf, MapPin, MessageSquare, Lightbulb, User, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur'
      case 'CONTRIBUTOR': return 'Contributeur'
      case 'EXPLORER': return 'Explorateur'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800'
      case 'EXPLORER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600">Bienvenue sur votre espace personnel</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-500">
                {session.user.name || session.user.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Informations utilisateur */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Profil utilisateur
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Nom :</span> {session.user.name || 'Non renseigné'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email :</span> {session.user.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Nom d'utilisateur :</span> {session.user.username || 'Non renseigné'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Rôle :</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(session.user.role)}`}>
                    {getRoleLabel(session.user.role)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                <Leaf className="h-8 w-8" />
              </div>
              <p className="text-sm text-gray-500">Pol-UX</p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Initiatives</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Posts Forum</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conseils</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Votes reçus</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <MapPin className="h-4 w-4" />
                Créer une initiative
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <MessageSquare className="h-4 w-4" />
                Nouveau post forum
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                <Lightbulb className="h-4 w-4" />
                Partager un conseil
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Aucune activité récente
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Explorer la carte des initiatives
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Participer au forum
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Découvrir les conseils écologiques
              </div>
            </div>
          </div>
        </div>

        {/* Section Promotion (si pas admin) */}
        {session.user.role !== 'ADMIN' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Demande de Promotion
            </h3>
            <p className="text-blue-700 mb-4">
              Souhaitez-vous accéder à plus de fonctionnalités ? Demandez une promotion de rôle pour créer des initiatives, conseils et articles.
            </p>
            <button 
              onClick={() => router.push('/promotion')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Demander une promotion
            </button>
          </div>
        )}

        {/* Section Admin (si admin) */}
        {session.user.role === 'ADMIN' && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Espace Administrateur
            </h3>
            <p className="text-red-700 mb-4">
              En tant qu'administrateur, vous avez accès à des fonctionnalités de modération et de gestion.
            </p>
            <button 
              onClick={() => router.push('/admin')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Accéder à l'administration
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
