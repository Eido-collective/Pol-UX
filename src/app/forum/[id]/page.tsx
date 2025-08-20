'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, MessageSquare, ChevronUp, ChevronDown, User, Calendar, Send, Loader2, Trash2, AlertTriangle } from 'lucide-react'
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

export default function ForumPostPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'mostVoted'>('mostVoted')

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/forum/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        
        // Charger les votes de l'utilisateur
        if (session?.user?.id) {
          const userVotesData: {[key: string]: number} = {}
          
          // Votes sur le post
          if (data.post.votes) {
            const userVote = data.post.votes.find((vote: Vote) => vote.userId === session.user.id)
            if (userVote) {
              userVotesData[data.post.id] = userVote.value
            }
          }
          
          // Votes sur les commentaires
          if (data.post.comments) {
            data.post.comments.forEach((comment: Comment) => {
              if (comment.votes) {
                const userVote = comment.votes.find((vote: Vote) => vote.userId === session.user.id)
                if (userVote) {
                  userVotesData[comment.id] = userVote.value
                }
              }
              
              // Votes sur les réponses
              if (comment.replies) {
                comment.replies.forEach((reply: Reply) => {
                  if (reply.votes) {
                    const userVote = reply.votes.find((vote: Vote) => vote.userId === session.user.id)
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
        console.error('Erreur lors du chargement du post')
        toast.error('Erreur lors du chargement du post')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du post')
    } finally {
      setLoading(false)
    }
  }, [params.id, session?.user?.id])

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [fetchPost, params.id])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session) return

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
        fetchPost() // Recharger le post pour afficher le nouveau commentaire
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
    if (!replyContent.trim() || !session || !replyingTo) return

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

  const handleVote = async (type: 'post' | 'comment', id: string, value: number) => {
    if (!session) return

    try {
      const endpoint = type === 'post' 
        ? `/api/forum/posts/${id}/vote`
        : `/api/forum/comments/${id}/vote`

      const response = await fetch(endpoint, {
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
          [id]: prev[id] === value ? 0 : value
        }))
        
        // Recharger le post pour mettre à jour les compteurs
        fetchPost()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors du vote')
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error)
      toast.error('Erreur lors du vote')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!session) return

    // Ouvrir la modal de confirmation
    setCommentToDelete(commentId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!commentToDelete) return

    try {
      const response = await fetch(`/api/forum/comments/${commentToDelete}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Recharger le post pour mettre à jour l'affichage
        fetchPost()
        setShowDeleteModal(false)
        setCommentToDelete(null)
        toast.success('Commentaire supprimé avec succès !')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du commentaire')
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setCommentToDelete(null)
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

  const getVoteCount = (votes: Vote[]) => {
    return votes?.reduce((sum, vote) => sum + vote.value, 0) || 0
  }

  const getSortedComments = (comments: Comment[]) => {
    if (!comments) return []
    
    const sorted = [...comments]
    if (sortBy === 'mostVoted') {
      sorted.sort((a, b) => {
        const aVotes = getVoteCount(a.votes)
        const bVotes = getVoteCount(b.votes)
        return bVotes - aVotes
      })
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    return sorted
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Général': return 'bg-blue-100 text-blue-800'
      case 'Événements': return 'bg-green-100 text-green-800'
      case 'Conseils': return 'bg-yellow-100 text-yellow-800'
      case 'Questions': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Chargement du post...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post non trouvé</h1>
          <p className="text-gray-600 mb-6">Le post que vous recherchez n&apos;existe pas ou a été supprimé.</p>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header avec bouton retour */}
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au forum</span>
          </Link>
        </div>

        {/* Post principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* En-tête du post */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Actions sur le post */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleVote('post', post.id, 1)}
                  className={`p-2 rounded-lg transition-colors ${
                    userVotes[post.id] === 1 
                      ? 'text-orange-500 bg-orange-50 border border-orange-200' 
                      : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className={`text-sm font-medium ${
                  getVoteCount(post.votes) > 0 ? 'text-orange-500' : 
                  getVoteCount(post.votes) < 0 ? 'text-blue-500' : 'text-gray-900'
                }`}>
                  {getVoteCount(post.votes)}
                </span>
                <button 
                  onClick={() => handleVote('post', post.id, -1)}
                  className={`p-2 rounded-lg transition-colors ${
                    userVotes[post.id] === -1 
                      ? 'text-blue-500 bg-blue-50 border border-blue-200' 
                      : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section commentaires */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Commentaires ({post._count.comments})</span>
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'mostVoted')}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="mostVoted">Plus populaires</option>
              <option value="newest">Plus récents</option>
            </select>
          </div>

          {/* Formulaire de commentaire */}
          {session && (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun commentaire pour le moment.</p>
                {!session && (
                  <p className="text-sm mt-2">
                    <Link href="/login" className="text-green-600 hover:underline">
                      Connectez-vous
                    </Link>{' '}
                    pour ajouter un commentaire.
                  </p>
                )}
              </div>
            ) : (
              getSortedComments(post.comments).map((comment) => (
                 <div key={comment.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                   {/* En-tête du commentaire */}
                   <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                           <User className="h-4 w-4 text-green-600" />
                         </div>
                         <div>
                           <span className="font-medium text-gray-900 text-sm">
                             {comment.author.name || comment.author.username}
                           </span>
                           <div className="text-xs text-gray-500">
                             {formatDate(comment.createdAt)}
                           </div>
                         </div>
                       </div>
                       {/* Bouton de suppression pour l'auteur ou l'admin */}
                       {session && (session.user.id === comment.author.id || session.user.role === 'ADMIN') && (
                         <button
                           onClick={() => handleDeleteComment(comment.id)}
                           className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
                           title="Supprimer le commentaire"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       )}
                     </div>
                   </div>
                   
                   {/* Contenu du commentaire */}
                   <div className="px-4 py-4">
                     <div className="text-gray-700 leading-relaxed">
                       {comment.content}
                     </div>
                   </div>
                   
                   {/* Actions du commentaire */}
                   <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-1">
                           <button 
                             onClick={() => handleVote('comment', comment.id, 1)}
                             className={`p-1 rounded transition-colors ${
                               userVotes[comment.id] === 1 
                                 ? 'text-orange-500 bg-orange-50' 
                                 : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100'
                             }`}
                           >
                             <ChevronUp className="h-3 w-3" />
                           </button>
                           <span className={`text-xs font-medium ${
                             getVoteCount(comment.votes) > 0 ? 'text-orange-500' : 
                             getVoteCount(comment.votes) < 0 ? 'text-blue-500' : 'text-gray-900'
                           }`}>
                             {getVoteCount(comment.votes)}
                           </span>
                           <button 
                             onClick={() => handleVote('comment', comment.id, -1)}
                             className={`p-1 rounded transition-colors ${
                               userVotes[comment.id] === -1 
                                 ? 'text-blue-500 bg-blue-50' 
                                 : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                             }`}
                           >
                             <ChevronDown className="h-3 w-3" />
                           </button>
                         </div>
                         {session && (
                           <button
                             onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                             className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded"
                           >
                             <MessageSquare className="h-3 w-3" />
                             <span className="text-xs">Répondre</span>
                           </button>
                         )}
                       </div>
                       {comment.replies?.length > 0 && (
                         <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                           {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}
                         </div>
                       )}
                     </div>
                   </div>

                                     {/* Formulaire de réponse */}
                   {replyingTo === comment.id && session && (
                     <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                       <form onSubmit={handleSubmitReply}>
                         <div className="mb-3">
                           <textarea
                             value={replyContent}
                             onChange={(e) => setReplyContent(e.target.value)}
                             placeholder={`Répondre à ${comment.author.name || comment.author.username}...`}
                             className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-white"
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
                             className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                           >
                             Annuler
                           </button>
                         </div>
                       </form>
                     </div>
                   )}

                                     {/* Réponses */}
                   {comment.replies && comment.replies.length > 0 && (
                     <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                       <div className="space-y-3">
                         {comment.replies.map((reply) => (
                           <div key={reply.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                             {/* En-tête de la réponse */}
                             <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-2">
                                   <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                     <User className="h-3 w-3 text-blue-600" />
                                   </div>
                                   <div className="flex items-center space-x-2">
                                     <span className="font-medium text-gray-900 text-xs">
                                       {reply.author.name || reply.author.username}
                                     </span>
                                     <span className="text-xs text-blue-600 font-medium">
                                       → {comment.author.name || comment.author.username}
                                     </span>
                                   </div>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <span className="text-xs text-gray-500">
                                     {formatDate(reply.createdAt)}
                                   </span>
                                   {/* Bouton de suppression pour l'auteur de la réponse ou l'admin */}
                                   {session && (session.user.id === reply.author.id || session.user.role === 'ADMIN') && (
                                     <button
                                       onClick={() => handleDeleteComment(reply.id)}
                                       className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
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
                               <div className="text-gray-700 text-sm leading-relaxed">
                                 {reply.content}
                               </div>
                             </div>
                             
                             {/* Actions de la réponse */}
                             <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                               <div className="flex items-center space-x-3">
                                 <div className="flex items-center space-x-1">
                                   <button 
                                     onClick={() => handleVote('comment', reply.id, 1)}
                                     className={`p-1 rounded transition-colors ${
                                       userVotes[reply.id] === 1 
                                         ? 'text-orange-500 bg-orange-50' 
                                         : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100'
                                     }`}
                                   >
                                     <ChevronUp className="h-2 w-2" />
                                   </button>
                                   <span className={`text-xs font-medium ${
                                     getVoteCount(reply.votes) > 0 ? 'text-orange-500' : 
                                     getVoteCount(reply.votes) < 0 ? 'text-blue-500' : 'text-gray-900'
                                   }`}>
                                     {getVoteCount(reply.votes)}
                                   </span>
                                   <button 
                                     onClick={() => handleVote('comment', reply.id, -1)}
                                     className={`p-1 rounded transition-colors ${
                                       userVotes[reply.id] === -1 
                                         ? 'text-blue-500 bg-blue-50' 
                                         : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
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
       {showDeleteModal && (
         <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/50">
                            {/* En-tête de la modal */}
               <div className="flex items-center space-x-3 p-6 border-b border-gray-200/60">
                 <div className="w-10 h-10 bg-red-100/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <AlertTriangle className="h-5 w-5 text-red-600" />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900">
                     Confirmer la suppression
                   </h3>
                   <p className="text-sm text-gray-500">
                     Cette action est irréversible
                   </p>
                 </div>
               </div>

             {/* Contenu de la modal */}
             <div className="p-6">
               <p className="text-gray-700 mb-6">
                 Êtes-vous sûr de vouloir supprimer ce commentaire ? 
                 Cette action ne peut pas être annulée.
               </p>

               {/* Actions */}
               <div className="flex items-center justify-end space-x-3">
                 <button
                   onClick={cancelDelete}
                   className="px-4 py-2 text-gray-700 bg-gray-100/80 backdrop-blur-sm rounded-lg hover:bg-gray-200/90 transition-all duration-200 border border-gray-200/50"
                 >
                   Annuler
                 </button>
                 <button
                   onClick={confirmDelete}
                   className="px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-700/90 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                 >
                   <Trash2 className="h-4 w-4" />
                   <span>Supprimer</span>
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }
