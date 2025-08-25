'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { register } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire'
    }

    if (!formData.email) {
              newErrors.email = 'L&apos;email est obligatoire'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
              newErrors.email = 'Format d&apos;email invalide'
    }

    if (!formData.username.trim()) {
              newErrors.username = 'Le nom d&apos;utilisateur est obligatoire'
    } else if (formData.username.length < 3) {
              newErrors.username = 'Le nom d&apos;utilisateur doit contenir au moins 3 caractères'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est obligatoire'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username,
      password: formData.password
    })
    
    if (success) {
      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      })
    }
  }

  return (
    <div className="min-h-screen bg-theme-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-theme-primary">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-theme-secondary">
            Ou{' '}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-theme-primary mb-2">
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  maxLength={50}
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-lg placeholder-theme-secondary text-theme-primary bg-theme-card focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.firstName ? 'border-red-500' : 'border-theme-primary'
                  }`}
                  placeholder="Prénom"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-theme-primary mb-2">
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  maxLength={50}
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-lg placeholder-theme-secondary text-theme-primary bg-theme-card focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.lastName ? 'border-red-500' : 'border-theme-primary'
                  }`}
                  placeholder="Nom"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-theme-primary mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-theme-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={100}
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-7 pr-3 py-2 border rounded-lg placeholder-theme-secondary text-theme-primary bg-theme-card focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-theme-primary'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-theme-primary mb-2">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-theme-secondary" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  maxLength={30}
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-7 pr-3 py-2 border rounded-lg placeholder-theme-secondary text-theme-primary bg-theme-card focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.username ? 'border-red-500' : 'border-theme-primary'
                  }`}
                  placeholder="nom_utilisateur"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-primary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-theme-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-7 pr-12 py-2 border rounded-lg placeholder-theme-secondary text-theme-primary bg-theme-card focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500' : 'border-theme-primary'
                  }`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-theme-secondary hover:text-theme-primary transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-theme-secondary hover:text-theme-primary transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-primary mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-theme-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-7 pr-12 py-2 border rounded-lg placeholder-theme-secondary text-theme-primary bg-theme-card focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-theme-primary'
                  }`}
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-theme-secondary hover:text-theme-primary transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-theme-secondary hover:text-theme-primary transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Créer mon compte
            </button>
          </div>

          <div className="text-center text-sm text-theme-secondary">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-500 transition-colors">
                              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-500 transition-colors">
              politique de confidentialité
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
