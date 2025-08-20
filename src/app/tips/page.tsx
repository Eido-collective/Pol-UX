'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lightbulb, Search, ThumbsUp, ThumbsDown, Leaf, Zap, Car, Utensils, Droplets, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

interface Tip {
  id: string
  title: string
  content: string
  category: string
  imageUrl?: string
  createdAt: string
  isApproved: boolean
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

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([])
  const [filteredTips, setFilteredTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  const filterAndSortTips = useCallback(() => {
    let filtered = tips.filter(tip => tip.isApproved)

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tip => tip.category === selectedCategory)
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
        default:
          return 0
      }
    })

    setFilteredTips(filtered)
  }, [tips, searchTerm, selectedCategory, sortBy])

  useEffect(() => {
    fetchTips()
  }, [])

  useEffect(() => {
    filterAndSortTips()
  }, [filterAndSortTips])

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/tips')
      if (response.ok) {
        const data = await response.json()
        setTips(data.tips)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conseils:', error)
    } finally {
      setLoading(false)
    }
  }

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
      case 'WASTE_REDUCTION': return 'bg-green-100 text-green-800'
      case 'ENERGY_SAVING': return 'bg-yellow-100 text-yellow-800'
      case 'TRANSPORT': return 'bg-blue-100 text-blue-800'
      case 'FOOD': return 'bg-orange-100 text-orange-800'
      case 'WATER': return 'bg-cyan-100 text-cyan-800'
      case 'CONSUMPTION': return 'bg-purple-100 text-purple-800'
      case 'OTHER': return 'bg-gray-100 text-gray-800'
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
              <h1 className="text-2xl font-bold text-gray-900">Conseils Écologiques</h1>
              <p className="text-gray-600">Découvrez des astuces pour réduire votre impact environnemental</p>
            </div>
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
                  placeholder="Rechercher un conseil..."
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
                <option value="WASTE_REDUCTION">Réduction des déchets</option>
                <option value="ENERGY_SAVING">Économies d&apos;énergie</option>
                <option value="TRANSPORT">Transport</option>
                <option value="FOOD">Alimentation</option>
                <option value="WATER">Eau</option>
                <option value="CONSUMPTION">Consommation</option>
                <option value="OTHER">Autre</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="mostVoted">Plus votés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille des conseils */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement des conseils...</div>
          </div>
        ) : filteredTips.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun conseil trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres !</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip) => (
              <div
                key={tip.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {tip.imageUrl && (
                  <div className="h-48 bg-gray-200">
                    <Image
                      src={tip.imageUrl}
                      alt={tip.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                      {getCategoryIcon(tip.category)}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                      {getCategoryLabel(tip.category)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tip.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-4">
                    {tip.content}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{getVoteCount(tip.votes)}</span>
                      </div>
                      <span>Par {tip.author.name}</span>
                    </div>
                    <span>{formatDate(tip.createdAt)}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      Utile
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <ThumbsDown className="h-4 w-4" />
                      Pas utile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
