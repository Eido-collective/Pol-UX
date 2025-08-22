import useSWR from 'swr'
import { PaginatedResponse } from '@/lib/swr-config'

export interface Tip {
  id: string
  title: string
  content: string
  category: string
  imageUrl?: string
  source?: string
  publishedAt?: string
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

interface UseTipsOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
  sortBy?: string
}

export function useTips(options: UseTipsOptions = {}) {
  const { page = 1, limit = 6, search, category, sortBy = 'mostVoted' } = options
  
  // Construire la clé de cache avec tous les paramètres
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy: sortBy
  })
  
  if (search) params.append('search', search)
  if (category && category !== 'all') params.append('category', category)
  
  const key = `/api/tips?${params.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Tip>>(
    key,
    {
      // Cache optimisé pour les conseils
      dedupingInterval: 20000, // 20 secondes
      revalidateOnMount: true,
      refreshInterval: 8 * 60 * 1000, // 8 minutes
    }
  )
  
  return {
    tips: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate
  }
}

// Hook pour un conseil spécifique
export function useTip(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ tip: Tip }>(
    id ? `/api/tips/${id}` : null,
    {
      dedupingInterval: 60000, // 1 minute
      refreshInterval: 12 * 60 * 1000, // 12 minutes
    }
  )
  
  return {
    tip: data?.tip,
    isLoading,
    error,
    mutate
  }
}
