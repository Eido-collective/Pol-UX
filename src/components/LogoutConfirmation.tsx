'use client'

import { useLogout } from '@/hooks/useLogout'
import { LogOut, X, AlertTriangle } from 'lucide-react'

interface LogoutConfirmationProps {
  isOpen: boolean
  onClose: () => void
}

export default function LogoutConfirmation({ isOpen, onClose }: LogoutConfirmationProps) {
  const { logout, isLoggingOut } = useLogout({ showToast: false })

  const handleLogout = async () => {
    try {
      const success = await logout()
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-xl shadow-theme-xl border border-theme-primary p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-theme-primary">Confirmer la déconnexion</h2>
          </div>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
            disabled={isLoggingOut}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-theme-secondary mb-6">
          Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-theme-secondary border border-theme-primary rounded-lg hover:bg-theme-secondary transition-colors"
            disabled={isLoggingOut}
          >
            Annuler
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Déconnexion...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
