'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, Clock, User, Mail, Shield } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur'
      case 'CONTRIBUTOR':
        return 'Contributeur'
      case 'EXPLORER':
        return 'Explorateur'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-600 bg-red-100'
      case 'CONTRIBUTOR':
        return 'text-blue-600 bg-blue-100'
      case 'EXPLORER':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">Tableau de bord</h1>
          <p className="text-theme-secondary">Bienvenue sur votre espace personnel</p>
        </div>

        {/* Informations utilisateur */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">Profil utilisateur</h2>
              <p className="text-theme-secondary">Vos informations personnelles</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Nom complet
                </label>
                <p className="text-theme-primary font-medium">
                  {user.name || 'Non renseigné'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Nom d&apos;utilisateur
                </label>
                <p className="text-theme-primary font-medium">@{user.username}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Adresse email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-theme-secondary" />
                  <p className="text-theme-primary font-medium">{user.email}</p>
                  {user.emailConfirmed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                {!user.emailConfirmed && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Email non confirmé
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Rôle
                </label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-theme-secondary" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Statut du compte
                </label>
                <div className="flex items-center gap-2">
                  {user.emailConfirmed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Compte actif</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">En attente de confirmation</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Permissions
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-theme-primary">Consulter le contenu</span>
                  </div>
                  {user.role !== 'EXPLORER' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-theme-primary">Créer du contenu</span>
                    </div>
                  )}
                  {user.role === 'ADMIN' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-theme-primary">Modération et administration</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Carte des initiatives</h3>
            <p className="text-theme-secondary text-sm mb-4">
              Découvrez et gérez les initiatives écologiques
            </p>
            <Link
              href="/map"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accéder à la carte
            </Link>
          </div>

          <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Forum</h3>
            <p className="text-theme-secondary text-sm mb-4">
              Participez aux discussions de la communauté
            </p>
            <Link
              href="/forum"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir le forum
            </Link>
          </div>

          <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Conseils écologiques</h3>
            <p className="text-theme-secondary text-sm mb-4">
              Découvrez des conseils pour un mode de vie plus vert
            </p>
            <Link
              href="/tips"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir les conseils
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
