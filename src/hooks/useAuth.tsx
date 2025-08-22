'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// Types
export interface SessionUser {
  id: string
  name: string | null
  email: string
  username: string
  role: string
  emailConfirmed: boolean
}

interface AuthContextType {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<boolean>
  refreshSession: () => Promise<void>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}

// Contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

// Provider d'authentification
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Récupérer la session utilisateur
  const fetchSession = async () => {
    try {
      console.log('🔄 Récupération de la session...')
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          console.log('✅ Session trouvée:', data.user.email)
          setUser(data.user)
        } else {
          console.log('⚠️ Pas d\'utilisateur dans la réponse')
          setUser(null)
        }
      } else if (response.status === 401) {
        console.log('🔒 Non authentifié (401)')
        setUser(null)
      } else {
        console.log('❌ Erreur de réponse:', response.status)
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success('Connexion réussie !')
        return true
      } else {
        toast.error(data.error || 'Erreur de connexion')
        return false
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      toast.error('Erreur de connexion au serveur')
      return false
    }
  }

  // Déconnexion
  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Déconnexion en cours...')
      
      // Nettoyer l'état utilisateur immédiatement
      setUser(null)
      console.log('✅ Déconnexion réussie')
      toast.success('Déconnexion réussie')
      
      // Forcer le rafraîchissement de la session pour s'assurer que l'état est cohérent
      await fetchSession()
      
      // Rediriger vers la page d'accueil
      router.push('/')
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      toast.error('Erreur lors de la déconnexion')
      
      // Même en cas d'erreur, nettoyer l'état utilisateur localement
      setUser(null)
      await fetchSession()
      router.push('/')
    }
  }

  // Inscription
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Compte créé avec succès !')
        return true
      } else {
        toast.error(data.error || 'Erreur lors de l\'inscription')
        return false
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      toast.error('Erreur lors de l\'inscription')
      return false
    }
  }

  // Rafraîchir la session
  const refreshSession = async (): Promise<void> => {
    await fetchSession()
  }

  // Charger la session au montage du composant
  useEffect(() => {
    fetchSession()
  }, [])

  // Effet pour nettoyer l'état quand l'utilisateur change
  useEffect(() => {
    if (!user) {
      // Si l'utilisateur est null, s'assurer que l'état est bien nettoyé
      setUser(null)
    }
  }, [user])

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
