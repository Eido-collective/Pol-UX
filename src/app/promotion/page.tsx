'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
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
      default: return <AlertTriangle className="h-4 w-4 text-theme-secondary" />
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
      default: return 'bg-theme-tertiary text-theme-secondary'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <span className="text-theme-secondary">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-theme-secondary mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-theme-primary mb-2">Accès refusé</h1>
          <p className="text-theme-secondary">Vous devez être connecté pour accéder à cette page.</p>
          <Link href="/login" className="inline-block mt-4 text-green-600 hover:text-green-700">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-theme-primary mb-4">Demande de Promotion</h1>
          <p className="text-theme-secondary">Demandez une promotion de rôle pour contribuer davantage à la communauté</p>
        </div>

        {/* Formulaire de demande */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">
            Nouvelle demande de promotion
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-theme-primary mb-2">
                Rôle souhaité *
              </label>
              <select
                id="role"
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-theme-card text-theme-primary"
                required
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="CONTRIBUTOR">Contributeur</option>
                <option value="MODERATOR">Modérateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              <p className="text-sm text-theme-secondary mt-1">
                Choisissez le rôle que vous souhaitez obtenir
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-theme-primary mb-2">
                Raison de la demande *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Expliquez pourquoi vous souhaitez cette promotion..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-theme-secondary disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Envoi...' : 'Soumettre la demande'}
              </button>
            </div>
          </form>
        </div>

        {/* Mes demandes */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6 mt-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">
            Mes demandes de promotion
          </h2>
          {userRequests.length === 0 ? (
            <div className="text-center py-8 text-theme-secondary">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-theme-secondary" />
              <p>Aucune demande de promotion</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userRequests.map((request) => (
                <div key={request.id} className="border border-theme-primary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <span className="font-medium text-theme-primary">
                          {getRoleLabel(request.requestedRole)}
                        </span>
                        <p className="text-theme-secondary text-sm mb-2">
                          {request.reason}
                        </p>
                        <div className="text-xs text-theme-secondary">
                          Demande créée le {formatDate(request.createdAt)}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations sur les rôles */}
        <div className="mt-6 bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">
            Informations sur les rôles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-theme-primary rounded-lg p-4">
              <h3 className="font-medium text-theme-primary mb-2">Explorateur</h3>
              <ul className="text-sm text-theme-secondary space-y-1">
                <li>• Consulter le contenu</li>
                <li>• Voter sur les posts</li>
                <li>• Participer aux discussions</li>
              </ul>
            </div>
            <div className="border border-theme-primary rounded-lg p-4">
              <h3 className="font-medium text-theme-primary mb-2">Contributeur</h3>
              <ul className="text-sm text-theme-secondary space-y-1">
                <li>• Toutes les permissions Explorateur</li>
                <li>• Créer des posts</li>
                <li>• Ajouter des initiatives</li>
                <li>• Créer des conseils et articles</li>
              </ul>
            </div>
            <div className="border border-theme-primary rounded-lg p-4">
              <h3 className="font-medium text-theme-primary mb-2">Administrateur</h3>
              <ul className="text-sm text-theme-secondary space-y-1">
                <li>• Toutes les permissions Contributeur</li>
                <li>• Modérer le contenu</li>
                <li>• Gérer les utilisateurs</li>
                <li>• Accès aux statistiques</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
