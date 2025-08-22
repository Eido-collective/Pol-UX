'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

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
                  // Rediriger vers la page d'accueil après 3 secondes
        setTimeout(() => {
          router.push('/')
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
    <div className="min-h-screen bg-theme-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-green-600" />
          </div>
                      <h2 className="mt-6 text-2xl md:text-3xl font-bold text-theme-primary">
            Confirmation d&apos;email
          </h2>
          <p className="mt-2 text-sm text-theme-secondary">
            Vérification de votre adresse email
          </p>
        </div>

        <div className="bg-theme-card py-8 px-6 shadow-theme-lg rounded-lg border border-theme-primary">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-theme-secondary">Confirmation de votre email en cours...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-primary">Email confirmé !</h3>
              <p className="text-theme-secondary">{message}</p>
              <p className="text-sm text-theme-secondary mt-2">
                Votre compte est maintenant activé.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-primary">Erreur de confirmation</h3>
              <p className="text-theme-secondary">{message}</p>
              <p className="text-sm text-theme-secondary mt-2">
                Veuillez vérifier le lien ou contacter le support.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block bg-theme-primary text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary px-6 py-2 rounded-lg transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          )}
        </div>


      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto" />
          <p className="mt-4 text-theme-secondary">Chargement...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
