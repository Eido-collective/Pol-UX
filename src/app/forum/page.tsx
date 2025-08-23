'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { MessageSquare, ChevronUp, ChevronDown, Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Pagination from '@/components/Pagination'
import { useForumPosts } from '@/hooks/useForumPosts'

interface Vote {
  id: string
  value: number
  userId: string
}

export default function ForumPage() {
  const session = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('mostVoted')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  const [optimisticPosts, setOptimisticPosts] = useState<Array<{
    id: string
    title: string
    content: string
    category: string
    createdAt: string
    author: { name: string }
    votes: Vote[]
    _count?: { comments: number }
  }>>([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'GENERAL'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Utilisation du hook useForumPosts avec useMemo pour éviter les re-rendus inutiles
  const forumPostsOptions = useMemo(() => ({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    category: selectedCategory,
    sortBy: sortBy
  }), [currentPage, searchTerm, selectedCategory, sortBy])

  const { posts, pagination, isLoading, mutate } = useForumPosts(forumPostsOptions)

  // Memoize the user ID to prevent infinite re-renders
  const userId = useMemo(() => session?.user?.id, [session?.user?.id])

  const getVoteCount = useCallback((votes: Vote[]) => {
    return votes?.reduce((sum, vote) => sum + vote.value, 0) || 0
  }, [])

  // Charger les votes utilisateur quand les posts changent ou quand l'utilisateur change
  useEffect(() => {
    if (posts && userId) {
      const userVotesData: {[key: string]: number} = {}
      
      posts.forEach((post) => {
        if (post.votes) {
          const userVote = post.votes.find((vote: Vote) => vote.userId === userId)
          if (userVote) {
            userVotesData[post.id] = userVote.value
          }
        }
      })
      
      setUserVotes(userVotesData)
    }
  }, [posts, userId])

  // Mettre à jour les posts optimistes quand les posts changent
  useEffect(() => {
    if (posts) {
      setOptimisticPosts(posts)
    }
  }, [posts])

  // Recharger les données quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, sortBy])

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
      case 'ENVIRONMENT': return 'bg-green-100 text-green-800'
      case 'SUSTAINABILITY': return 'bg-blue-100 text-blue-800'
      case 'CLIMATE_CHANGE': return 'bg-orange-100 text-orange-800'
      case 'BIODIVERSITY': return 'bg-purple-100 text-purple-800'
      case 'RENEWABLE_ENERGY': return 'bg-yellow-100 text-yellow-800'
      case 'CIRCULAR_ECONOMY': return 'bg-indigo-100 text-indigo-800'
      case 'GREEN_TECHNOLOGY': return 'bg-teal-100 text-teal-800'
      case 'CONSERVATION': return 'bg-pink-100 text-pink-800'
      case 'EDUCATION': return 'bg-cyan-100 text-cyan-800'
      case 'POLICY': return 'bg-theme-tertiary text-theme-secondary'
      case 'GENERAL': return 'bg-theme-tertiary text-theme-secondary'
      case 'QUESTIONS': return 'bg-purple-100 text-purple-800'
      case 'DISCUSSIONS': return 'bg-blue-100 text-blue-800'
      case 'EVENTS': return 'bg-orange-100 text-orange-800'
      case 'RESOURCES': return 'bg-green-100 text-green-800'
      case 'NEWS': return 'bg-red-100 text-red-800'
      default: return 'bg-theme-tertiary text-theme-secondary'
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

  const handleVote = useCallback(async (postId: string, value: number) => {
    if (!session?.user?.id) {
      toast.error('Vous devez être connecté pour voter')
      router.push('/login')
      return
    }

    const currentUserId = session.user.id

    try {
      // Mise à jour optimiste de l'interface
      const currentVote = userVotes[postId] || 0
      const newVote = currentVote === value ? 0 : value

      // Mettre à jour le vote local immédiatement
      setUserVotes(prev => ({
        ...prev,
        [postId]: newVote
      }))

      // Mettre à jour le score optimiste immédiatement
      setOptimisticPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            // Créer une nouvelle liste de votes mise à jour
            let newVotes = [...(post.votes || [])]
            
            // Supprimer l'ancien vote de l'utilisateur s'il existe
            newVotes = newVotes.filter(vote => vote.userId !== currentUserId)
            
            // Ajouter le nouveau vote si différent de 0
            if (newVote !== 0) {
              newVotes.push({
                id: `temp-${Date.now()}`,
                value: newVote,
                userId: currentUserId
              })
            }
            
            return {
              ...post,
              votes: newVotes
            }
          }
          return post
        })
        return updatedPosts
      })

      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        // En cas d'erreur, revenir à l'état précédent
        setUserVotes(prev => ({
          ...prev,
          [postId]: currentVote
        }))
        
        setOptimisticPosts(prevPosts => {
          const updatedPosts = prevPosts.map(post => {
            if (post.id === postId) {
              let newVotes = [...(post.votes || [])]
              newVotes = newVotes.filter(vote => vote.userId !== currentUserId)
              
              if (currentVote !== 0) {
                newVotes.push({
                  id: `temp-${Date.now()}`,
                  value: currentVote,
                  userId: currentUserId
                })
              }
              
              return {
                ...post,
                votes: newVotes
              }
            }
            return post
          })
          return updatedPosts
        })
        
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors du vote')
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error)
      toast.error('Erreur lors du vote')
    }
  }, [userVotes, router, session?.user?.id])

  const handleCreatePost = () => {
    if (!session?.user) {
      toast.error('Vous devez être connecté pour créer un post')
      router.push('/login')
      return
    }
  
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!newPost.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (newPost.title.trim().length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères'
    }
    
    if (!newPost.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire'
    } else if (newPost.content.trim().length < 20) {
      newErrors.content = 'Le contenu doit contenir au moins 20 caractères'
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
      } else {
        delete newErrors.title
      }
    }
    
    if (field === 'content') {
      if (!value.trim()) {
        newErrors.content = 'Le contenu est obligatoire'
      } else if (value.trim().length < 20) {
        newErrors.content = 'Le contenu doit contenir au moins 20 caractères'
      } else {
        delete newErrors.content
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      })

      if (response.ok) {
        await response.json()
        setIsModalOpen(false)
        setNewPost({ title: '', content: '', category: 'GENERAL' })
        setErrors({})
        mutate() // Recharger les posts
        toast.success('Post publié avec succès ! Il sera visible après modération.')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la publication du post')
      }
    } catch (error) {
      console.error('Erreur lors de la publication du post:', error)
      toast.error('Erreur lors de la publication du post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setNewPost({ title: '', content: '', category: 'GENERAL' })
    setErrors({})
  }

  return (
    <div className="bg-theme-secondary">
      {/* Header */}
      <div className="bg-theme-card shadow-theme-sm border-b border-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     <div className="page-header-container">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">Forum Collaboratif</h1>
              <p className="text-theme-secondary mt-2">
                Échangez avec la communauté sur les sujets écologiques
              </p>
            </div>
            <button 
              onClick={handleCreatePost}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Section de recherche et filtres */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher dans le forum..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Filtre par catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Toutes les catégories</option>
              <option value="GENERAL">Général</option>
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

            {/* Filtre par tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="mostVoted">Plus votés</option>
              <option value="mostCommented">Plus commentés</option>
            </select>
          </div>
        </div>

        {/* Liste des posts */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-theme-secondary">Chargement des posts...</div>
            </div>
                     ) : optimisticPosts.length === 0 ? (
             <div className="text-center py-12">
               <MessageSquare className="h-12 w-12 text-theme-secondary mx-auto mb-4" />
               <h3 className="text-lg font-medium text-theme-primary mb-2">Aucun post trouvé</h3>
               <p className="text-theme-secondary">Essayez de modifier vos filtres ou créez le premier post !</p>
             </div>
           ) : (
             optimisticPosts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="block bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6 hover:shadow-theme-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Votes */}
                  <div className="flex flex-col items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <button 
                      className={`p-1 rounded transition-colors ${
                        userVotes[post.id] === 1 
                          ? 'text-orange-500 bg-orange-50' 
                          : 'text-theme-secondary hover:text-orange-500 hover:bg-theme-tertiary'
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
                      getVoteCount(post.votes) < 0 ? 'text-blue-500' : 'text-theme-primary'
                    }`}>
                      {getVoteCount(post.votes)}
                    </span>
                    <button 
                      className={`p-1 rounded transition-colors ${
                        userVotes[post.id] === -1 
                          ? 'text-blue-500 bg-blue-50' 
                          : 'text-theme-secondary hover:text-blue-500 hover:bg-theme-tertiary'
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
                      <span className="text-sm text-theme-secondary">
                        par {post.author.name}
                      </span>
                      <span className="text-sm text-theme-secondary">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      {post.title}
                    </h3>

                    <p className="text-theme-secondary mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-theme-secondary">
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

        {/* Modal de création de post */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-theme-card rounded-lg shadow-theme-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-theme-primary">Nouveau Post</h2>
                  <button
                    onClick={closeModal}
                    className="text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitPost} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-theme-primary mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newPost.title}
                      onChange={(e) => {
                        setNewPost(prev => ({ ...prev, title: e.target.value }))
                        validateField('title', e.target.value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.title ? 'border-red-500' : 'border-theme-primary'
                      }`}
                      placeholder="Titre de votre post"
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
                      value={newPost.category}
                      onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-theme-card text-theme-primary"
                      required
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="GENERAL">Général</option>
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
                    <label htmlFor="content" className="block text-sm font-medium text-theme-primary mb-2">
                      Contenu *
                    </label>
                    <textarea
                      id="content"
                      value={newPost.content}
                      onChange={(e) => {
                        setNewPost(prev => ({ ...prev, content: e.target.value }))
                        validateField('content', e.target.value)
                      }}
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.content ? 'border-red-500' : 'border-theme-primary'
                      }`}
                      placeholder="Contenu de votre post..."
                      required
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
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
                          Publier le post
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


