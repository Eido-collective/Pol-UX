'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Connexion réussie !')
        router.push('/dashboard')
      } else {
        toast.error(data.error || 'Erreur de connexion')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      toast.error('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="min-h-screen bg-theme-secondary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-theme-primary mb-6">Test d&apos;authentification</h1>
        
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Système de session supprimé</h2>
                      <p className="text-theme-secondary mb-4">
              Le système de session utilisateur a été supprimé de l&apos;application.
              Les fonctionnalités d&apos;inscription et de connexion sont conservées mais ne créent plus de sessions persistantes.
            </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Note importante :</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Les utilisateurs peuvent toujours s&apos;inscrire et se connecter</li>
              <li>• Aucune session n&apos;est créée ou maintenue</li>
              <li>• Les pages protégées redirigent vers la page de connexion</li>
              <li>• Les API routes retournent des erreurs d&apos;authentification</li>
            </ul>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-theme-primary mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-theme-primary rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-primary mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-theme-primary rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tester la connexion
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
