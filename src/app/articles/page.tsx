'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, ThumbsUp, Calendar, User, Eye, ArrowUpDown, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { useArticles, Article } from '@/hooks/useArticles'
import { useAuth } from '@/hooks/useAuth'

interface Vote {
  id: string
  value: number
  userId: string
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostVoted'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'ENVIRONMENT'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  const [optimisticArticles, setOptimisticArticles] = useState<Article[]>([])
  const router = useRouter()
  const session = useAuth()

  // Memoize the user ID to prevent infinite re-renders
  const userId = useMemo(() => session?.user?.id, [session?.user?.id])

  // Utilisation du hook useArticles
  const { articles, pagination, isLoading, error, mutate } = useArticles({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    category: selectedCategory,
    sortBy
  })

  // Charger les votes utilisateur quand les articles changent ou quand l'utilisateur change
  useEffect(() => {
    if (articles && userId) {
      const userVotesData: {[key: string]: number} = {}
      
      articles.forEach((article) => {
        if (article.votes) {
          const userVote = article.votes.find((vote: Vote) => vote.userId === userId)
          if (userVote) {
            userVotesData[article.id] = userVote.value
          }
        }
      })
      
      setUserVotes(userVotesData)
    }
  }, [articles, userId])

  // Mettre à jour les articles optimistes quand les articles changent
  useEffect(() => {
    if (articles) {
      setOptimisticArticles(articles)
    }
  }, [articles])

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, sortBy])

  // Bloquer le scroll quand la modale est ouverte
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showCreateModal])

  // Fermer la modale avec Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCreateModal) {
        closeModal()
      }
    }

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showCreateModal])

  // Gérer les erreurs de chargement
  useEffect(() => {
    if (error) {
      console.error('Erreur lors du chargement des articles:', error)
      toast.error('Erreur lors du chargement des articles')
    }
  }, [error])

  const handleCreateArticle = () => {
    if (!session?.user) {
      toast.error('Vous devez être connecté pour créer un article')
      router.push('/login')
      return
    }
    
    // Vérifier le rôle de l'utilisateur
    if (session.user.role === 'EXPLORER') {
      toast.error('Vous devez être Contributeur ou Administrateur pour créer des articles')
      router.push('/promotion')
      return
    }
    
    setShowCreateModal(true)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setNewArticle({
      title: '',
      content: '',
      excerpt: '',
      category: 'ENVIRONMENT'
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!newArticle.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (newArticle.title.trim().length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères'
    } else if (newArticle.title.trim().length > 200) {
      newErrors.title = 'Le titre ne peut pas dépasser 200 caractères'
    }
    
    if (!newArticle.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire'
    } else if (newArticle.content.trim().length < 50) {
      newErrors.content = 'Le contenu doit contenir au moins 50 caractères'
    } else if (newArticle.content.trim().length > 10000) {
      newErrors.content = 'Le contenu ne peut pas dépasser 10000 caractères'
    }
    
    if (!newArticle.excerpt.trim()) {
      newErrors.excerpt = 'L\'extrait est obligatoire'
    } else if (newArticle.excerpt.trim().length < 20) {
      newErrors.excerpt = 'L\'extrait doit contenir au moins 20 caractères'
    } else if (newArticle.excerpt.trim().length > 500) {
      newErrors.excerpt = 'L\'extrait ne peut pas dépasser 500 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'title') {
      if (!value.trim()) {
        newErrors.title = 'Le titre est obligatoire'
      } else if (value.trim().length < 5) {
        newErrors.title = 'Le titre doit contenir au moins 5 caractères'
      } else if (value.trim().length > 200) {
        newErrors.title = 'Le titre ne peut pas dépasser 200 caractères'
      } else {
        delete newErrors.title
      }
    }
    
    if (field === 'content') {
      if (!value.trim()) {
        newErrors.content = 'Le contenu est obligatoire'
      } else if (value.trim().length < 50) {
        newErrors.content = 'Le contenu doit contenir au moins 50 caractères'
      } else if (value.trim().length > 10000) {
        newErrors.content = 'Le contenu ne peut pas dépasser 10000 caractères'
      } else {
        delete newErrors.content
      }
    }
    
    if (field === 'excerpt') {
      if (!value.trim()) {
        newErrors.excerpt = 'L\'extrait est obligatoire'
      } else if (value.trim().length < 20) {
        newErrors.excerpt = 'L\'extrait doit contenir au moins 20 caractères'
      } else if (value.trim().length > 500) {
        newErrors.excerpt = 'L\'extrait ne peut pas dépasser 500 caractères'
      } else {
        delete newErrors.excerpt
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArticle),
      })

      if (response.ok) {
        await response.json()
        closeModal()
        mutate() // Recharger les articles
        toast.success('Article publié avec succès ! Il sera visible après modération.')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la publication de l\'article')
      }
    } catch (error) {
      console.error('Erreur lors de la publication de l\'article:', error)
      toast.error('Erreur lors de la publication de l\'article')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = useCallback(async (articleId: string, value: number) => {
    if (!userId) {
      toast.error('Vous devez être connecté pour voter')
      router.push('/login')
      return
    }

    const currentVote = userVotes[articleId] || 0
    const newVote = currentVote === value ? 0 : value

    // Mise à jour optimiste de l'interface
    setOptimisticArticles(prevArticles => {
      const updatedArticles = prevArticles.map(article => {
        if (article.id === articleId) {
          // Créer une nouvelle liste de votes mise à jour
          let newVotes = [...(article.votes || [])]
          
          // Supprimer l'ancien vote de l'utilisateur s'il existe
          newVotes = newVotes.filter(vote => vote.userId !== userId)
          
          // Ajouter le nouveau vote si différent de 0
          if (newVote !== 0) {
            newVotes.push({
              id: `temp-${Date.now()}`,
              value: newVote,
              userId: userId
            })
          }
          
          return {
            ...article,
            votes: newVotes
          }
        }
        return article
      })
      return updatedArticles
    })

    // Mettre à jour les votes utilisateur
    setUserVotes(prev => ({
      ...prev,
      [articleId]: newVote
    }))

    try {
      const response = await fetch(`/api/articles/${articleId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newVote }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors du vote')
      }

      // Revalider les données
      mutate()
      toast.success('Vote enregistré !')

    } catch (error) {
      console.error('Erreur lors du vote:', error)
      toast.error('Erreur lors du vote')
      
      // Restaurer l'état précédent en cas d'erreur
      setOptimisticArticles(prevArticles => {
        const updatedArticles = prevArticles.map(article => {
          if (article.id === articleId) {
            let newVotes = [...(article.votes || [])]
            newVotes = newVotes.filter(vote => vote.userId !== userId)
            
            if (currentVote !== 0) {
              newVotes.push({
                id: `temp-${Date.now()}`,
                value: currentVote,
                userId: userId
              })
            }
            
            return {
              ...article,
              votes: newVotes
            }
          }
          return article
        })
        return updatedArticles
      })

      setUserVotes(prev => ({
        ...prev,
        [articleId]: currentVote
      }))
    }
  }, [userId, userVotes, router, mutate])

  const getCategoryLabel = (category: string) => {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ENVIRONMENT': return 'bg-green-100 text-green-800'
      case 'SUSTAINABILITY': return 'bg-blue-100 text-blue-800'
      case 'CLIMATE_CHANGE': return 'bg-red-100 text-red-800'
      case 'BIODIVERSITY': return 'bg-purple-100 text-purple-800'
      case 'RENEWABLE_ENERGY': return 'bg-yellow-100 text-yellow-800'
      case 'CIRCULAR_ECONOMY': return 'bg-indigo-100 text-indigo-800'
      case 'GREEN_TECHNOLOGY': return 'bg-teal-100 text-teal-800'
      case 'CONSERVATION': return 'bg-orange-100 text-orange-800'
      case 'EDUCATION': return 'bg-pink-100 text-pink-800'
      case 'POLICY': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getVoteCount = useCallback((votes: Vote[]) => {
    return votes.reduce((sum, vote) => sum + vote.value, 0)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-secondary">
      {/* Header */}
      <div className="bg-theme-card shadow-theme-sm border-b border-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="page-header-container">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">Articles</h1>
              <p className="text-theme-secondary mt-2">
                Découvrez nos articles sur l&apos;écologie et le développement durable
              </p>
            </div>
            <button
              onClick={handleCreateArticle}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouvel article
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-secondary" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-lg bg-theme-card text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-secondary" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
              >
                <option value="all">Toutes les catégories</option>
                <option value="ENVIRONMENT">Environnement</option>
                <option value="SUSTAINABILITY">Développement durable</option>
                <option value="CLIMATE_CHANGE">Changement climatique</option>
                <option value="BIODIVERSITY">Biodiversité</option>
                <option value="RENEWABLE_ENERGY">Énergies renouvelables</option>
                <option value="CIRCULAR_ECONOMY">Économie circulaire</option>
                <option value="GREEN_TECHNOLOGY">Technologies vertes</option>
                <option value="CONSERVATION">Conservation</option>
                <option value="EDUCATION">Éducation</option>
                <option value="POLICY">Politique</option>
              </select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostVoted')}
                className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="mostVoted">Les mieux notés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des articles */}
        {optimisticArticles.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-theme-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">Aucun article trouvé</h3>
            <p className="text-theme-secondary">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun article n\'a encore été publié'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {optimisticArticles.map((article) => (
              <article key={article.id} className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        {getCategoryLabel(article.category)}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-theme-primary mb-2">
                      <Link href={`/articles/${article.id}`} className="hover:text-green-600 transition-colors">
                        {article.title}
                      </Link>
                    </h2>
                    
                    {article.excerpt && (
                      <p className="text-theme-secondary mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-theme-secondary mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{article.author.name || article.author.username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(article.id, 1)}
                            className={`flex items-center gap-1 transition-colors ${
                              userVotes[article.id] === 1
                                ? 'text-green-600'
                                : 'text-theme-secondary hover:text-green-600'
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{getVoteCount(article.votes)}</span>
                          </button>
                        </div>
                      </div>
                      
                      <Link
                        href={`/articles/${article.id}`}
                        className="text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Lire la suite →
                      </Link>
                    </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              <span className="px-3 py-2 text-theme-secondary">
                Page {currentPage} sur {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 rounded-lg border border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Modal de création d'article */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-theme-card rounded-lg shadow-theme-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-theme-primary">Nouvel Article</h2>
                  <button
                    onClick={closeModal}
                    className="text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitArticle} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-theme-primary mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newArticle.title}
                      onChange={(e) => {
                        setNewArticle(prev => ({ ...prev, title: e.target.value }))
                        validateField('title', e.target.value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.title ? 'border-red-500' : 'border-theme-primary'
                      }`}
                      placeholder="Titre de votre article"
                      maxLength={200}
                      required
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-theme-primary mb-2">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      value={newArticle.category}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-theme-card text-theme-primary"
                      required
                    >
                      <option value="ENVIRONMENT">Environnement</option>
                      <option value="SUSTAINABILITY">Développement durable</option>
                      <option value="CLIMATE_CHANGE">Changement climatique</option>
                      <option value="BIODIVERSITY">Biodiversité</option>
                      <option value="RENEWABLE_ENERGY">Énergies renouvelables</option>
                      <option value="CIRCULAR_ECONOMY">Économie circulaire</option>
                      <option value="GREEN_TECHNOLOGY">Technologies vertes</option>
                      <option value="CONSERVATION">Conservation</option>
                      <option value="EDUCATION">Éducation</option>
                      <option value="POLICY">Politique</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-theme-primary mb-2">
                      Extrait *
                    </label>
                    <textarea
                      id="excerpt"
                      value={newArticle.excerpt}
                      onChange={(e) => {
                        setNewArticle(prev => ({ ...prev, excerpt: e.target.value }))
                        validateField('excerpt', e.target.value)
                      }}
                      rows={3}
                      maxLength={500}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.excerpt ? 'border-red-500' : 'border-theme-primary'
                      }`}
                      placeholder="Résumé de votre article..."
                      required
                    />
                    {errors.excerpt && (
                      <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-theme-primary mb-2">
                      Contenu *
                    </label>
                    <textarea
                      id="content"
                      value={newArticle.content}
                      onChange={(e) => {
                        setNewArticle(prev => ({ ...prev, content: e.target.value }))
                        validateField('content', e.target.value)
                      }}
                      rows={8}
                      maxLength={10000}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.content ? 'border-red-500' : 'border-theme-primary'
                      }`}
                      placeholder="Contenu de votre article..."
                      required
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                    )}
                  </div>



                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-theme-secondary bg-theme-tertiary hover:bg-theme-primary rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-theme-secondary disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Publication...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Publier l&apos;article
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
