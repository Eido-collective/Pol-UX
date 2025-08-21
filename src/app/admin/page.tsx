'use client'

import { useState, useEffect } from 'react'
import { Shield, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ContentFilters from '@/components/ContentFilters'
import Image from 'next/image'

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
  adminResponse?: string
  currentRole: string
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
          <p className="text-theme-secondary text-center py-8">Aucun contenu trouvé</p>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-theme-primary rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-theme-primary">{item.title}</h4>
                                         <p className="text-xs text-theme-secondary mt-1">
                       {formatDate(item.createdAt)}
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-theme-secondary">
                      {item._count?.votes || 0} votes
                    </p>
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
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-theme-secondary">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="bg-theme-secondary">
      {/* Page Header */}
      <div className="bg-theme-card shadow-theme-sm border-b border-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">Administration</h1>
              <p className="text-theme-secondary">Gestion des utilisateurs et des contenus</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-sm text-theme-secondary">Administrateur</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Onglets */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary mb-6">
          <div className="border-b border-theme-primary">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab('initiatives')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'initiatives'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                Initiatives
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                Posts Forum
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tips'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                Conseils
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'articles'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                Articles
              </button>
              <button
                onClick={() => setActiveTab('role-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'role-requests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                Demandes de rôle
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Contenu des onglets */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme-primary">Gestion des utilisateurs</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-theme-primary">
                    <thead className="bg-theme-tertiary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-theme-card divide-y divide-theme-primary">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-theme-primary">{user.name}</div>
                            <div className="text-sm text-theme-secondary">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.role === 'MODERATOR' ? 'bg-yellow-100 text-yellow-800' :
                              user.role === 'CONTRIBUTOR' ? 'bg-blue-100 text-blue-800' :
                              'bg-theme-tertiary text-theme-secondary'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                            <button
                              onClick={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {user.role === 'ADMIN' ? 'Rétrograder' : 'Promouvoir'}
                            </button>
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
                <h3 className="text-lg font-medium text-theme-primary">Gestion des initiatives</h3>
                {renderContentList(content.initiatives || [], 'initiatives')}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme-primary">Gestion des posts</h3>
                {renderContentList(content.posts || [], 'posts')}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme-primary">Gestion des conseils</h3>
                {renderContentList(content.tips || [], 'tips')}
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme-primary">Gestion des articles</h3>
                {renderContentList(content.articles || [], 'articles')}
              </div>
            )}

            {activeTab === 'role-requests' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme-primary">Demandes de promotion</h3>
                {loadingRequests ? (
                  <div className="text-theme-secondary">Chargement...</div>
                ) : (
                  <div className="space-y-4">
                    {roleRequests.map((request) => (
                      <div key={request.id} className="border border-theme-primary rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-theme-primary">
                              {request.user.name || request.user.username}
                            </h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-theme-tertiary text-theme-secondary">
                              {request.currentRole} → {request.requestedRole}
                            </span>
                            <p className="text-sm text-theme-secondary mb-2">
                              {request.reason}
                            </p>
                            <p className="text-xs text-theme-secondary">
                              {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                                                         <div className="flex gap-2">
                               <button
                                 onClick={() => handleProcessRoleRequest(request.id, 'approve')}
                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                               >
                                 Approuver
                               </button>
                               <button
                                 onClick={() => handleProcessRoleRequest(request.id, 'reject')}
                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                               >
                                 Rejeter
                               </button>
                             </div>
                          </div>
                        </div>
                                                 {request.adminNotes && (
                           <div className="mt-2 p-2 bg-theme-tertiary rounded text-xs text-theme-secondary">
                             Note de l&apos;admin: {request.adminNotes}
                           </div>
                         )}
                      </div>
                    ))}
                    {roleRequests.length === 0 && (
                      <p className="text-theme-secondary text-center py-8">Aucune demande de promotion</p>
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
        <div className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-card rounded-lg shadow-theme-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-theme-primary">
                  Détails du contenu
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary mb-2">{selectedItem.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-theme-secondary mb-4">
                    <span>Par {selectedItem.author.name || selectedItem.author.username}</span>
                    <span>{new Date(selectedItem.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedItem.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedItem.isPublished ? 'Publié' : 'Non publié'}
                    </span>
                  </div>
                </div>

                {selectedItem.description && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Description</h4>
                    <p className="text-theme-secondary whitespace-pre-wrap">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.content && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Contenu</h4>
                    <div className="text-theme-secondary whitespace-pre-wrap max-h-64 overflow-y-auto bg-theme-tertiary p-4 rounded-lg">
                      {selectedItem.content}
                    </div>
                  </div>
                )}

                {selectedItem.excerpt && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Extrait</h4>
                    <p className="text-theme-secondary">{selectedItem.excerpt}</p>
                  </div>
                )}

                {selectedItem.type && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Informations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-theme-secondary">Type:</span>
                        <p className="text-theme-secondary">{selectedItem.type}</p>
                      </div>
                      {selectedItem.city && (
                        <div>
                          <span className="text-sm text-theme-secondary">Ville:</span>
                          <p className="text-theme-secondary">{selectedItem.city}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedItem.startDate && selectedItem.endDate && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Dates</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-theme-secondary">Début:</span>
                        <p className="text-theme-secondary">{new Date(selectedItem.startDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-theme-secondary">Fin:</span>
                        <p className="text-theme-secondary">{new Date(selectedItem.endDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.category && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Catégorie</h4>
                    <p className="text-theme-secondary">{getCategoryLabel(selectedItem.category, selectedItem.type)}</p>
                  </div>
                )}

                {selectedItem.imageUrl && (
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">Image</h4>
                    <div className="bg-theme-tertiary rounded-xl p-6 border border-theme-primary">
                      <Image
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme-primary">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-theme-secondary bg-theme-tertiary hover:bg-theme-primary rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}