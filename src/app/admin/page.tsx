'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Shield, Users, FileText, MessageSquare, MapPin, Lightbulb, Eye, EyeOff, Trash2, CheckCircle, XCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

// Type definitions
interface AdminArticle {
  id: string
  title: string
  content: string
  excerpt?: string
  category: string
  imageUrl?: string
  source?: string
  isPublished: boolean
  createdAt: string
  author: {
    name?: string
    username?: string
  }
}

interface AdminForumPost {
  id: string
  title: string
  content: string
  category: string
  isPublished: boolean
  createdAt: string
  author: {
    name?: string
    username?: string
  }
}

interface AdminTip {
  id: string
  title: string
  content: string
  category: string
  imageUrl?: string
  source?: string
  isPublished: boolean
  createdAt: string
  author: {
    name?: string
    username?: string
  }
}

interface AdminInitiative {
  id: string
  title: string
  description: string
  type: string
  city: string
  isPublished: boolean
  createdAt: string
  author: {
    name?: string
    username?: string
  }
}

interface RoleRequest {
  id: string
  requestedRole: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    name?: string
    username?: string
    email?: string
  }
}

type AdminItem = AdminArticle | AdminForumPost | AdminTip | AdminInitiative | RoleRequest

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    forumPosts: 0,
    initiatives: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Onglets
  const [activeTab, setActiveTab] = useState('articles')
  
  // Données des tableaux
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [forumPosts, setForumPosts] = useState<AdminForumPost[]>([])
  const [tips, setTips] = useState<AdminTip[]>([])
  const [initiatives, setInitiatives] = useState<AdminInitiative[]>([])
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  
  // États pour les modales
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'unpublish' | 'publish'
    contentType: string
    id: string
    title: string
  } | null>(null)
  const [selectedItem, setSelectedItem] = useState<AdminItem | null>(null)



  // Gestion de la touche Escape pour fermer les modales
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirmModal) {
          closeConfirmModal()
        }
        if (showDetailModal) {
          closeDetailModal()
        }
      }
    }

    if (showConfirmModal || showDetailModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showConfirmModal, showDetailModal])

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      
      // Récupérer les statistiques depuis l'API
      const [usersResponse, articlesResponse, forumResponse, initiativesResponse] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/articles'),
        fetch('/api/admin/stats/forum'),
        fetch('/api/admin/stats/initiatives')
      ])

      const statsData = {
        users: 0,
        articles: 0,
        forumPosts: 0,
        initiatives: 0
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        statsData.users = usersData.count || 0
      }

      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json()
        statsData.articles = articlesData.count || 0
      }

      if (forumResponse.ok) {
        const forumData = await forumResponse.json()
        statsData.forumPosts = forumData.count || 0
      }

      if (initiativesResponse.ok) {
        const initiativesData = await initiativesResponse.json()
        statsData.initiatives = initiativesData.count || 0
      }

      setStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadTableData = useCallback(async () => {
    try {
      setTableLoading(true)
      
      switch (activeTab) {
        case 'articles':
          const articlesResponse = await fetch('/api/admin/content/articles')
          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json()
            setArticles(articlesData.articles || [])
          }
          break
          
        case 'forum':
          const forumResponse = await fetch('/api/admin/content/forum')
          if (forumResponse.ok) {
            const forumData = await forumResponse.json()
            setForumPosts(forumData.posts || [])
          }
          break
          
        case 'tips':
          const tipsResponse = await fetch('/api/admin/content/tips')
          if (tipsResponse.ok) {
            const tipsData = await tipsResponse.json()
            setTips(tipsData.tips || [])
          }
          break
          
        case 'initiatives':
          const initiativesResponse = await fetch('/api/admin/content/initiatives')
          if (initiativesResponse.ok) {
            const initiativesData = await initiativesResponse.json()
            setInitiatives(initiativesData.initiatives || [])
          }
          break
          
        case 'role-requests':
          const roleRequestsResponse = await fetch('/api/admin/role-requests')
          if (roleRequestsResponse.ok) {
            const roleRequestsData = await roleRequestsResponse.json()
            setRoleRequests(roleRequestsData.requests || [])
          }
          break
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setTableLoading(false)
    }
  }, [activeTab])

  // Vérification des permissions et chargement initial
  useEffect(() => {
    // Attendre que le chargement soit terminé avant de vérifier
    if (loading) return

    if (!user) {
      toast.error('Vous devez être connecté pour accéder à cette page')
      router.push('/login')
      return
    }

    if (user.role !== 'ADMIN') {
      toast.error('Vous devez être administrateur pour accéder à cette page')
      router.push('/dashboard')
      return
    }

    // Charger les statistiques si l'utilisateur est admin
    if (user.role === 'ADMIN') {
      fetchStats()
      loadTableData()
    }
  }, [user, loading, router, fetchStats, loadTableData])

  // Charger les données du tableau actif
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadTableData()
    }
  }, [activeTab, user, loadTableData])

  // Fonctions pour les modales
  const openConfirmModal = (type: 'delete' | 'unpublish' | 'publish', contentType: string, id: string, title: string) => {
    setConfirmAction({ type, contentType, id, title })
    setShowConfirmModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeConfirmModal = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
    document.body.style.overflow = 'auto'
  }

  const openDetailModal = (item: AdminItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
    document.body.style.overflow = 'auto'
  }

    const handleConfirmAction = async () => {
    if (!confirmAction) return

    try {
      if (confirmAction.type === 'delete') {
        const response = await fetch(`/api/admin/content/${confirmAction.contentType}/${confirmAction.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          toast.success('Élément supprimé avec succès')
          // Forcer le rechargement avec un délai pour éviter les problèmes de cache
          setTimeout(() => {
            loadTableData()
          }, 100)
        } else {
          toast.error('Erreur lors de la suppression')
        }
      } else if (confirmAction.type === 'unpublish' || confirmAction.type === 'publish') {
        const newStatus = confirmAction.type === 'publish'
        
        // Mise à jour optimiste de l'état local
        updateLocalState(confirmAction.contentType, confirmAction.id, { isPublished: newStatus })
        
        const response = await fetch(`/api/admin/content/${confirmAction.contentType}/${confirmAction.id}/toggle-publication`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: newStatus })
        })

        if (response.ok) {
          toast.success(`Contenu ${newStatus ? 'publié' : 'dépublié'} avec succès`)
          // Recharger les données pour s'assurer de la cohérence
          setTimeout(() => {
            loadTableData()
          }, 100)
        } else {
          toast.error(`Erreur lors de la ${newStatus ? 'publication' : 'dépublier'}`)
          // Annuler la mise à jour optimiste en cas d'erreur
          loadTableData()
        }
      }

      closeConfirmModal()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'action')
      // Recharger les données en cas d'erreur
      loadTableData()
    }
  }

  // Fonction pour mettre à jour l'état local de manière optimiste
  const updateLocalState = (contentType: string, id: string, updates: Partial<AdminArticle | AdminTip | AdminInitiative | AdminForumPost>) => {
    switch (contentType) {
      case 'articles':
        setArticles(prev => prev.map((item: AdminArticle) => 
          item.id === id ? { ...item, ...updates } : item
        ))
        break
      case 'tips':
        setTips(prev => prev.map((item: AdminTip) => 
          item.id === id ? { ...item, ...updates } : item
        ))
        break
      case 'initiatives':
        setInitiatives(prev => prev.map((item: AdminInitiative) => 
          item.id === id ? { ...item, ...updates } : item
        ))
        break
      case 'forum':
        setForumPosts(prev => prev.map((item: AdminForumPost) => 
          item.id === id ? { ...item, ...updates } : item
        ))
        break
    }
  }

  const handleTogglePublication = async (type: string, id: string, currentStatus: boolean) => {
    const item = getCurrentItem(type, id)
    if (!item) return

    // Demander confirmation pour toutes les actions
    if (currentStatus) {
      openConfirmModal('unpublish', type, id, item.title || 'cet élément')
    } else {
      openConfirmModal('publish', type, id, item.title || 'cet élément')
    }
  }

  const getCurrentItem = (type: string, id: string): AdminArticle | AdminTip | AdminInitiative | null => {
    switch (type) {
      case 'articles':
        return articles.find((a: AdminArticle) => a.id === id) || null
      case 'tips':
        return tips.find((t: AdminTip) => t.id === id) || null
      case 'initiatives':
        return initiatives.find((i: AdminInitiative) => i.id === id) || null
      default:
        return null
    }
  }

  const handleDelete = async (type: string, id: string) => {
    const item = getCurrentItem(type, id)
    if (item) {
      openConfirmModal('delete', type, id, item.title || 'cet élément')
    }
  }

  const handleRoleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/role-requests/${requestId}/${action}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        toast.success(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`)
        loadTableData() // Recharger les données
      } else {
        toast.error('Erreur lors du traitement de la demande')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement de la demande')
    }
  }

  // Afficher un loader pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Chargement...</p>
        </div>
      </div>
    )
  }

  // Vérifier les permissions après le chargement
  if (!user || user.role !== 'ADMIN') {
  return (
    <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-theme-secondary min-h-screen">
      {/* Header */}
      <div className="bg-theme-card shadow-theme-sm border-b border-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="page-header-container">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">Administration</h1>
              <p className="text-theme-secondary mt-2">
                Gestion complète de la plateforme Pol-UX
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-green-600 font-medium">Administrateur</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-theme-secondary">Utilisateurs</p>
                <div className="text-2xl font-bold text-theme-primary">
                  {statsLoading ? (
                    <div className="animate-pulse bg-theme-secondary h-8 w-12 rounded"></div>
                  ) : (
                    stats.users.toLocaleString()
                  )}
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-theme-secondary">Articles</p>
                <div className="text-2xl font-bold text-theme-primary">
                  {statsLoading ? (
                    <div className="animate-pulse bg-theme-secondary h-8 w-12 rounded"></div>
                  ) : (
                    stats.articles.toLocaleString()
                  )}
                </div>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-theme-secondary">Posts Forum</p>
                <div className="text-2xl font-bold text-theme-primary">
                  {statsLoading ? (
                    <div className="animate-pulse bg-theme-secondary h-8 w-12 rounded"></div>
                  ) : (
                    stats.forumPosts.toLocaleString()
                  )}
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-theme-secondary">Initiatives</p>
                <div className="text-2xl font-bold text-theme-primary">
                  {statsLoading ? (
                    <div className="animate-pulse bg-theme-secondary h-8 w-12 rounded"></div>
                  ) : (
                    stats.initiatives.toLocaleString()
                  )}
                </div>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary">
          <div className="border-b border-theme-primary">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Articles
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forum'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Forum
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tips'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                <Lightbulb className="h-4 w-4 inline mr-2" />
                Conseils
              </button>
              <button
                onClick={() => setActiveTab('initiatives')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'initiatives'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                <MapPin className="h-4 w-4 inline mr-2" />
                Initiatives
              </button>
              <button
                onClick={() => setActiveTab('role-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'role-requests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-primary'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Demandes de promotion
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {tableLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                {/* Onglet Articles */}
                {activeTab === 'articles' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-primary">
                      <thead className="bg-theme-tertiary">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Auteur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-card divide-y divide-theme-primary">
                        {articles.map((article: AdminArticle) => (
                          <tr key={article.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-theme-primary max-w-xs truncate" title={article.title}>
                                {article.title}
                              </div>
                              <div className="text-sm text-theme-secondary">{article.category}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-24 truncate" title={article.author?.name || article.author?.username}>
                                {article.author?.name || article.author?.username}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                article.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {article.isPublished ? 'Publié' : 'Dépublié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                                                                                      <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDetailModal(article)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleTogglePublication('articles', article.id, article.isPublished)}
                                  className={`p-1 rounded ${
                                    article.isPublished 
                                      ? 'text-red-600 hover:text-red-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                  title={article.isPublished ? 'Dépublier' : 'Publier'}
                                >
                                  {article.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete('articles', article.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Onglet Forum */}
                {activeTab === 'forum' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-primary">
                      <thead className="bg-theme-tertiary">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Auteur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-card divide-y divide-theme-primary">
                        {forumPosts.map((post: AdminForumPost) => (
                          <tr key={post.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-theme-primary max-w-xs truncate" title={post.title}>
                                {post.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-24 truncate" title={post.author?.name || post.author?.username}>
                                {post.author?.name || post.author?.username}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-20 truncate" title={post.category}>
                                {post.category}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                post.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {post.isPublished ? 'Publié' : 'Dépublié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDetailModal(post)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleTogglePublication('forum', post.id, post.isPublished)}
                                  className={`p-1 rounded ${
                                    post.isPublished 
                                      ? 'text-red-600 hover:text-red-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                  title={post.isPublished ? 'Dépublier' : 'Publier'}
                                >
                                  {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete('forum', post.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Onglet Conseils */}
                {activeTab === 'tips' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-primary">
                      <thead className="bg-theme-tertiary">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Auteur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-card divide-y divide-theme-primary">
                        {tips.map((tip: AdminTip) => (
                          <tr key={tip.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-theme-primary max-w-xs truncate" title={tip.title}>
                                {tip.title}
                              </div>
                              <div className="text-sm text-theme-secondary">{tip.category}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-24 truncate" title={tip.author?.name || tip.author?.username}>
                                {tip.author?.name || tip.author?.username}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                tip.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {tip.isPublished ? 'Publié' : 'Dépublié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              {new Date(tip.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDetailModal(tip)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleTogglePublication('tips', tip.id, tip.isPublished)}
                                  className={`p-1 rounded ${
                                    tip.isPublished 
                                      ? 'text-red-600 hover:text-red-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                  title={tip.isPublished ? 'Dépublier' : 'Publier'}
                                >
                                  {tip.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete('tips', tip.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Onglet Initiatives */}
                {activeTab === 'initiatives' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-primary">
                      <thead className="bg-theme-tertiary">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Auteur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-card divide-y divide-theme-primary">
                        {initiatives.map((initiative: AdminInitiative) => (
                          <tr key={initiative.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-theme-primary max-w-xs truncate" title={initiative.title}>
                                {initiative.title}
                              </div>
                              <div className="text-sm text-theme-secondary">{initiative.city}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-24 truncate" title={initiative.author?.name || initiative.author?.username}>
                                {initiative.author?.name || initiative.author?.username}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-20 truncate" title={initiative.type}>
                                {initiative.type}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                initiative.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {initiative.isPublished ? 'Publié' : 'Dépublié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              {new Date(initiative.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDetailModal(initiative)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleTogglePublication('initiatives', initiative.id, initiative.isPublished)}
                                  className={`p-1 rounded ${
                                    initiative.isPublished 
                                      ? 'text-red-600 hover:text-red-900' 
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                  title={initiative.isPublished ? 'Dépublier' : 'Publier'}
                                >
                                  {initiative.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDelete('initiatives', initiative.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Onglet Demandes de promotion */}
                {activeTab === 'role-requests' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-primary">
                      <thead className="bg-theme-tertiary">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Rôle demandé
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Raison
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-theme-card divide-y divide-theme-primary">
                        {roleRequests.map((request: RoleRequest) => (
                          <tr key={request.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-theme-primary max-w-24 truncate" title={request.user?.name || request.user?.username}>
                                {request.user?.name || request.user?.username}
                              </div>
                              <div className="text-sm text-theme-secondary max-w-32 truncate" title={request.user?.email}>
                                {request.user?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-20 truncate" title={request.requestedRole}>
                                {request.requestedRole}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              <div className="max-w-xs truncate" title={request.reason}>{request.reason}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                request.status === 'PENDING' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status === 'PENDING' ? 'En attente' : 
                                 request.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-theme-secondary">
                              {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDetailModal(request)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {request.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleRoleRequest(request.id, 'approve')}
                                      className="text-green-600 hover:text-green-900 p-1 rounded"
                                      title="Approuver"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRoleRequest(request.id, 'reject')}
                                      className="text-red-600 hover:text-red-900 p-1 rounded"
                                      title="Rejeter"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modale de confirmation */}
      {showConfirmModal && confirmAction && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeConfirmModal}
        >
          <div 
            className="bg-theme-card border border-theme-primary rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                Confirmation
              </h3>
              <button
                onClick={closeConfirmModal}
                className="text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-theme-secondary">
                {confirmAction.type === 'delete' 
                  ? `Êtes-vous sûr de vouloir supprimer "${confirmAction.title}" ?`
                  : confirmAction.type === 'unpublish'
                  ? `Êtes-vous sûr de vouloir dépublier "${confirmAction.title}" ?`
                  : `Êtes-vous sûr de vouloir publier "${confirmAction.title}" ?`
                }
              </p>
              {confirmAction.type === 'delete' && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                  Cette action est irréversible.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-theme-secondary border border-theme-primary rounded-md hover:bg-theme-tertiary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  confirmAction.type === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' 
                    : confirmAction.type === 'unpublish'
                    ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                }`}
              >
                {confirmAction.type === 'delete' ? 'Supprimer' : 
                 confirmAction.type === 'unpublish' ? 'Dépublier' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de détail */}
      {showDetailModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeDetailModal}
        >
          <div 
            className="bg-theme-card border border-theme-primary rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                Détails du contenu
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Titre</label>
                  <p className="text-theme-primary">
                    {'title' in selectedItem ? selectedItem.title : 
                     'requestedRole' in selectedItem ? `Demande de rôle: ${selectedItem.requestedRole}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    {'author' in selectedItem ? 'Auteur' : 'Utilisateur'}
                  </label>
                  <p className="text-theme-primary">
                    {'author' in selectedItem ? (selectedItem.author?.name || selectedItem.author?.username) :
                     'user' in selectedItem ? (selectedItem.user?.name || selectedItem.user?.username) : 'N/A'}
                  </p>
                </div>
                {'category' in selectedItem && selectedItem.category && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Catégorie</label>
                    <p className="text-theme-primary">{selectedItem.category}</p>
                  </div>
                )}
                {'type' in selectedItem && selectedItem.type && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Type</label>
                    <p className="text-theme-primary">{selectedItem.type}</p>
                  </div>
                )}
                {'city' in selectedItem && selectedItem.city && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Ville</label>
                    <p className="text-theme-primary">{selectedItem.city}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Date de création</label>
                  <p className="text-theme-primary">{new Date(selectedItem.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Statut</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    'isPublished' in selectedItem 
                      ? (selectedItem.isPublished
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200')
                      : 'status' in selectedItem
                      ? (selectedItem.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : selectedItem.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200')
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {'isPublished' in selectedItem 
                      ? (selectedItem.isPublished ? 'Publié' : 'Dépublié')
                      : 'status' in selectedItem
                      ? (selectedItem.status === 'PENDING' ? 'En attente' : 
                         selectedItem.status === 'APPROVED' ? 'Approuvée' : 'Rejetée')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              {'content' in selectedItem && selectedItem.content && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Contenu</label>
                  <div className="bg-theme-tertiary p-4 rounded-md">
                    <div className="prose max-w-none prose-theme-primary dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                  </div>
                </div>
              )}

              {/* Extrait */}
              {'excerpt' in selectedItem && selectedItem.excerpt && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Extrait</label>
                  <p className="text-theme-primary bg-theme-tertiary p-4 rounded-md">{selectedItem.excerpt}</p>
                </div>
              )}

              {/* Description */}
              {'description' in selectedItem && selectedItem.description && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Description</label>
                  <p className="text-theme-primary bg-theme-tertiary p-4 rounded-md">{selectedItem.description}</p>
                </div>
              )}

              {/* Raison (pour les demandes de rôle) */}
              {'reason' in selectedItem && selectedItem.reason && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Raison de la demande</label>
                  <p className="text-theme-primary bg-theme-tertiary p-4 rounded-md">{selectedItem.reason}</p>
                </div>
              )}

              {/* Image */}
              {'imageUrl' in selectedItem && selectedItem.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Image</label>
                  <Image 
                    src={selectedItem.imageUrl} 
                    alt={'title' in selectedItem ? selectedItem.title : 'Image'}
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 text-theme-secondary border border-theme-primary rounded-md hover:bg-theme-tertiary transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}