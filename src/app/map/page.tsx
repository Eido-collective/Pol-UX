'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Search, Calendar, Users, Building, Plus, X, Info, Eye, Globe, Mail, Phone } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Pagination from '@/components/Pagination'
import { useInitiatives, useCities } from '@/hooks/useInitiatives'

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
  type: 'EVENT' | 'PROJECT' | 'ACTOR' | 'COMPANY'
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
  isPublished: boolean
  author: {
    name: string
    username: string
  }
}

export default function MapPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | undefined>(undefined)
  
  // Utilisation de SWR pour récupérer les initiatives
  const { initiatives, isLoading, mutate } = useInitiatives({
    city: selectedCity !== 'all' ? selectedCity : undefined,
    type: selectedType !== 'all' ? selectedType : undefined
  })

  // Récupérer toutes les villes disponibles (sans filtres)
  const { cities: availableCities } = useCities()

  // Revalidation manuelle uniquement quand les filtres changent (pas automatique)
  const revalidateData = useCallback(() => {
    if (mutate && !selectedInitiativeId) { // Ne pas revalider si on a une initiative sélectionnée
      mutate()
    }
  }, [mutate, selectedInitiativeId])

  // Revalider seulement quand les filtres changent, pas en continu
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      revalidateData()
    }, 200) // Délai pour éviter les conflits

    return () => clearTimeout(timeoutId)
  }, [selectedCity, selectedType, revalidateData])

  // Filtrage temporaire (à optimiser plus tard)
  const filteredInitiatives = initiatives.filter(initiative => {
    if (!initiative.isPublished) return false
    if (searchTerm) {
      return initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             initiative.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             initiative.city.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    type: 'EVENT' as 'EVENT' | 'PROJECT' | 'ACTOR' | 'COMPANY',
    latitude: 0,
    longitude: 0,
    address: '',
    city: '',
    startDate: '',
    endDate: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    imageUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Modal détails
  const [selectedInitiativeForDetails, setSelectedInitiativeForDetails] = useState<Initiative | null>(null)

  // Pagination pour les initiatives sans localisation
  const [currentPageWithoutAddress, setCurrentPageWithoutAddress] = useState(1)
  const [itemsPerPageWithoutAddress] = useState(6)

  const closeModal = () => {
    setIsModalOpen(false)
    setNewInitiative({
      title: '',
      description: '',
      type: 'EVENT',
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      startDate: '',
      endDate: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      imageUrl: ''
    })
    setErrors({})
  }

  const closeDetailsModal = () => {
    setSelectedInitiativeForDetails(null)
  }

  // Bloquer le scroll quand une modale est ouverte
  useEffect(() => {
    if (isModalOpen || selectedInitiativeForDetails) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Nettoyer lors du démontage du composant
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen, selectedInitiativeForDetails])

  // Fermer les modales avec Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) {
          closeModal()
        }
        if (selectedInitiativeForDetails) {
          closeDetailsModal()
        }
      }
    }

    if (isModalOpen || selectedInitiativeForDetails) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen, selectedInitiativeForDetails])

    const handlePageChangeWithoutAddress = (page: number) => {
    setCurrentPageWithoutAddress(page)
    // Scroll vers le haut de la section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Séparer les initiatives avec et sans adresse
  const initiativesWithAddress = filteredInitiatives.filter(initiative => 
    initiative.address && initiative.address.trim() !== '' && 
    initiative.latitude !== 0 && initiative.longitude !== 0
  )

  const initiativesWithoutAddress = filteredInitiatives.filter(initiative => 
    !initiative.address || initiative.address.trim() === '' || 
    initiative.latitude === 0 || initiative.longitude === 0
  )

  // Pagination pour les initiatives sans localisation
  const totalPagesWithoutAddress = Math.ceil(initiativesWithoutAddress.length / itemsPerPageWithoutAddress)
  const startIndexWithoutAddress = (currentPageWithoutAddress - 1) * itemsPerPageWithoutAddress
  const endIndexWithoutAddress = startIndexWithoutAddress + itemsPerPageWithoutAddress
  const paginatedInitiativesWithoutAddress = initiativesWithoutAddress.slice(startIndexWithoutAddress, endIndexWithoutAddress)

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('/api/initiatives')
      if (response.ok) {
        await response.json()
        mutate() // Revalider le cache SWR
      }
    } catch (error) {
      console.error('Erreur lors du chargement des initiatives:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'PROJECT':
        return <MapPin className="h-4 w-4 text-green-500" />
      case 'ACTOR':
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
      case 'ACTOR':
        return 'Acteur'
      case 'COMPANY':
        return 'Entreprise'
      default:
        return type
    }
  }

  // Utiliser les villes disponibles depuis l'API
  const cities = availableCities

  const handleCreateInitiative = () => {
    if (!session) {
      toast.error('Vous devez être connecté pour créer une initiative')
      router.push('/login')
      return
    }
    
    if (session.user.role === 'EXPLORER') {
      toast.error('Vous devez être Contributeur ou Administrateur pour créer des initiatives')
      router.push('/promotion')
      return
    }
    
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!newInitiative.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (newInitiative.title.trim().length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères'
    }
    
    if (!newInitiative.description.trim()) {
      newErrors.description = 'La description est obligatoire'
    } else if (newInitiative.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères'
    }

    if (!newInitiative.address.trim()) {
      newErrors.address = "L'adresse est obligatoire"
    }

    if (!newInitiative.city.trim()) {
      newErrors.city = 'La ville est obligatoire'
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
    
    if (field === 'description') {
      if (!value.trim()) {
        newErrors.description = 'La description est obligatoire'
      } else if (value.trim().length < 20) {
        newErrors.description = 'La description doit contenir au moins 20 caractères'
      } else {
        delete newErrors.description
      }
    }

    if (field === 'address') {
      if (!value.trim()) {
        newErrors.address = "L'adresse est obligatoire"
      } else {
        delete newErrors.address
      }
    }

    if (field === 'city') {
      if (!value.trim()) {
        newErrors.city = 'La ville est obligatoire'
      } else {
        delete newErrors.city
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmitInitiative = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/initiatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInitiative),
      })

      if (response.ok) {
        await response.json()
        setIsModalOpen(false)
        setNewInitiative({
          title: '',
          description: '',
          type: 'EVENT',
          latitude: 0,
          longitude: 0,
          address: '',
          city: '',
          startDate: '',
          endDate: '',
          website: '',
          contactEmail: '',
          contactPhone: '',
          imageUrl: ''
        })
        setErrors({})
        fetchInitiatives() // Recharger les initiatives
        toast.success('Initiative publiée avec succès ! Elle sera visible après modération.')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la publication de l\'initiative')
      }
    } catch (error) {
      console.error('Erreur lors de la publication de l\'initiative:', error)
      toast.error('Erreur lors de la publication de l\'initiative')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInitiativeClick = (initiative: Initiative) => {
    // Vérifier que l'initiative a des coordonnées valides
    if (!initiative.latitude || !initiative.longitude || 
        isNaN(initiative.latitude) || isNaN(initiative.longitude) ||
        (initiative.latitude === 0 && initiative.longitude === 0)) {
      console.warn('Initiative sans coordonnées valides:', initiative.title)
      return
    }
    
    // Forcer la mise à jour même si c'est le même ID
    setSelectedInitiativeId(undefined)
    setTimeout(() => {
      setSelectedInitiativeId(initiative.id)
    }, 100) // Délai suffisant pour éviter les conflits SWR
  }

  const handleShowDetails = (initiative: Initiative) => {
    setSelectedInitiativeForDetails(initiative)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

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
            <button 
              onClick={handleCreateInitiative}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter initiative
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
                <option value="ACTOR">Acteurs</option>
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
              {isLoading ? (
                <div className="h-[700px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500">Chargement de la carte...</div>
                </div>
              ) : (
                <MapComponent 
                  initiatives={initiativesWithAddress} 
                  selectedInitiativeId={selectedInitiativeId}
                  onInitiativeClick={handleInitiativeClick}
                />
              )}
            </div>
          </div>

          {/* Liste des initiatives avec adresse */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Initiatives localisées ({initiativesWithAddress.length})
              </h3>
              
              <div className="space-y-4 max-h-[657px] overflow-y-auto">
                {initiativesWithAddress.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Aucune initiative localisée trouvée
                  </div>
                ) : (
                  initiativesWithAddress.map((initiative) => (
                    <div
                      key={initiative.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => handleInitiativeClick(initiative)}
                      >
                        <div className="flex-shrink-0">
                          {getTypeIcon(initiative.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {initiative.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {initiative.city}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getTypeLabel(initiative.type)}
                            </span>
                            {initiative.startDate && (
                              <span className="text-xs text-gray-500">
                                📅 {new Date(initiative.startDate).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {initiative.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleInitiativeClick(initiative)}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Voir sur la carte
                        </button>
                        <button
                          onClick={() => handleShowDetails(initiative)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Info className="h-3 w-3" />
                          Détails
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Liste des initiatives sans adresse */}
        {initiativesWithoutAddress.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Initiatives sans localisation ({initiativesWithoutAddress.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedInitiativesWithoutAddress.map((initiative) => (
                  <div
                    key={initiative.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getTypeIcon(initiative.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {initiative.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getTypeLabel(initiative.type)}
                          </span>
                          {initiative.startDate && (
                            <span className="text-xs text-gray-500">
                              📅 {new Date(initiative.startDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                          {initiative.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Boutons d'action */}
                    <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleShowDetails(initiative)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Info className="h-3 w-3" />
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination pour les initiatives sans localisation */}
              {totalPagesWithoutAddress > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPageWithoutAddress}
                    totalPages={totalPagesWithoutAddress}
                    onPageChange={handlePageChangeWithoutAddress}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de création d'initiative */}
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
                <h2 className="text-xl font-bold text-gray-900">Nouvelle Initiative</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitInitiative} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newInitiative.title}
                    onChange={(e) => {
                      setNewInitiative(prev => ({ ...prev, title: e.target.value }))
                      validateField('title', e.target.value)
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Titre de votre initiative..."
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    id="type"
                    value={newInitiative.type}
                    onChange={(e) => setNewInitiative(prev => ({ ...prev, type: e.target.value as 'EVENT' | 'PROJECT' | 'ACTOR' | 'COMPANY' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="EVENT">Événement</option>
                    <option value="PROJECT">Projet</option>
                    <option value="ACTOR">Acteur</option>
                    <option value="COMPANY">Entreprise</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={newInitiative.description}
                    onChange={(e) => {
                      setNewInitiative(prev => ({ ...prev, description: e.target.value }))
                      validateField('description', e.target.value)
                    }}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Description de votre initiative..."
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={newInitiative.address}
                      onChange={(e) => {
                        setNewInitiative(prev => ({ ...prev, address: e.target.value }))
                        validateField('address', e.target.value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Adresse complète..."
                      required
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={newInitiative.city}
                      onChange={(e) => {
                        setNewInitiative(prev => ({ ...prev, city: e.target.value }))
                        validateField('city', e.target.value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ville..."
                      required
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={newInitiative.startDate}
                      onChange={(e) => setNewInitiative(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={newInitiative.endDate}
                      onChange={(e) => setNewInitiative(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={newInitiative.website}
                    onChange={(e) => setNewInitiative(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={newInitiative.contactEmail}
                      onChange={(e) => setNewInitiative(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="contact@exemple.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={newInitiative.contactPhone}
                      onChange={(e) => setNewInitiative(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={newInitiative.imageUrl}
                    onChange={(e) => setNewInitiative(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://..."
                  />
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
                      "Publier l'initiative"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails d'initiative */}
      {selectedInitiativeForDetails && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDetailsModal} // Fermer en cliquant sur le backdrop
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant sur la modale
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Détails de l&apos;initiative</h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* En-tête avec type et titre */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 shadow-sm">
                      {getTypeIcon(selectedInitiativeForDetails.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedInitiativeForDetails.title}
                      </h3>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                        {getTypeLabel(selectedInitiativeForDetails.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {selectedInitiativeForDetails.description}
                    </p>
                  </div>
                </div>

                {/* Localisation - seulement si l'adresse existe */}
                {selectedInitiativeForDetails.address && selectedInitiativeForDetails.address.trim() !== '' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Localisation</h4>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 font-medium mb-1">
                            {selectedInitiativeForDetails.address}
                          </p>
                          {selectedInitiativeForDetails.city && (
                            <p className="text-gray-600 text-sm">
                              {selectedInitiativeForDetails.city}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                {(selectedInitiativeForDetails.startDate || selectedInitiativeForDetails.endDate) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Dates</h4>
                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 space-y-3">
                      {selectedInitiativeForDetails.startDate && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">Début</p>
                            <p className="text-gray-600 text-sm">{formatDate(selectedInitiativeForDetails.startDate)}</p>
                          </div>
                        </div>
                      )}
                      {selectedInitiativeForDetails.endDate && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">Fin</p>
                            <p className="text-gray-600 text-sm">{formatDate(selectedInitiativeForDetails.endDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations de contact */}
                {(selectedInitiativeForDetails.website || selectedInitiativeForDetails.contactEmail || selectedInitiativeForDetails.contactPhone) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact</h4>
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 space-y-4">
                      {selectedInitiativeForDetails.website && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100">
                            <Globe className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 font-medium mb-1">Site web</p>
                            <a 
                              href={selectedInitiativeForDetails.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 underline text-sm"
                            >
                              {selectedInitiativeForDetails.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedInitiativeForDetails.contactEmail && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100">
                            <Mail className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 font-medium mb-1">Email</p>
                            <a 
                              href={`mailto:${selectedInitiativeForDetails.contactEmail}`}
                              className="text-purple-600 hover:text-purple-700 underline text-sm"
                            >
                              {selectedInitiativeForDetails.contactEmail}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedInitiativeForDetails.contactPhone && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100">
                            <Phone className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 font-medium mb-1">Téléphone</p>
                            <a 
                              href={`tel:${selectedInitiativeForDetails.contactPhone}`}
                              className="text-purple-600 hover:text-purple-700 underline text-sm"
                            >
                              {selectedInitiativeForDetails.contactPhone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Auteur */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Publié par</h4>
                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100">
                        <Users className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          {selectedInitiativeForDetails.author.name || selectedInitiativeForDetails.author.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                {selectedInitiativeForDetails.imageUrl && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Image</h4>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
                        <Image 
                          src={selectedInitiativeForDetails.imageUrl} 
                          alt={selectedInitiativeForDetails.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 576px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  {selectedInitiativeForDetails.address && selectedInitiativeForDetails.address.trim() !== '' && 
                   selectedInitiativeForDetails.latitude !== 0 && selectedInitiativeForDetails.longitude !== 0 ? (
                    <button
                      onClick={() => {
                        handleInitiativeClick(selectedInitiativeForDetails)
                        closeDetailsModal()
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Voir sur la carte
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 italic">
                      <MapPin className="h-4 w-4" />
                      Non localisé sur la carte
                    </div>
                  )}
                  <button
                    onClick={closeDetailsModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
