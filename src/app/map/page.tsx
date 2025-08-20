'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Filter, Search, Calendar, Users, Building } from 'lucide-react'

// Import dynamique de la carte pour éviter les erreurs SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  )
})

interface Initiative {
  id: string
  title: string
  description: string
  type: 'EVENT' | 'PROJECT' | 'ASSOCIATION' | 'COMPANY'
  latitude: number
  longitude: number
  address: string
  city: string
  startDate?: string
  endDate?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  author: {
    name: string
    username: string
  }
}

export default function MapPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCity, setSelectedCity] = useState<string>('all')

  useEffect(() => {
    fetchInitiatives()
  }, [])

  useEffect(() => {
    filterInitiatives()
  }, [initiatives, searchTerm, selectedType, selectedCity])

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('/api/initiatives')
      if (response.ok) {
        const data = await response.json()
        setInitiatives(data.initiatives)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des initiatives:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInitiatives = () => {
    let filtered = initiatives.filter(initiative => initiative.isApproved)

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(initiative =>
        initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(initiative => initiative.type === selectedType)
    }

    // Filtre par ville
    if (selectedCity !== 'all') {
      filtered = filtered.filter(initiative => initiative.city === selectedCity)
    }

    setFilteredInitiatives(filtered)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'PROJECT':
        return <MapPin className="h-4 w-4 text-green-500" />
      case 'ASSOCIATION':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'COMPANY':
        return <Building className="h-4 w-4 text-orange-500" />
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'EVENT':
        return 'Événement'
      case 'PROJECT':
        return 'Projet'
      case 'ASSOCIATION':
        return 'Association'
      case 'COMPANY':
        return 'Entreprise'
      default:
        return type
    }
  }

  const cities = Array.from(new Set(initiatives.map(i => i.city))).sort()

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carte des Initiatives</h1>
              <p className="text-gray-600">Découvrez les initiatives écologiques près de chez vous</p>
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
                  placeholder="Rechercher une initiative..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Tous les types</option>
                <option value="EVENT">Événements</option>
                <option value="PROJECT">Projets</option>
                <option value="ASSOCIATION">Associations</option>
                <option value="COMPANY">Entreprises</option>
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {loading ? (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500">Chargement de la carte...</div>
                </div>
              ) : (
                <MapComponent initiatives={filteredInitiatives} />
              )}
            </div>
          </div>

          {/* Liste des initiatives */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Initiatives ({filteredInitiatives.length})
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredInitiatives.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Aucune initiative trouvée
                  </div>
                ) : (
                  filteredInitiatives.map((initiative) => (
                    <div
                      key={initiative.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getTypeIcon(initiative.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {initiative.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {initiative.city}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getTypeLabel(initiative.type)}
                            </span>
                            {initiative.startDate && (
                              <span className="text-xs text-gray-500">
                                {new Date(initiative.startDate).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {initiative.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
