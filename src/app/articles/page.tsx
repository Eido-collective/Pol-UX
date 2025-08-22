'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, ThumbsUp, Calendar, User, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import ArticleImage from '@/components/ArticleImage'
import { useArticles } from '@/hooks/useArticles'

interface Vote {
  id: string
  value: number
  userId: string
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  // Utilisation du hook useArticles
  const { articles, isLoading, error } = useArticles({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    category: selectedCategory
  })

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
    // Rediriger vers la page de connexion car il n'y a plus de système de session
    router.push('/login')
  }

  const closeModal = () => {
    setShowCreateModal(false)
  }

  const handleVote = async () => {
    // Rediriger vers la page de connexion car il n'y a plus de système de session
    router.push('/login')
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

  const getVoteCount = (votes: Vote[]) => {
    return votes.reduce((sum, vote) => sum + vote.value, 0)
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

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
          <div className="flex items-center justify-between">
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
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Liste des articles */}
        {filteredArticles.length === 0 ? (
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
            {filteredArticles.map((article) => (
              <article key={article.id} className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <ArticleImage
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover"
                      fill={false}
                      width={400}
                      height={300}
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
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
                        <button
                          onClick={() => handleVote()}
                          className="flex items-center gap-1 text-theme-secondary hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{getVoteCount(article.votes)}</span>
                        </button>
                      </div>
                      
                      <Link
                        href={`/articles/${article.id}`}
                        className="text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Lire la suite →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
