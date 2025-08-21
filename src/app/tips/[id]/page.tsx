'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, ThumbsUp, ThumbsDown, User, Calendar, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import TipImage from '@/components/TipImage'

interface Tip {
  id: string
  title: string
  content: string
  category: string
  imageUrl?: string
  source?: string
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

export default function TipPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [tip, setTip] = useState<Tip | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})

  const fetchTip = useCallback(async () => {
    try {
      const response = await fetch(`/api/tips/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTip(data.tip)
        
        // Charger les votes de l'utilisateur
        if (session?.user?.id) {
          const userVotesData: {[key: string]: number} = {}
          
          if (data.tip.votes) {
            const userVote = data.tip.votes.find((vote: Vote) => vote.userId === session.user.id)
            if (userVote) {
              userVotesData[data.tip.id] = userVote.value
            }
          }
          
          setUserVotes(userVotesData)
        }
      } else {
        console.error('Erreur lors du chargement du conseil')
        toast.error('Erreur lors du chargement du conseil')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du conseil')
    } finally {
      setLoading(false)
    }
  }, [params.id, session?.user?.id])

  useEffect(() => {
    fetchTip()
  }, [fetchTip])

  const handleVote = async (tipId: string, value: number) => {
    if (!session) {
      toast.error('Vous devez être connecté pour voter')
      return
    }

    try {
      const response = await fetch(`/api/tips/${tipId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      })

      if (response.ok) {
        setUserVotes(prev => ({
          ...prev,
          [tipId]: prev[tipId] === value ? 0 : value
        }))
        fetchTip()
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
      case 'WASTE_REDUCTION': return 'Réduction des déchets'
      case 'ENERGY_SAVING': return 'Économies d\'énergie'
      case 'TRANSPORT': return 'Transport'
      case 'FOOD': return 'Alimentation'
      case 'WATER': return 'Eau'
      case 'CONSUMPTION': return 'Consommation'
      case 'OTHER': return 'Autre'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ENERGY': return 'bg-yellow-100 text-yellow-800'
      case 'WASTE': return 'bg-orange-100 text-orange-800'
      case 'TRANSPORT': return 'bg-blue-100 text-blue-800'
      case 'FOOD': return 'bg-green-100 text-green-800'
      case 'WATER': return 'bg-cyan-100 text-cyan-800'
      case 'DIGITAL': return 'bg-purple-100 text-purple-800'
      case 'OTHER': return 'bg-theme-tertiary text-theme-secondary'
      default: return 'bg-theme-tertiary text-theme-secondary'
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
      <div className="bg-theme-secondary min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-theme-secondary">Chargement du conseil...</div>
        </div>
      </div>
    )
  }

  if (!tip) {
    return (
      <div className="bg-theme-secondary min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Conseil non trouvé</h1>
          <p className="text-theme-secondary mb-6">Le conseil que vous recherchez n&apos;existe pas ou a été supprimé.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-theme-secondary min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec bouton retour */}
        <div className="mb-6">
          <Link
            href="/tips"
            className="inline-flex items-center space-x-2 text-theme-secondary hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux conseils</span>
          </Link>
        </div>

        {/* Conseil principal */}
        <div className="bg-theme-card rounded-lg shadow-theme-sm border border-theme-primary overflow-hidden">
          {/* Image du conseil */}
          <div className="w-full h-80 md:h-96">
            <TipImage
              src={tip.imageUrl}
              alt={tip.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
              priority={true}
              className="w-full h-full"
              fallbackIcon={<Lightbulb className="h-24 w-24 text-green-600" />}
            />
          </div>

          <div className="p-6">
            {/* En-tête du conseil */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tip.category)}`}>
                  {getCategoryLabel(tip.category)}
                </span>
                
                {/* Système de vote */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleVote(tip.id, 1)}
                    className={`p-2 rounded-lg transition-colors ${
                      userVotes[tip.id] === 1 
                        ? 'text-orange-500 bg-orange-50 border border-orange-200' 
                        : 'text-theme-secondary hover:text-orange-500 hover:bg-theme-tertiary border border-theme-primary'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <span className={`text-lg font-bold ${
                    getVoteCount(tip.votes) < 0 ? 'text-blue-500' : 'text-theme-primary'
                  }`}>
                    {getVoteCount(tip.votes)}
                  </span>
                  <button 
                    onClick={() => handleVote(tip.id, -1)}
                    className={`p-2 rounded-lg transition-colors ${
                      userVotes[tip.id] === -1 
                        ? 'text-blue-500 bg-blue-50 border border-blue-200' 
                        : 'text-theme-secondary hover:text-blue-500 hover:bg-theme-tertiary border border-theme-primary'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-theme-primary mb-4">
                {tip.title}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{tip.author.name || tip.author.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tip.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contenu du conseil */}
            <div className="text-theme-secondary leading-relaxed whitespace-pre-wrap">
              {tip.content}
            </div>

            {/* Source du conseil */}
            {tip.source && (
              <div className="mt-8 pt-6 border-t border-theme-primary">
                <h3 className="text-lg font-semibold text-theme-primary mb-3">Source</h3>
                <a 
                  href={tip.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 underline font-medium"
                >
                  📖 Voir la source originale
                  <span className="text-sm">↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
