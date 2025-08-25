import useSWR from 'swr'

export interface Initiative {
  id: string
  title: string
  description: string
  type: 'EVENT' | 'PROJECT' | 'ACTOR' | 'COMPANY'
  latitude: number
  longitude: number
  address: string
  city: string
  postalCode: string
  startDate?: string
  endDate?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  isPublished: boolean
  author: {
    name: string
    username: string
  }
}

interface UseInitiativesOptions {
  city?: string
  type?: string
}

export function useInitiatives(options: UseInitiativesOptions = {}) {
  const { city, type } = options
  
  const params = new URLSearchParams()
  if (city && city !== 'all') params.append('city', city)
  if (type && type !== 'all') params.append('type', type)
  
  const key = `/api/initiatives${params.toString() ? `?${params.toString()}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR<{ initiatives: Initiative[] }>(
    key,
    {
      // Configuration moins agressive pour éviter les conflits avec le zoom
      dedupingInterval: 5000, // 5 secondes
      revalidateOnMount: true,
      revalidateOnFocus: false, // Désactivé pour éviter les conflits
      revalidateOnReconnect: false, // Désactivé pour éviter les conflits
      refreshInterval: 0, // Pas de refresh automatique
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  )
  
  return {
    initiatives: data?.initiatives || [],
    isLoading,
    error,
    mutate
  }
}

// Hook pour récupérer toutes les villes disponibles (sans filtres)
export function useCities() {
  const { data, error, isLoading } = useSWR<{ cities: string[] }>(
    '/api/initiatives/cities',
    {
      dedupingInterval: 60000, // 1 minute
      revalidateOnMount: true,
      refreshInterval: 30 * 60 * 1000, // 30 minutes
    }
  )
  
  return {
    cities: data?.cities || [],
    isLoading,
    error
  }
}
