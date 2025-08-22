'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

interface UseLogoutOptions {
  redirectTo?: string
  showToast?: boolean
}

export function useLogout(options: UseLogoutOptions = {}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout: authLogout } = useAuth()
  const { showToast = true } = options

  const logout = async (): Promise<boolean> => {
    try {
      setIsLoggingOut(true)
      console.log('🔄 Déconnexion en cours...')
      
      // Utiliser la fonction de déconnexion du contexte d'authentification
      await authLogout()
      
      console.log('✅ Déconnexion réussie')
      if (showToast) {
        toast.success('Déconnexion réussie')
      }
      
      return true
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      if (showToast) {
        toast.error('Erreur lors de la déconnexion')
      }
      
      return false
    } finally {
      setIsLoggingOut(false)
    }
  }

  return {
    logout,
    isLoggingOut
  }
}
