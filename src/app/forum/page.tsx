'use client'

import { useState, useEffect, useMemo } from 'react'
import { MessageSquare, ChevronUp, ChevronDown, Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Pagination from '@/components/Pagination'
import useSWR from 'swr'

interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  isPublished: boolean
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
  isPublished: boolean
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
  const { data: session } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('mostVoted')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  
  // Utilisation de SWR pour récupérer les posts
  const { data: postsData, error, mutate } = useSWR(
    `/api/forum/posts?page=${currentPage}&limit=10${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`
  )
  const posts = useMemo(() => postsData?.data || [], [postsData?.data])
  const pagination = postsData?.pagination
  const isLoading = !postsData && !error
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'GENERAL'
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

  // Charger les votes utilisateur quand les posts changent
  useEffect(() => {
    if (posts && session?.user?.id) {
      const userVotesData: {[key: string]: number} = {}
      
      posts.forEach((post: ForumPost) => {
        if (post.votes) {
          const userVote = post.votes.find((vote: Vote) => vote.userId === session.user.id)
          if (userVote) {
            userVotesData[post.id] = userVote.value
          }
        }
      })
      
      setUserVotes(userVotesData)
    }
  }, [posts, session?.user?.id])

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

  const handleCreatePost = () => {
    if (!session) {
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
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forum Collaboratif</h1>
              <p className="text-gray-600">Échangez avec la communauté écologique</p>
            </div>
            <button 
              onClick={handleCreatePost}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Chargement des posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun post trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres ou créez le premier post !</p>
            </div>
          ) : (
            posts.map((post: ForumPost) => (
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
      </div>

      {/* Modal de création de post */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal} // Fermer en cliquant sur le backdrop
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant sur la modale
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouveau Post</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-6">
                                 <div>
                   <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
                       errors.title ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Titre de votre post..."
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
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="GENERAL">Général</option>
                    <option value="EVENTS">Événements</option>
                    <option value="PROJECTS">Projets</option>
                    <option value="TIPS">Conseils</option>
                    <option value="NEWS">Actualités</option>
                    <option value="DISCUSSION">Discussion</option>
                  </select>
                </div>

                                 <div>
                   <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
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
                       errors.content ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Contenu de votre post..."
                     required
                   />
                   {errors.content && (
                     <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                   )}
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
                       'Publier le post'
                     )}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
