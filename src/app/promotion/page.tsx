'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface RoleRequest {
  id: string
  requestedRole: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  processedAt?: string
  adminNotes?: string
}

export default function PromotionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requestedRole, setRequestedRole] = useState('CONTRIBUTOR')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userRequests, setUserRequests] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchUserRequests()
    }
  }, [status, router])

  const fetchUserRequests = async () => {
    try {
      const response = await fetch('/api/role-requests/my-requests')
      if (response.ok) {
        const data = await response.json()
        setUserRequests(data.roleRequests)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim() || !session) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/role-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestedRole,
          reason: reason.trim()
        }),
      })

      if (response.ok) {
        setReason('')
        setRequestedRole('CONTRIBUTOR')
        fetchUserRequests()
        toast.success('Demande de promotion envoyée avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de l\'envoi de la demande')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi de la demande')
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CONTRIBUTOR': return 'Contributeur'
      case 'ADMIN': return 'Administrateur'
      default: return role
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'APPROVED': return 'Approuvée'
      case 'REJECTED': return 'Rejetée'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Si l'utilisateur est déjà admin, rediriger
  if (session.user.role === 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  const hasPendingRequest = userRequests.some(req => req.status === 'PENDING')

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au dashboard</span>
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Demande de Promotion
            </h1>
            <p className="text-gray-600">
              Demandez une promotion de rôle pour accéder à plus de fonctionnalités sur Pol-UX.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire de demande */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nouvelle Demande
            </h2>

            {hasPendingRequest ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">
                    Vous avez déjà une demande en attente
                  </span>
                </div>
                <p className="text-yellow-700 mt-2 text-sm">
                  Veuillez attendre la réponse de l&apos;équipe d&apos;administration avant de faire une nouvelle demande.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle demandé
                  </label>
                  <select
                    id="role"
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={session.user.role === 'CONTRIBUTOR'}
                  >
                    <option value="CONTRIBUTOR">Contributeur</option>
                    {session.user.role === 'EXPLORER' && (
                      <option value="ADMIN">Administrateur</option>
                    )}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {requestedRole === 'CONTRIBUTOR' 
                      ? 'Peut créer des initiatives, conseils et articles'
                      : 'Accès complet à toutes les fonctionnalités d\'administration'
                    }
                  </p>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de la demande
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Expliquez pourquoi vous souhaitez cette promotion..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{submitting ? 'Envoi...' : 'Envoyer la demande'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Historique des demandes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Historique des Demandes
            </h2>

            {userRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande de promotion pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className="font-medium text-gray-900">
                          Demande {getRoleLabel(request.requestedRole)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">
                      <strong>Raison :</strong> {request.reason}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      <p>Demande créée le {formatDate(request.createdAt)}</p>
                      {request.processedAt && (
                        <p>Traitée le {formatDate(request.processedAt)}</p>
                      )}
                      {request.adminNotes && (
                        <p className="mt-1">
                          <strong>Note de l&apos;admin :</strong> {request.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informations sur les rôles */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations sur les Rôles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Explorateur</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lecture des contenus</li>
                <li>• Participation au forum</li>
                <li>• Vote sur les posts</li>
                <li>• Commentaires</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Contributeur</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Toutes les fonctionnalités Explorateur</li>
                <li>• Création d&apos;initiatives</li>
                <li>• Publication de conseils</li>
                <li>• Création d&apos;articles</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Administrateur</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Toutes les fonctionnalités Contributeur</li>
                <li>• Modération des contenus</li>
                <li>• Gestion des utilisateurs</li>
                <li>• Traitement des demandes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
