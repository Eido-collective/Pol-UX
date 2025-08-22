'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Search, ThumbsUp, ThumbsDown, Leaf, Zap, Car, Utensils, Droplets, ShoppingBag, Plus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import TipImage from '@/components/TipImage'
import Pagination from '@/components/Pagination'
import { useTips } from '@/hooks/useTips'
import useSWR from 'swr'



interface Vote {
  id: string
  value: number
  userId: string
}

export default function TipsPage() {
  const session = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('mostVoted')
  const [userVotes, setUserVotes] = useState<{[key: string]: number}>({})
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  
  // Utilisation du hook useTips
  const { tips, pagination, isLoading, mutate } = useTips({
    page: currentPage,
    limit: 9,
    search: searchTerm,
    category: selectedCategory
  })
  
  // Récupération des catégories disponibles
  const { data: categoriesData } = useSWR('/api/tips/categories')
  const availableCategories = categoriesData?.categories || []
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTip, setNewTip] = useState({
    title: '',
    content: '',
    category: 'WASTE_REDUCTION',
    imageUrl: '',
    source: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Charger les votes utilisateur quand les tips changent
  useEffect(() => {
    if (tips && session?.user?.id) {
      const userVotesData: {[key: string]: number} = {}
      
      tips.forEach((tip) => {
        if (tip.votes) {
          const userVote = tip.votes.find((vote: Vote) => vote.userId === session?.user?.id)
          if (userVote) {
            userVotesData[tip.id] = userVote.value
          }
        }
      })
      
      setUserVotes(userVotesData)
    }
  }, [tips, session?.user?.id])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WASTE_REDUCTION':
        return <Leaf className="h-5 w-5" />
      case 'ENERGY_SAVING':
        return <Zap className="h-5 w-5" />
      case 'TRANSPORT':
        return <Car className="h-5 w-5" />
      case 'FOOD':
        return <Utensils className="h-5 w-5" />
      case 'WATER':
        return <Droplets className="h-5 w-5" />
      case 'CONSUMPTION':
        return <ShoppingBag className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
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

  const handleCreateTip = () => {
    if (!session) {
      toast.error('Vous devez être connecté pour créer un conseil')
      router.push('/register')
      return
    }
    
    if (session?.user?.role === 'EXPLORER') {
      toast.error('Vous devez être Contributeur ou Administrateur pour créer des conseils')
      router.push('/promotion')
      return
    }
    
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!newTip.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (newTip.title.trim().length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères'
    }
    
    if (!newTip.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire'
    } else if (newTip.content.trim().length < 20) {
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

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTip),
      })

      if (response.ok) {
        await response.json()
        setIsModalOpen(false)
        setNewTip({ title: '', content: '', category: 'WASTE_REDUCTION', imageUrl: '', source: '' })
        setErrors({})
        mutate() // Recharger les tips
        toast.success('Conseil publié avec succès ! Il sera visible après modération.')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la publication du conseil')
      }
    } catch (error) {
      console.error('Erreur lors de la publication du conseil:', error)
      toast.error('Erreur lors de la publication du conseil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setNewTip({ title: '', content: '', category: 'WASTE_REDUCTION', imageUrl: '', source: '' })
    setErrors({})
  }

  const handleVote = async (tipId: string, value: number) => {
    if (!session) {
      router.push('/register')
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
        // Mettre à jour le vote local
        setUserVotes(prev => ({
          ...prev,
          [tipId]: prev[tipId] === value ? 0 : value
        }))
        
        // Recharger les tips pour mettre à jour les compteurs
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

  return (
    <div className="bg-theme-secondary">
      {/* Page Header */}
      <div className="bg-theme-card shadow-theme-sm border-b border-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-theme-primary">Conseils Écologiques</h1>
              <p className="text-theme-secondary">Découvrez des astuces pour réduire votre impact environnemental</p>
            </div>
            <div className="flex justify-center sm:justify-start">
              <button 
                onClick={handleCreateTip}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouveau conseil
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres */}
        <div className="bg-theme-card rounded-lg shadow-sm border border-theme-primary p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un conseil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-theme-card text-theme-primary"
              >
                <option value="all">Toutes les catégories</option>
                {availableCategories.map((category: { value: string; label: string; count: number }) => (
                  <option key={category.value} value={category.value}>
                    {getCategoryLabel(category.value)} ({category.count})
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-theme-card text-theme-primary"
              >
                <option value="mostVoted">Plus populaires</option>
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille des conseils */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-theme-secondary">Chargement des conseils...</div>
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-theme-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">Aucun conseil trouvé</h3>
            <p className="text-theme-secondary">Essayez de modifier vos filtres !</p>
          </div>
                 ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {tips.map((tip) => (
              <div
                key={tip.id}
                className="bg-theme-card rounded-lg shadow-sm border border-theme-primary overflow-hidden hover:shadow-md transition-shadow"
              >
                <TipImage
                  src={tip.imageUrl}
                  alt={tip.title}
                  width={500}
                  height={500}
                  className="h-48 w-full"
                />
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                      {getCategoryIcon(tip.category)}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                      {getCategoryLabel(tip.category)}
                    </span>
                  </div>

                  <Link href={`/tips/${tip.id}`}>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2 hover:text-green-600 transition-colors">
                      {tip.title.length > 60 
                        ? `${tip.title.substring(0, 60)}...` 
                        : tip.title
                      }
                    </h3>
                  </Link>

                  <p className="text-theme-secondary mb-4 line-clamp-4">
                    {tip.content.length > 120 
                      ? `${tip.content.substring(0, 120)}...` 
                      : tip.content
                    }
                  </p>



                  <div className="flex items-center justify-between text-sm text-theme-secondary">
                    <div className="flex items-center gap-4">
                      <span>Par {tip.author.name}</span>
                    </div>
                    <span>{formatDate(tip.createdAt)}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button 
                        className={`p-2 rounded-lg transition-colors ${
                          userVotes[tip.id] === 1 
                            ? 'text-orange-500 bg-orange-50 border border-orange-200' 
                            : 'text-theme-secondary hover:text-orange-500 hover:bg-theme-primary border border-theme-primary'
                        }`}
                        onClick={() => handleVote(tip.id, 1)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <span className={`text-sm font-medium ${
                        getVoteCount(tip.votes) > 0 ? 'text-orange-500' : 
                        getVoteCount(tip.votes) < 0 ? 'text-blue-500' : 'text-theme-primary'
                      }`}>
                        {getVoteCount(tip.votes)}
                      </span>
                      <button 
                        className={`p-2 rounded-lg transition-colors ${
                          userVotes[tip.id] === -1 
                            ? 'text-blue-500 bg-blue-50 border border-blue-200' 
                            : 'text-theme-secondary hover:text-blue-500 hover:bg-theme-primary border border-theme-primary'
                        }`}
                        onClick={() => handleVote(tip.id, -1)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
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
       </div>

       {/* Modal de création de conseil */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-card/95 backdrop-blur-sm rounded-lg shadow-theme-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-theme-primary">Nouveau Conseil</h2>
                <button
                  onClick={closeModal}
                  className="text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitTip} className="space-y-4">
                                 <div>
                   <label htmlFor="title" className="block text-sm font-medium text-theme-secondary mb-2">
                     Titre *
                   </label>
                   <input
                     type="text"
                     id="title"
                     value={newTip.title}
                                           onChange={(e) => {
                        setNewTip(prev => ({ ...prev, title: e.target.value }))
                        validateField('title', e.target.value)
                      }}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                       errors.title ? 'border-red-500' : 'border-theme-primary'
                     }`}
                     placeholder="Titre de votre conseil..."
                     required
                   />
                   {errors.title && (
                     <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                   )}
                 </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-theme-secondary mb-2">
                    Catégorie *
                  </label>
                  <select
                    id="category"
                    value={newTip.category}
                    onChange={(e) => setNewTip(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="WASTE_REDUCTION">Réduction des déchets</option>
                    <option value="ENERGY_SAVING">Économies d&apos;énergie</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="FOOD">Alimentation</option>
                    <option value="WATER">Eau</option>
                    <option value="CONSUMPTION">Consommation</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>

                                 <div>
                   <label htmlFor="content" className="block text-sm font-medium text-theme-secondary mb-2">
                     Contenu *
                   </label>
                   <textarea
                     id="content"
                     value={newTip.content}
                                           onChange={(e) => {
                        setNewTip(prev => ({ ...prev, content: e.target.value }))
                        validateField('content', e.target.value)
                      }}
                     rows={6}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                       errors.content ? 'border-red-500' : 'border-theme-primary'
                     }`}
                     placeholder="Contenu de votre conseil..."
                     required
                   />
                   {errors.content && (
                     <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                   )}
                 </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-theme-secondary mb-2">
                    URL de l&apos;image (optionnel)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={newTip.imageUrl}
                    onChange={(e) => setNewTip(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-theme-secondary mb-2">
                    URL de la source (optionnel)
                  </label>
                  <input
                    type="url"
                    id="source"
                    value={newTip.source}
                    onChange={(e) => setNewTip(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-theme-secondary bg-theme-primary hover:bg-theme-secondary rounded-lg transition-colors"
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
                       'Publier le conseil'
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
