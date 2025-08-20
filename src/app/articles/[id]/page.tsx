'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, ChevronUp, ChevronDown, User, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ArticleImage from '@/components/ArticleImage'

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

export default function ArticlePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data.article)
        
        // Charger les votes de l'utilisateur
        if (session?.user?.id) {
          const userVotesData: {[key: string]: number} = {}
          
          if (data.article.votes) {
            const userVote = data.article.votes.find((vote: Vote) => vote.userId === session.user.id)
            if (userVote) {
              userVotesData[data.article.id] = userVote.value
            }
          }
          
          setUserVotes(userVotesData)
        }
      } else {
        console.error('Erreur lors du chargement de l\'article')
        toast.error('Erreur lors du chargement de l\'article')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement de l\'article')
    } finally {
      setLoading(false)
    }
  }, [params.id, session?.user?.id])

  useEffect(() => {
    fetchArticle()
  }, [fetchArticle])

  const handleVote = async (articleId: string, value: number) => {
    if (!session) {
      toast.error('Vous devez être connecté pour voter')
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
        setUserVotes(prev => ({
          ...prev,
          [articleId]: prev[articleId] === value ? 0 : value
        }))
        fetchArticle()
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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement de l&apos;article...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Article non trouvé</h3>
            <p className="text-gray-500">L&apos;article que vous recherchez n&apos;existe pas ou a été supprimé.</p>
            <Link 
              href="/articles"
              className="inline-flex items-center mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux articles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header avec bouton retour */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux articles</span>
          </Link>
        </div>

        {/* Article principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image de l'article */}
          <div className="w-full h-80 md:h-96">
            <ArticleImage
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
              priority={true}
              className="w-full h-full"
              fallbackIcon={<BookOpen className="h-24 w-24 text-green-600" />}
            />
          </div>

          <div className="p-6">
            {/* En-tête de l'article */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                  {getCategoryLabel(article.category)}
                </span>
                
                {/* Système de vote */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleVote(article.id, 1)}
                    className={`p-2 rounded-lg transition-colors ${
                      userVotes[article.id] === 1 
                        ? 'text-orange-500 bg-orange-50 border border-orange-200' 
                        : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50 border border-gray-200'
                    }`}
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
                    onClick={() => handleVote(article.id, -1)}
                    className={`p-2 rounded-lg transition-colors ${
                      userVotes[article.id] === -1 
                        ? 'text-blue-500 bg-blue-50 border border-blue-200' 
                        : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg text-gray-600 mb-4 italic">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{article.author.name || article.author.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contenu de l'article */}
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
