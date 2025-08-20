'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ChevronUp, ChevronDown, Calendar, User, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  category: string
  imageUrl?: string
  publishedAt?: string
  createdAt: string
  author: {
    name: string
    username: string
  }
  votes: Vote[]
  _count: {
    votes: number
  }
}

interface Vote {
  id: string
  value: number
  userId: string
}

export default function ArticlesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
        setTotalPages(data.pagination.pages)
        
        // Charger les votes de l'utilisateur connecté
        if (session?.user?.id) {
          const userVotesData: {[key: string]: number} = {}
          
          data.articles.forEach((article: Article) => {
            if (article.votes) {
              const userVote = article.votes.find((vote: Vote) => vote.userId === session.user.id)
              if (userVote) {
                userVotesData[article.id] = userVote.value
              }
            }
          })
          
          setUserVotes(userVotesData)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, selectedCategory, session?.user?.id])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

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
    
    router.push('/articles/create')
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
        
        // Recharger les articles pour mettre à jour les compteurs
        fetchArticles()
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
        {loading ? (
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
                   {article.imageUrl ? (
                     <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                       <Image
                         src={article.imageUrl}
                         alt={article.title}
                         fill
                         sizes="(max-width: 768px) 100vw, 256px"
                         className="object-cover object-center"
                         priority={false}
                       />
                     </div>
                   ) : (
                     <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                       <BookOpen className="h-12 w-12 text-green-600" />
                     </div>
                   )}

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
                            {article.title}
                          </h2>
                        </Link>

                        {article.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {article.excerpt}
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
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <span className="px-3 py-2 text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
