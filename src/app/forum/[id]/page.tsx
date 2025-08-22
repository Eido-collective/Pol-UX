'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, ChevronUp, ChevronDown, User, Calendar, MessageSquare, Trash2, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Vote {
  id: string
  value: number
  userId: string
}

interface Reply {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    username: string
  }
  votes: Vote[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    username: string
  }
  replies: Reply[]
  votes: Vote[]
}

interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  author: {
    name: string
    username: string
  }
  comments: Comment[]
  votes: Vote[]
  _count: {
    comments: number
    votes: number
  }
}

export default function ForumPostDetailPage() {
  const params = useParams()
  const session = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  // Memoize the user ID to prevent infinite re-renders
  const userId = useMemo(() => session?.user?.id, [session?.user?.id])

  const fetchPost = useCallback(async () => {
    if (!params.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/forum/posts/${params.id}`, {
        cache: 'no-store' // Forcer le rechargement sans cache
      })
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        
        // Charger les votes utilisateur
        if (userId) {
          const userVotesData: {[key: string]: number} = {}
          
          // Votes du post
          if (data.post.votes) {
            const userVote = data.post.votes.find((vote: Vote) => vote.userId === userId)
            if (userVote) {
              userVotesData[data.post.id] = userVote.value
            }
          }
          
          // Votes des commentaires
          if (data.post.comments) {
            data.post.comments.forEach((comment: Comment) => {
              if (comment.votes) {
                const userVote = comment.votes.find((vote: Vote) => vote.userId === userId)
                if (userVote) {
                  userVotesData[comment.id] = userVote.value
                }
              }
              
              // Votes sur les réponses
              if (comment.replies) {
                comment.replies.forEach((reply: Reply) => {
                  if (reply.votes) {
                    const userVote = reply.votes.find((vote: Vote) => vote.userId === userId)
                    if (userVote) {
                      userVotesData[reply.id] = userVote.value
                    }
                  }
                })
              }
            })
          }
          
          setUserVotes(userVotesData)
        }
      } else {
        toast.error('Post non trouvé')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du post')
    } finally {
      setLoading(false)
    }
  }, [params.id, userId])

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [fetchPost, params.id, userId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session?.user) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/forum/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment('')
        // Attendre un peu avant de recharger pour s'assurer que la DB a bien enregistré
        setTimeout(() => {
          fetchPost() // Recharger le post pour afficher le nouveau commentaire
        }, 500)
        toast.success('Commentaire ajouté avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de l\'ajout du commentaire')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'ajout du commentaire')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !session?.user || !replyingTo) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/forum/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: replyContent,
          parentId: replyingTo 
        }),
      })

      if (response.ok) {
        setReplyContent('')
        setReplyingTo(null)
        fetchPost() // Recharger le post pour afficher la nouvelle réponse
        toast.success('Réponse ajoutée avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de l\'ajout de la réponse')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'ajout de la réponse')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = useCallback(async (type: 'post' | 'comment' | 'reply', id: string, value: number) => {
    if (!userId) {
      toast.error('Vous devez être connecté pour voter')
      router.push('/login')
      return
    }

    try {
      // Mise à jour optimiste de l'interface
      const currentVote = userVotes[id] || 0
      const newVote = currentVote === value ? 0 : value

      // Mettre à jour le vote local immédiatement
      setUserVotes(prev => ({
        ...prev,
        [id]: newVote
      }))

      // Mise à jour optimiste du post ou commentaire
      if (type === 'post' && post) {
        setPost(prevPost => {
          if (!prevPost) return prevPost
          

          
          let newVotes = [...(prevPost.votes || [])]
          newVotes = newVotes.filter(vote => vote.userId !== userId)
          
          if (newVote !== 0) {
            newVotes.push({
              id: `temp-${Date.now()}`,
              value: newVote,
              userId: userId
            })
          }
          
          return {
            ...prevPost,
            votes: newVotes
          }
        })
             } else if (type === 'comment' && post) {
         setPost(prevPost => {
           if (!prevPost) return prevPost
           
           const updatedComments = prevPost.comments.map(comment => {
             if (comment.id === id) {

               
               let newVotes = [...(comment.votes || [])]
               newVotes = newVotes.filter(vote => vote.userId !== userId)
               
               if (newVote !== 0) {
                 newVotes.push({
                   id: `temp-${Date.now()}`,
                   value: newVote,
                   userId: userId
                 })
               }
               
               return {
                 ...comment,
                 votes: newVotes
               }
             }
             return comment
           })
           
                       // Trier les commentaires par score décroissant
            updatedComments.sort((a, b) => {
              const aVotes = getVoteCount(a.votes)
              const bVotes = getVoteCount(b.votes)
              return bVotes - aVotes
            })
            
            // Trier aussi les réponses de chaque commentaire par score
            updatedComments.forEach(comment => {
              if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => {
                  const aVotes = getVoteCount(a.votes)
                  const bVotes = getVoteCount(b.votes)
                  return bVotes - aVotes
                })
              }
            })
            
                        return {
              ...prevPost,
              comments: updatedComments
            }
          })
        } else if (type === 'reply' && post) {
          setPost(prevPost => {
            if (!prevPost) return prevPost
            
            const updatedComments = prevPost.comments.map(comment => {
              const updatedReplies = comment.replies?.map(reply => {
                if (reply.id === id) {

                  
                  let newVotes = [...(reply.votes || [])]
                  newVotes = newVotes.filter(vote => vote.userId !== userId)
                  
                  if (newVote !== 0) {
                    newVotes.push({
                      id: `temp-${Date.now()}`,
                      value: newVote,
                      userId: userId
                    })
                  }
                  
                  return {
                    ...reply,
                    votes: newVotes
                  }
                }
                return reply
              })
              
              // Trier les réponses par score décroissant
              if (updatedReplies && updatedReplies.length > 0) {
                updatedReplies.sort((a, b) => {
                  const aVotes = getVoteCount(a.votes)
                  const bVotes = getVoteCount(b.votes)
                  return bVotes - aVotes
                })
              }
              
              return {
                ...comment,
                replies: updatedReplies
              }
            })
            
            return {
              ...prevPost,
              comments: updatedComments
            }
          })
        }

      const endpoint = type === 'post' 
        ? `/api/forum/posts/${id}/vote`
        : type === 'comment'
        ? `/api/forum/comments/${id}/vote`
        : `/api/forum/comments/${id}/vote` // Les réponses utilisent le même endpoint que les commentaires

      const response = await fetch(endpoint, {
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
          [id]: currentVote
        }))
        
        // Recharger le post pour revenir à l'état correct
        fetchPost()
        
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors du vote')
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error)
      toast.error('Erreur lors du vote')
    }
  }, [userId, userVotes, post, fetchPost, router])

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/forum/comments/${commentId}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Recharger le post pour mettre à jour l'affichage
        fetchPost()
        toast.success('Commentaire supprimé avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la suppression du commentaire')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error)
      toast.error('Erreur lors de la suppression du commentaire')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVoteCount = useCallback((votes: Vote[]) => {
    return votes?.reduce((sum, vote) => sum + vote.value, 0) || 0
  }, [])

  const getSortedComments = useCallback((comments: Comment[]) => {
    if (!comments) return []
    
    const sorted = [...comments]
    // Trier par score décroissant (comme Reddit)
    sorted.sort((a, b) => {
      const aVotes = getVoteCount(a.votes)
      const bVotes = getVoteCount(b.votes)
      return bVotes - aVotes
    })
    
    // Trier aussi les réponses de chaque commentaire par score
    sorted.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => {
          const aVotes = getVoteCount(a.votes)
          const bVotes = getVoteCount(b.votes)
          return bVotes - aVotes
        })
      }
    })
    
    return sorted
  }, [getVoteCount])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GENERAL': return 'bg-theme-tertiary text-theme-secondary'
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
      case 'QUESTIONS': return 'bg-purple-100 text-purple-800'
      case 'DISCUSSIONS': return 'bg-blue-100 text-blue-800'
      case 'EVENTS': return 'bg-orange-100 text-orange-800'
      case 'RESOURCES': return 'bg-green-100 text-green-800'
      case 'NEWS': return 'bg-red-100 text-red-800'
      default: return 'bg-theme-tertiary text-theme-secondary'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-theme-secondary">Chargement du post...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Post non trouvé</h1>
          <p className="text-theme-secondary mb-6">Le post que vous recherchez n&apos;existe pas ou a été supprimé.</p>
          <Link
            href="/forum"
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au forum</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-theme-secondary min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header avec bouton retour */}
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center space-x-2 text-theme-secondary hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au forum</span>
          </Link>
        </div>

        {/* Post principal */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6 mb-6">
          {/* En-tête du post */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-theme-primary">{post.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-theme-secondary">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{post.author.name || post.author.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post._count.comments} commentaires</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChevronUp className="h-4 w-4" />
                <span>{post._count.votes} votes</span>
              </div>
            </div>
          </div>

          {/* Contenu du post */}
          <div className="prose max-w-none">
            <div className="text-theme-secondary leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </div>
          </div>

          {/* Actions sur le post */}
          <div className="mt-6 pt-4 border-t border-theme-primary">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleVote('post', post.id, 1)}
                  className={`p-2 rounded-lg transition-colors ${
                    userVotes[post.id] === 1 
                      ? 'text-orange-500 bg-orange-50 border border-orange-200' 
                      : 'text-theme-secondary hover:text-orange-500 hover:bg-theme-tertiary border border-theme-primary'
                  }`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className={`text-sm font-medium ${
                  getVoteCount(post.votes) > 0 ? 'text-orange-500' : 
                  getVoteCount(post.votes) < 0 ? 'text-blue-500' : 'text-theme-primary'
                }`}>
                  {getVoteCount(post.votes)}
                </span>
                <button 
                  onClick={() => handleVote('post', post.id, -1)}
                  className={`p-2 rounded-lg transition-colors ${
                    userVotes[post.id] === -1 
                      ? 'text-blue-500 bg-blue-50 border border-blue-200' 
                      : 'text-theme-secondary hover:text-blue-500 hover:bg-theme-tertiary border border-theme-primary'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section commentaires */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-theme-primary flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Commentaires ({post._count.comments})</span>
            </h2>

          </div>

          {/* Formulaire de commentaire */}
          {session && (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-theme-card text-theme-primary"
                  rows={3}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{submitting ? 'Envoi...' : 'Publier'}</span>
              </button>
            </form>
          )}

          {/* Liste des commentaires */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-theme-secondary">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-theme-secondary" />
                <p>Aucun commentaire pour le moment.</p>
                {!session && (
                  <p className="text-sm mt-2">
                                    <Link href="/register" className="text-green-600 hover:underline">
                  Inscrivez-vous
                </Link>{' '}
                    pour ajouter un commentaire.
                  </p>
                )}
              </div>
            ) : (
              getSortedComments(post.comments).map((comment) => (
                 <div key={comment.id} className="bg-theme-card border border-theme-primary rounded-lg shadow-theme-sm">
                   {/* En-tête du commentaire */}
                   <div className="px-4 py-3 border-b border-theme-primary bg-theme-tertiary rounded-t-lg">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                           <User className="h-4 w-4 text-green-600" />
                         </div>
                         <div>
                           <span className="font-medium text-theme-primary text-sm">
                             {comment.author.name || comment.author.username}
                           </span>
                           <div className="text-xs text-theme-secondary">
                             {formatDate(comment.createdAt)}
                           </div>
                         </div>
                       </div>
                       {/* Bouton de suppression pour l'auteur ou l'admin */}
                       {session?.user && (session.user.id === comment.author.id || session.user.role === 'ADMIN') && (
                         <button
                           onClick={() => handleDeleteComment(comment.id)}
                           className="p-1 text-theme-secondary hover:text-red-600 transition-colors rounded"
                           title="Supprimer le commentaire"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       )}
                     </div>
                   </div>
                   
                   {/* Contenu du commentaire */}
                   <div className="px-4 py-4">
                     <div className="text-theme-secondary leading-relaxed break-words whitespace-pre-wrap">
                       {comment.content}
                     </div>
                   </div>
                   
                   {/* Actions du commentaire */}
                   <div className="px-4 py-3 border-t border-theme-primary bg-theme-tertiary rounded-b-lg">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-1">
                           <button 
                             onClick={() => handleVote('comment', comment.id, 1)}
                             className={`p-1 rounded transition-colors ${
                               userVotes[comment.id] === 1 
                                 ? 'text-orange-500 bg-orange-50' 
                                 : 'text-theme-secondary hover:text-orange-500 hover:bg-theme-card'
                             }`}
                           >
                             <ChevronUp className="h-3 w-3" />
                           </button>
                           <span className={`text-xs font-medium ${
                             getVoteCount(comment.votes) > 0 ? 'text-orange-500' : 
                             getVoteCount(comment.votes) < 0 ? 'text-blue-500' : 'text-theme-primary'
                           }`}>
                             {getVoteCount(comment.votes)}
                           </span>
                           <button 
                             onClick={() => handleVote('comment', comment.id, -1)}
                             className={`p-1 rounded transition-colors ${
                               userVotes[comment.id] === -1 
                                 ? 'text-blue-500 bg-blue-50' 
                                 : 'text-theme-secondary hover:text-blue-500 hover:bg-theme-card'
                             }`}
                           >
                             <ChevronDown className="h-3 w-3" />
                           </button>
                         </div>
                         {session && (
                           <button
                             onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                             className="flex items-center space-x-1 px-2 py-1 text-theme-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors rounded"
                           >
                             <MessageSquare className="h-3 w-3" />
                             <span className="text-xs">Répondre</span>
                           </button>
                         )}
                       </div>
                       {comment.replies?.length > 0 && (
                         <div className="text-xs text-theme-secondary bg-theme-card px-2 py-1 rounded-full border border-theme-primary">
                           {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}
                         </div>
                       )}
                     </div>
                   </div>

                                     {/* Formulaire de réponse */}
                   {replyingTo === comment.id && session && (
                     <div className="px-4 py-3 bg-theme-tertiary border-t border-theme-primary">
                       <form onSubmit={handleSubmitReply}>
                         <div className="mb-3">
                           <textarea
                             value={replyContent}
                             onChange={(e) => setReplyContent(e.target.value)}
                             placeholder={`Répondre à ${comment.author.name || comment.author.username}...`}
                             className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-theme-card text-theme-primary"
                             rows={3}
                             required
                           />
                         </div>
                         <div className="flex items-center space-x-2">
                           <button
                             type="submit"
                             disabled={submitting || !replyContent.trim()}
                             className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                           >
                             {submitting ? (
                               <Loader2 className="h-3 w-3 animate-spin" />
                             ) : (
                               <Send className="h-3 w-3" />
                             )}
                             <span>{submitting ? 'Envoi...' : 'Répondre'}</span>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               setReplyingTo(null)
                               setReplyContent('')
                             }}
                             className="px-3 py-1 text-theme-secondary hover:text-theme-primary transition-colors text-sm"
                           >
                             Annuler
                           </button>
                         </div>
                       </form>
                     </div>
                   )}

                                                         {/* Réponses */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="px-4 py-3 bg-theme-tertiary border-t border-theme-primary">
                        <div className="space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-theme-card rounded-lg border border-theme-primary shadow-theme-sm">
                              {/* En-tête de la réponse */}
                              <div className="px-3 py-2 border-b border-theme-primary bg-theme-tertiary rounded-t-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-theme-primary text-xs">
                                        {reply.author.name || reply.author.username}
                                      </span>
                                      <span className="text-xs text-blue-600 font-medium">
                                        → {comment.author.name || comment.author.username}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-theme-secondary">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                    {/* Bouton de suppression pour l'auteur de la réponse ou l'admin */}
                                    {session?.user && (session.user.id === reply.author.id || session.user.role === 'ADMIN') && (
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="p-1 text-theme-secondary hover:text-red-600 transition-colors rounded"
                                        title="Supprimer la réponse"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Contenu de la réponse */}
                              <div className="px-3 py-2">
                                <div className="text-theme-secondary text-sm leading-relaxed break-words whitespace-pre-wrap">
                                  {reply.content}
                                </div>
                              </div>
                              
                              {/* Actions de la réponse */}
                              <div className="px-3 py-2 border-t border-theme-primary bg-theme-tertiary rounded-b-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                                                         <button 
                                       onClick={() => handleVote('reply', reply.id, 1)}
                                       className={`p-1 rounded transition-colors ${
                                         userVotes[reply.id] === 1 
                                           ? 'text-orange-500 bg-orange-50' 
                                           : 'text-theme-secondary hover:text-orange-500 hover:bg-theme-card'
                                       }`}
                                     >
                                       <ChevronUp className="h-2 w-2" />
                                     </button>
                                     <span className={`text-xs font-medium ${
                                       getVoteCount(reply.votes) > 0 ? 'text-orange-500' : 
                                       getVoteCount(reply.votes) < 0 ? 'text-blue-500' : 'text-theme-primary'
                                     }`}>
                                       {getVoteCount(reply.votes)}
                                     </span>
                                     <button 
                                       onClick={() => handleVote('reply', reply.id, -1)}
                                       className={`p-1 rounded transition-colors ${
                                         userVotes[reply.id] === -1 
                                           ? 'text-blue-500 bg-blue-50' 
                                           : 'text-theme-secondary hover:text-blue-500 hover:bg-theme-card'
                                       }`}
                                     >
                                       <ChevronDown className="h-2 w-2" />
                                     </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
                 </div>
       </div>

               {/* Modal de confirmation de suppression */}
        {commentToDelete && (
          <div 
            className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCommentToDelete(null)} // Fermer en cliquant sur le backdrop
          >
            <div 
              className="bg-theme-card rounded-lg shadow-theme-xl max-w-md w-full p-6 border border-theme-primary"
              onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant sur la modale
            >
              <h3 className="text-lg font-semibold text-theme-primary mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-theme-secondary mb-6">
                Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setCommentToDelete(null)}
                  className="px-4 py-2 text-theme-secondary bg-theme-tertiary hover:bg-theme-primary rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleDeleteComment(commentToDelete)
                    setCommentToDelete(null)
                  }}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
     </div>
   )
 }
