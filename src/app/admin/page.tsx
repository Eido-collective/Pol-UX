'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, MessageSquare, Lightbulb, BookOpen, Eye, EyeOff, Trash2, UserPlus, Shield } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import ContentFilters from '@/components/ContentFilters'
import ArticleImage from '@/components/ArticleImage'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  createdAt: string
}

interface Initiative {
  id: string
  title: string
  description: string
  type: string
  city: string
  address: string
  isPublished: boolean
  createdAt: string
  author: {
    name: string
    username: string
  }
  startDate?: string
  endDate?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
}

interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  isPublished: boolean
  createdAt: string
  author: {
    name: string
    username: string
  }
  _count: {
    comments: number
    votes: number
  }
}

interface Tip {
  id: string
  title: string
  content: string
  category: string
  imageUrl?: string
  isPublished: boolean
  createdAt: string
  author: {
    name: string
    username: string
  }
  _count: {
    votes: number
  }
}

interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  category: string
  imageUrl?: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  author: {
    name: string
    username: string
  }
  _count: {
    votes: number
  }
}

interface RoleRequest {
  id: string
  status: string
  reason: string
  createdAt: string
  adminNotes?: string
  user: {
    name: string
    username: string
    role: string
  }
  requestedRole: string
}

type ContentType = 'initiatives' | 'posts' | 'tips' | 'articles'

// Type pour les éléments avec _count
type ContentWithCount = (Initiative | ForumPost | Tip | Article) & {
  _count?: {
    comments?: number
    votes?: number
  }
}

