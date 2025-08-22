'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page de connexion car il n'y a plus de système de session
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-theme-secondary">Redirection vers la page de connexion...</p>
      </div>
    </div>
  )
}