'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Leaf, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
      setError('Tous les champs sont obligatoires')
      return false
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Adresse email invalide')
      return false
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
      } else {
        setSuccess(data.message || 'Compte créé avec succès ! Veuillez vérifier votre boîte email pour confirmer votre adresse.')
        // Ne pas rediriger automatiquement, l'utilisateur doit confirmer son email
      }
    } catch (error) {
      setError(`Une erreur est survenue: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-theme-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
                      <h2 className="mt-6 text-2xl md:text-3xl font-bold text-theme-primary">
            Créer un compte Pol-UX
          </h2>
          <p className="mt-2 text-sm text-theme-secondary">
            Rejoignez la communauté écologique
          </p>
          <p className="mt-2 text-center text-sm text-theme-secondary">
            Ou{' '}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
              connectez-vous à votre compte
            </Link>
          </p>
        </div>

        <div className="bg-theme-card py-8 px-6 shadow-theme-lg rounded-lg border border-theme-primary">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-theme-primary">
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-theme-primary rounded-lg shadow-theme-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-theme-primary">
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-theme-primary rounded-lg shadow-theme-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-theme-primary">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-theme-primary rounded-lg shadow-theme-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-theme-primary">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-theme-primary rounded-lg shadow-theme-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="votre_username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-primary">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-theme-primary rounded-lg shadow-theme-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                  placeholder="Au moins 8 caractères"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-theme-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-theme-secondary" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-primary">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-theme-primary rounded-lg shadow-theme-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-theme-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-theme-secondary" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>
        </div>


      </div>
    </div>
  )
}