// Type pour les éléments avec propriétés optionnelles
type ContentWithOptionalProps = (Initiative | ForumPost | Tip | Article) & {
  description?: string
  content?: string
  excerpt?: string
  category?: string
  imageUrl?: string
  type?: string
  city?: string
  address?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  startDate?: string
  endDate?: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [content, setContent] = useState<{
    initiatives?: Initiative[]
    posts?: ForumPost[]
    tips?: Tip[]
    articles?: Article[]
  }>({})
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ContentWithOptionalProps & { type: string } | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // États pour les filtres et la pagination
  const [filters, setFilters] = useState<{
    initiatives: 'all' | 'published' | 'unpublished'
    posts: 'all' | 'published' | 'unpublished'
    tips: 'all' | 'published' | 'unpublished'
    articles: 'all' | 'published' | 'unpublished'
  }>({
    initiatives: 'all',
    posts: 'all',
    tips: 'all',
    articles: 'all'
  })
  
  const [pagination, setPagination] = useState<{
    initiatives: { page: number; limit: number }
    posts: { page: number; limit: number }
    tips: { page: number; limit: number }
    articles: { page: number; limit: number }
  }>({
    initiatives: { page: 1, limit: 10 },
    posts: { page: 1, limit: 10 },
    tips: { page: 1, limit: 10 },
    articles: { page: 1, limit: 10 }
  })

  // États pour la gestion du scroll et de la fermeture des modales
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showDetailsModal])

  // Fermer la modale avec Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetailsModal) {
        closeDetailsModal()
      }
    }

    if (showDetailsModal) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showDetailsModal])

  useEffect(() => {
    fetchUsers()
    // Charger tous les contenus au démarrage pour avoir les comptes
    fetchContent('initiatives')
    fetchContent('posts')
    fetchContent('tips')
    fetchContent('articles')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'role-requests') {
      fetchRoleRequests()
    } else if (['initiatives', 'posts', 'tips', 'articles'].includes(activeTab)) {
      fetchContent(activeTab as ContentType)
    }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async (type: ContentType) => {
    try {
      const currentFilter = filters[type]
      const currentPagination = pagination[type]
      
      const params = new URLSearchParams({
        type,
        page: currentPagination.page.toString(),
        limit: currentPagination.limit.toString()
      })
      
      if (currentFilter !== 'all') {
        params.append('status', currentFilter)
      }
      
      const response = await fetch(`/api/admin/content?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContent(prevContent => ({
          ...prevContent,
          [type]: data[type]
        }))
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de ${type}:`, error)
      toast.error(`Erreur lors du chargement de ${type}`)
    }
  }

  const handleContentAction = async (type: ContentType, id: string, action: 'publish' | 'unpublish' | 'delete') => {
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/content/${type}/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await fetchContent(type)
          toast.success('Contenu supprimé avec succès')
        } else {
          toast.error('Erreur lors de la suppression')
        }
      } else {
        const response = await fetch(`/api/admin/content/${type}/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action })
        })
        if (response.ok) {
          await fetchContent(type)
          toast.success(`Contenu ${action === 'publish' ? 'publié' : 'dépublié'} avec succès`)
        } else {
          toast.error(`Erreur lors de ${action === 'publish' ? 'la publication' : 'la dépublication'}`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error)
      toast.error('Erreur lors de l\'action')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      if (response.ok) {
        await fetchUsers()
        toast.success('Rôle modifié avec succès')
      } else {
        toast.error('Erreur lors du changement de rôle')
      }
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error)
      toast.error('Erreur lors du changement de rôle')
    }
  }

  const fetchRoleRequests = async () => {
    setLoadingRequests(true)
    try {
      const response = await fetch('/api/role-requests')
      if (response.ok) {
        const data = await response.json()
        setRoleRequests(data.roleRequests)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de promotion:', error)
      toast.error('Erreur lors de la récupération des demandes')
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleProcessRoleRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch(`/api/role-requests/${requestId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, adminNotes })
      })
      if (response.ok) {
        await fetchRoleRequests()
        await fetchUsers()
        toast.success(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`)
      } else {
        toast.error('Erreur lors du traitement de la demande')
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la demande:', error)
      toast.error('Erreur lors du traitement de la demande')
    }
  }

  const showDetails = (item: ContentWithCount, type: string) => {
    setSelectedItem({ ...item, type })
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedItem(null)
  }

  const handleFilterChange = (type: ContentType, filter: 'all' | 'published' | 'unpublished') => {
    setFilters(prev => ({ ...prev, [type]: filter }))
    setPagination(prev => ({ ...prev, [type]: { ...prev[type], page: 1 } }))
    // Recharger le contenu avec le nouveau filtre
    setTimeout(() => fetchContent(type), 0)
  }

  // Fonction pour la pagination (prête pour une utilisation future)
  // const handlePageChange = (type: ContentType, page: number) => {
  //   setPagination(prev => ({ ...prev, [type]: { ...prev[type], page } }))
  //   // Recharger le contenu avec la nouvelle page
  //   setTimeout(() => fetchContent(type), 0)
  // }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'EXPLORER': return 'Explorateur'
      case 'CONTRIBUTOR': return 'Contributeur'
      case 'ADMIN': return 'Administrateur'
      default: return role
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'EVENT': return 'Événement'
      case 'PROJECT': return 'Projet'
      case 'ASSOCIATION': return 'Association'
      case 'COMPANY': return 'Entreprise'
      default: return type
    }
  }

  const getCategoryLabel = (category: string, type: string) => {
    if (type === 'tips') {
      switch (category) {
        case 'WASTE_REDUCTION': return 'Réduction des déchets'
        case 'ENERGY_SAVING': return 'Économie d\'énergie'
        case 'TRANSPORT': return 'Transport'
        case 'FOOD': return 'Alimentation'
        case 'WATER': return 'Eau'
        case 'CONSUMPTION': return 'Consommation'
        case 'OTHER': return 'Autre'
        default: return category
      }
    } else if (type === 'posts') {
      switch (category) {
        case 'GENERAL': return 'Général'
        case 'EVENTS': return 'Événements'
        case 'PROJECTS': return 'Projets'
        case 'TIPS': return 'Conseils'
        case 'NEWS': return 'Actualités'
        case 'DISCUSSION': return 'Discussion'
        default: return category
      }
    } else if (type === 'articles') {
      switch (category) {
        case 'ENVIRONMENT': return 'Environnement'
        case 'SUSTAINABILITY': return 'Développement durable'
        case 'CLIMATE_CHANGE': return 'Changement climatique'
        case 'BIODIVERSITY': return 'Biodiversité'
        case 'RENEWABLE_ENERGY': return 'Énergies renouvelables'
        case 'CIRCULAR_ECONOMY': return 'Économie circulaire'
        case 'GREEN_TECHNOLOGY': return 'Technologies vertes'
        case 'CONSERVATION': return 'Conservation'
        case 'EDUCATION': return 'Éducation'
        case 'POLICY': return 'Politique'
        default: return category
      }
    }
    return category
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderContentList = (items: ContentWithCount[], type: ContentType) => {
    const currentFilter = filters[type]
    
    // Filtrer les éléments côté client pour l'affichage
    const filteredItems = items.filter(item => {
      if (currentFilter === 'published') return item.isPublished
      if (currentFilter === 'unpublished') return !item.isPublished
      return true
    })

    const filterOptions = [
      { value: 'all', label: 'Tous', count: items.length },
      { value: 'published', label: 'Publiés', count: items.filter(item => item.isPublished).length },
      { value: 'unpublished', label: 'Dépubliés', count: items.filter(item => !item.isPublished).length }
    ]

    return (
      <div className="space-y-4">
        {/* Filtres */}
        <ContentFilters
          options={filterOptions}
          currentFilter={currentFilter}
          onFilterChange={(filter) => handleFilterChange(type, filter as 'all' | 'published' | 'unpublished')}
        />

        {/* Liste des éléments */}
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun contenu trouvé</p>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isPublished ? 'Publié' : 'Dépublié'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {type === 'initiatives' && `${getTypeLabel((item as Initiative).type)} • ${(item as Initiative).city}`}
                      {(type === 'posts' || type === 'tips' || type === 'articles') && getCategoryLabel((item as ForumPost | Tip | Article).category, type)}
                      {' • Par '}{item.author.name || item.author.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      Créé le {formatDate(item.createdAt)}
                      {item._count && (
                        <span className="ml-2">
                          {type === 'posts' && `• ${item._count.comments} commentaires • ${item._count.votes} votes`}
                          {(type === 'tips' || type === 'articles') && `• ${item._count.votes} votes`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => showDetails(item, type)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleContentAction(type, item.id, item.isPublished ? 'unpublish' : 'publish')}
                      className={`p-2 rounded-lg ${
                        item.isPublished 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.isPublished ? 'Dépublier' : 'Publier'}
                    >
                      {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible.')) {
                          handleContentAction(type, item.id, 'delete')
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600">Gestion des utilisateurs et des contenus</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-500">Administrateur</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs ({users.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('initiatives')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'initiatives'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Initiatives ({content.initiatives?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Posts ({content.posts?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tips'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Conseils ({content.tips?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Articles ({content.articles?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('role-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'role-requests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Demandes de Promotion ({roleRequests.filter(r => r.status === 'PENDING').length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Contenu des onglets */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date d&apos;inscription
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="EXPLORER">Explorateur</option>
                              <option value="CONTRIBUTOR">Contributeur</option>
                              <option value="ADMIN">Administrateur</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'initiatives' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion des initiatives</h3>
                {renderContentList(content.initiatives || [], 'initiatives')}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion des posts</h3>
                {renderContentList(content.posts || [], 'posts')}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion des conseils</h3>
                {renderContentList(content.tips || [], 'tips')}
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion des articles</h3>
                {renderContentList(content.articles || [], 'articles')}
              </div>
            )}

            {activeTab === 'role-requests' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Demandes de promotion</h3>
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Chargement...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roleRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {request.user.name} ({request.user.username})
                              </h4>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {getRoleLabel(request.user.role)} → {getRoleLabel(request.requestedRole)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Raison :</strong> {request.reason}
                            </p>
                            <p className="text-xs text-gray-400">
                              Demande créée le {formatDate(request.createdAt)}
                            </p>
                            {request.status === 'PENDING' && (
                              <div className="mt-3">
                                <textarea
                                  placeholder="Note optionnelle pour l'utilisateur..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                  rows={2}
                                  id={`notes-${request.id}`}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {request.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => {
                                    const notes = (document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement)?.value
                                    handleProcessRoleRequest(request.id, 'approve', notes)
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  Approuver
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = (document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement)?.value
                                    handleProcessRoleRequest(request.id, 'reject', notes)
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                  Rejeter
                                </button>
                              </>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'APPROVED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                              </span>
                            )}
                          </div>
                        </div>
                        {request.adminNotes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            <strong>Note de l&apos;admin :</strong> {request.adminNotes}
                          </div>
                        )}
                      </div>
                    ))}
                    {roleRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Aucune demande de promotion</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDetailsModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Détails - {selectedItem.title}
                </h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedItem.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>Par {selectedItem.author.name || selectedItem.author.username}</span>
                    <span>•</span>
                    <span>Créé le {formatDate(selectedItem.createdAt)}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedItem.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedItem.isPublished ? 'Publié' : 'Dépublié'}
                    </span>
                  </div>
                </div>

                {selectedItem.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.content && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contenu</h4>
                    <div className="text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                      {selectedItem.content}
                    </div>
                  </div>
                )}

                {selectedItem.excerpt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Extrait</h4>
                    <p className="text-gray-700">{selectedItem.excerpt}</p>
                  </div>
                )}

                {selectedItem.type === 'initiatives' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Type :</strong> {getTypeLabel(selectedItem.type)}</p>
                        <p><strong>Ville :</strong> {selectedItem.city}</p>
                        <p><strong>Adresse :</strong> {selectedItem.address}</p>
                        {selectedItem.website && <p><strong>Site web :</strong> <a href={selectedItem.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedItem.website}</a></p>}
                        {selectedItem.contactEmail && <p><strong>Email :</strong> {selectedItem.contactEmail}</p>}
                        {selectedItem.contactPhone && <p><strong>Téléphone :</strong> {selectedItem.contactPhone}</p>}
                      </div>
                    </div>
                    {(selectedItem.startDate || selectedItem.endDate) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
                        <div className="space-y-1 text-sm">
                          {selectedItem.startDate && <p><strong>Début :</strong> {formatDate(selectedItem.startDate)}</p>}
                          {selectedItem.endDate && <p><strong>Fin :</strong> {formatDate(selectedItem.endDate)}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedItem.category && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Catégorie</h4>
                    <p className="text-gray-700">{getCategoryLabel(selectedItem.category, selectedItem.type)}</p>
                  </div>
                )}

                {selectedItem.imageUrl && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Image</h4>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      {selectedItem.type === 'articles' ? (
                        <ArticleImage 
                          src={selectedItem.imageUrl} 
                          alt={selectedItem.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full"
                          fallbackIcon={<BookOpen className="h-16 w-16 text-green-600" />}
                        />
                      ) : (
                        <Image 
                          src={selectedItem.imageUrl} 
                          alt={selectedItem.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeDetailsModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      handleContentAction(selectedItem.type as ContentType, selectedItem.id, selectedItem.isPublished ? 'unpublish' : 'publish')
                      closeDetailsModal()
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedItem.isPublished 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedItem.isPublished ? 'Dépublier' : 'Publier'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible.')) {
                        handleContentAction(selectedItem.type as ContentType, selectedItem.id, 'delete')
                        closeDetailsModal()
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}