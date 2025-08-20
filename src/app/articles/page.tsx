'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, ChevronUp, ChevronDown, Calendar, User, BookOpen, X } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ArticleImage from '@/components/ArticleImage'
import Pagination from '@/components/Pagination'
import { useArticles } from '@/hooks/useArticles'

interface Vote {
  id: string
  value: number
  userId: string
}

export default function ArticlesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  const [currentPage, setCurrentPage] = useState(1)
  
  // Utilisation de SWR pour récupérer les articles
  const { articles, pagination, isLoading, error, mutate } = useArticles({
    page: currentPage,
    search: searchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined
  })
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'ENVIRONMENT' as 'ENVIRONMENT' | 'SUSTAINABILITY' | 'CLIMATE_CHANGE' | 'BIODIVERSITY' | 'RENEWABLE_ENERGY' | 'CIRCULAR_ECONOMY' | 'GREEN_TECHNOLOGY' | 'CONSERVATION' | 'EDUCATION' | 'POLICY',
    imageUrl: '',
    source: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Bloquer le scroll quand la modale est ouverte
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Nettoyer lors du démontage du composant
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  // Fermer la modale avec Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen])

  // Charger les votes utilisateur quand les articles changent
  useEffect(() => {
    if (articles && session?.user?.id) {
      const userVotesData: {[key: string]: number} = {}
      
      articles.forEach((article) => {
        if (article.votes) {
          const userVote = article.votes.find((vote) => vote.userId === session.user.id)
          if (userVote) {
            userVotesData[article.id] = userVote.value
          }
        }
      })
      
      setUserVotes(userVotesData)
    }
  }, [articles, session?.user?.id])

  // Gestion des erreurs SWR
  useEffect(() => {
    if (error) {
      console.error('Erreur lors du chargement des articles:', error)
      toast.error('Erreur lors du chargement des articles')
    }
  }, [error])

  const handleCreateArticle = () => {
    if (!session) {
      toast.error('Vous devez être connecté pour créer un article')
      router.push('/login')
      return
    }
    
    if (session.user.role === 'EXPLORER') {
      toast.error('Vous devez être Contributeur ou Administrateur pour créer des articles')
      router.push('/promotion')
      return
    }
    
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!newArticle.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (newArticle.title.trim().length < 10) {
      newErrors.title = 'Le titre doit contenir au moins 10 caractères'
    }
    
    if (!newArticle.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire'
    } else if (newArticle.content.trim().length < 100) {
      newErrors.content = 'Le contenu doit contenir au moins 100 caractères'
    }

    if (!newArticle.excerpt.trim()) {
      newErrors.excerpt = "L'extrait est obligatoire"
    } else if (newArticle.excerpt.trim().length < 20) {
      newErrors.excerpt = "L'extrait doit contenir au moins 20 caractères"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'title') {
      if (!value.trim()) {
        newErrors.title = 'Le titre est obligatoire'
      } else if (value.trim().length < 10) {
        newErrors.title = 'Le titre doit contenir au moins 10 caractères'
      } else {
        delete newErrors.title
      }
    }
    
    if (field === 'content') {
      if (!value.trim()) {
        newErrors.content = 'Le contenu est obligatoire'
      } else if (value.trim().length < 100) {
        newErrors.content = 'Le contenu doit contenir au moins 100 caractères'
      } else {
        delete newErrors.content
      }
    }

    if (field === 'excerpt') {
      if (!value.trim()) {
        newErrors.excerpt = "L'extrait est obligatoire"
      } else if (value.trim().length < 20) {
        newErrors.excerpt = "L'extrait doit contenir au moins 20 caractères"
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
        setIsModalOpen(false)
        setNewArticle({
          title: '',
          content: '',
          excerpt: '',
          category: 'ENVIRONMENT',
          imageUrl: '',
          source: ''
        })
        setErrors({})
        mutate() // Revalider le cache SWR
        toast.success('Article créé avec succès ! Il sera visible après modération.')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la création de l\'article')
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error)
      toast.error('Erreur lors de la création de l\'article')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setNewArticle({
      title: '',
      content: '',
      excerpt: '',
      category: 'ENVIRONMENT',
      imageUrl: '',
      source: ''
    })
    setErrors({})
  }

  const handleVote = async (articleId: string, value: number) => {
    if (!session) {
      toast.error('Vous devez être connecté pour voter')
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/articles/${articleId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      })

      if (response.ok) {
        // Mettre à jour le vote local
        setUserVotes(prev => ({
          ...prev,
          [articleId]: prev[articleId] === value ? 0 : value
        }))
        
        // Revalider le cache SWR pour mettre à jour les compteurs
        mutate()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors du vote')
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error)
      toast.error('Erreur lors du vote')
    }
  }

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
      case 'CLIMATE_CHANGE': return 'bg-orange-100 text-orange-800'
      case 'BIODIVERSITY': return 'bg-purple-100 text-purple-800'
      case 'RENEWABLE_ENERGY': return 'bg-yellow-100 text-yellow-800'
      case 'CIRCULAR_ECONOMY': return 'bg-cyan-100 text-cyan-800'
      case 'GREEN_TECHNOLOGY': return 'bg-emerald-100 text-emerald-800'
      case 'CONSERVATION': return 'bg-indigo-100 text-indigo-800'
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

  const getVoteCount = (votes: Vote[]) => {
    return votes?.reduce((sum, vote) => sum + vote.value, 0) || 0
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Articles Écologiques</h1>
              <p className="text-gray-600">Découvrez des articles approfondis sur l&apos;écologie et le développement durable</p>
            </div>
            <button 
              onClick={handleCreateArticle}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel article
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
          </div>
        </div>

        {/* Liste des articles */}
                    {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement des articles...</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres ou créez le premier article !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                                                 <div className="flex flex-col md:flex-row h-full">
                  {/* Image de l'article */}
                  <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                    <ArticleImage
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 256px"
                      className="w-full h-full"
                    />
                  </div>

                   {/* Contenu de l'article */}
                   <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                            {getCategoryLabel(article.category)}
                          </span>
                        </div>
                        
                        <Link href={`/articles/${article.id}`}>
                          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                            {article.title.length > 80 
                              ? `${article.title.substring(0, 80)}...` 
                              : article.title
                            }
                          </h2>
                        </Link>

                        {article.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {article.excerpt.length > 150 
                              ? `${article.excerpt.substring(0, 150)}...` 
                              : article.excerpt
                            }
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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

                      {/* Système de vote */}
                      <div className="flex flex-col items-center gap-1 ml-4">
                        <button 
                          className={`p-2 rounded-lg transition-colors ${
                            userVotes[article.id] === 1 
                              ? 'text-orange-500 bg-orange-50 border border-orange-200' 
                              : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50 border border-gray-200'
                          }`}
                          onClick={() => handleVote(article.id, 1)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <span className={`text-sm font-medium ${
                          getVoteCount(article.votes) > 0 ? 'text-orange-500' : 
                          getVoteCount(article.votes) < 0 ? 'text-blue-500' : 'text-gray-900'
                        }`}>
                          {getVoteCount(article.votes)}
                        </span>
                        <button 
                          className={`p-2 rounded-lg transition-colors ${
                            userVotes[article.id] === -1 
                              ? 'text-blue-500 bg-blue-50 border border-blue-200' 
                              : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50 border border-gray-200'
                          }`}
                          onClick={() => handleVote(article.id, -1)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                                         <div className="mt-auto pt-4">
                       <Link 
                         href={`/articles/${article.id}`}
                         className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                       >
                         Lire la suite
                         <span className="ml-1">→</span>
                       </Link>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal de création d'article */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal} // Fermer en cliquant sur le backdrop
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant sur la modale
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Nouvel Article</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitArticle} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Titre de votre article..."
                      required
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      value={newArticle.category}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value as 'ENVIRONMENT' | 'SUSTAINABILITY' | 'CLIMATE_CHANGE' | 'BIODIVERSITY' | 'RENEWABLE_ENERGY' | 'CIRCULAR_ECONOMY' | 'GREEN_TECHNOLOGY' | 'CONSERVATION' | 'EDUCATION' | 'POLICY' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.excerpt ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Résumé court de votre article..."
                      required
                    />
                    {errors.excerpt && (
                      <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.content ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Contenu détaillé de votre article..."
                      required
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL de l&apos;image (optionnel)
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={newArticle.imageUrl}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                      URL de la source (optionnel)
                    </label>
                    <input
                      type="url"
                      id="source"
                      value={newArticle.source}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Publication...
                        </>
                      ) : (
                        "Publier l'article"
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
