'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, ChevronUp, ChevronDown, Plus, Search } from 'lucide-react'
import Link from 'next/link'

interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  isApproved: boolean
  author: {
    name: string
    username: string
  }
  comments: ForumComment[]
  votes: Vote[]
  _count: {
    comments: number
    votes: number
  }
}

interface ForumComment {
  id: string
  content: string
  createdAt: string
  isApproved: boolean
  author: {
    name: string
    username: string
  }
  votes: Vote[]
}

interface Vote {
  id: string
  value: number
  userId: string
}

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('mostVoted')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})

  const filterAndSortPosts = useCallback(() => {
    let filtered = posts.filter(post => post.isApproved)

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'mostVoted':
          return (b.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0) - 
                 (a.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0)
        case 'mostCommented':
          return (b._count?.comments || 0) - (a._count?.comments || 0)
        default:
          return 0
      }
    })

    setFilteredPosts(filtered)
  }, [posts, searchTerm, selectedCategory, sortBy])

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [filterAndSortPosts])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/forum/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'GENERAL': return 'Général'
      case 'EVENTS': return 'Événements'
      case 'PROJECTS': return 'Projets'
      case 'TIPS': return 'Conseils'
      case 'NEWS': return 'Actualités'
      case 'DISCUSSION': return 'Discussion'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GENERAL': return 'bg-gray-100 text-gray-800'
      case 'EVENTS': return 'bg-blue-100 text-blue-800'
      case 'PROJECTS': return 'bg-green-100 text-green-800'
      case 'TIPS': return 'bg-yellow-100 text-yellow-800'
      case 'NEWS': return 'bg-purple-100 text-purple-800'
      case 'DISCUSSION': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  const getVoteCount = (votes: Vote[]) => {
    return votes?.reduce((sum, vote) => sum + vote.value, 0) || 0
  }

  const handleVote = async (postId: string, value: number) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
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
          [postId]: prev[postId] === value ? 0 : value
        }))
        
        // Recharger les posts pour mettre à jour les compteurs
        fetchPosts()
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error)
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forum Collaboratif</h1>
              <p className="text-gray-600">Échangez avec la communauté écologique</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau post
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
                  placeholder="Rechercher dans le forum..."
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
                <option value="GENERAL">Général</option>
                <option value="EVENTS">Événements</option>
                <option value="PROJECTS">Projets</option>
                <option value="TIPS">Conseils</option>
                <option value="NEWS">Actualités</option>
                <option value="DISCUSSION">Discussion</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="mostVoted">Plus populaires</option>
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="mostCommented">Plus commentés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des posts */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Chargement des posts...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun post trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres ou créez le premier post !</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Votes */}
                  <div className="flex flex-col items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <button 
                      className={`p-1 rounded transition-colors ${
                        userVotes[post.id] === 1 
                          ? 'text-orange-500 bg-orange-50' 
                          : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleVote(post.id, 1)
                      }}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <span className={`text-sm font-medium ${
                      getVoteCount(post.votes) > 0 ? 'text-orange-500' : 
                      getVoteCount(post.votes) < 0 ? 'text-blue-500' : 'text-gray-900'
                    }`}>
                      {getVoteCount(post.votes)}
                    </span>
                    <button 
                      className={`p-1 rounded transition-colors ${
                        userVotes[post.id] === -1 
                          ? 'text-blue-500 bg-blue-50' 
                          : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleVote(post.id, -1)
                      }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-sm text-gray-500">
                        par {post.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post._count?.comments || 0} commentaires
                      </div>
                      <span className="hover:text-green-600 transition-colors">
                        Voir les détails →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
