'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UseLogoutOptions {
  redirectTo?: string
  showToast?: boolean
}

export function useLogout(options: UseLogoutOptions = {}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { redirectTo = '/', showToast = true } = options

  const logout = async (): Promise<boolean> => {
    try {
      setIsLoggingOut(true)
      console.log('🔄 Déconnexion en cours...')
      
      console.log('✅ Déconnexion réussie')
      if (showToast) {
        toast.success('Déconnexion réussie')
      }
      
      // Rediriger vers la page spécifiée
      router.push(redirectTo)
      return true
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      if (showToast) {
        toast.error('Erreur lors de la déconnexion')
      }
      
      // Même en cas d'erreur, rediriger
      router.push(redirectTo)
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
