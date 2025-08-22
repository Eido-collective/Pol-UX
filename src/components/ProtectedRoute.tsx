'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Afficher le fallback ou un loader pendant le chargement
  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Chargement...</p>
        </div>
      </div>
    )
  }

  // Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    return fallback || (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  // Vérifier le rôle si requis
  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return fallback || (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-theme-primary mb-2">Accès refusé</h2>
          <p className="text-theme-secondary mb-4">
                          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  // Afficher le contenu protégé
  return <>{children}</>
}
