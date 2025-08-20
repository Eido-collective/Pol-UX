'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Leaf, CheckCircle, XCircle, Loader2 } from 'lucide-react'

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de confirmation manquant')
      return
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Une erreur est survenue')
        }
      } catch {
        setStatus('error')
        setMessage('Une erreur est survenue lors de la confirmation')
      }
    }

    confirmEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Confirmation de l&apos;email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Finalisation de votre inscription
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-green-100">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto" />
                <p className="text-gray-600">Confirmation de votre email en cours...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900">Email confirmé !</h3>
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-500">
                  Redirection vers la page de connexion dans quelques secondes...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900">Erreur de confirmation</h3>
                <p className="text-gray-600">{message}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Le lien de confirmation peut &apos;être expiré ou invalide.
                  </p>
                  <Link 
                    href="/register" 
                    className="inline-block text-green-600 hover:text-green-500 font-medium"
                  >
                    Créer un nouveau compte
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
