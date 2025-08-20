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
  imageUrl?: string
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
      // Les initiatives changent moins souvent, cache plus long
      dedupingInterval: 45000, // 45 secondes
      revalidateOnMount: true,
      refreshInterval: 15 * 60 * 1000, // 15 minutes
    }
  )
  
  return {
    initiatives: data?.initiatives || [],
    isLoading,
    error,
    mutate
  }
}
