'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, CheckCircle } from 'lucide-react'

export default function LogoutPage() {
  const { user, logout } = useAuth()

  useEffect(() => {
    // Si l'utilisateur est connecté, le déconnecter automatiquement
    if (user) {
      const performLogout = async () => {
        try {
          console.log('🔄 Déconnexion automatique depuis la page logout...')
          await logout()
        } catch (error) {
          console.error('❌ Erreur lors de la déconnexion automatique:', error)
        }
      }
      
      performLogout()
    } else {
      console.log('ℹ️ Aucun utilisateur connecté, redirection...')
      // Si aucun utilisateur n'est connecté, rediriger après un délai
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  }, [user, logout])

  return (
    <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-theme-card rounded-xl shadow-theme-lg border border-theme-primary p-8 text-center">
          {user ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-theme-primary mb-2">
                Déconnexion en cours...
              </h1>
              <p className="text-theme-secondary mb-6">
                Nous vous déconnectons de votre compte.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-theme-primary mb-2">
                Déconnexion réussie !
              </h1>
              <p className="text-theme-secondary mb-6">
                Vous avez été déconnecté avec succès de votre compte.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
