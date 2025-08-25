import useSWR from 'swr'
import { useMemo } from 'react'
import { PaginatedResponse } from '@/lib/swr-config'

export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  category: string
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

interface UseArticlesOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
  sortBy?: 'newest' | 'oldest' | 'mostVoted'
}

export function useArticles(options: UseArticlesOptions = {}) {
  const { page = 1, limit = 10, search, category, sortBy = 'newest' } = options
  
  // Construire la clé de cache avec tous les paramètres
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy: sortBy
  })
  
  if (search) params.append('search', search)
  if (category && category !== 'all') params.append('category', category)
  
  const key = `/api/articles?${params.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Article>>(
    key,
    {
      // Cache plus long pour les articles (ils changent moins souvent)
      dedupingInterval: 30000, // 30 secondes de déduplication
      revalidateOnMount: true,
      // Revalidation moins fréquente pour les articles
      refreshInterval: 10 * 60 * 1000, // 10 minutes
    }
  )
  
  // Memoize articles to prevent infinite re-renders
  const articles = useMemo(() => data?.data || [], [data?.data])
  
  return {
    articles,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate // Pour invalider le cache manuellement
  }
}

// Hook pour un article spécifique
export function useArticle(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ article: Article }>(
    id ? `/api/articles/${id}` : null,
    {
      // Cache très long pour un article individuel
      dedupingInterval: 60000, // 1 minute de déduplication
      refreshInterval: 15 * 60 * 1000, // 15 minutes
    }
  )
  
  return {
    article: data?.article,
    isLoading,
    error,
    mutate
  }
}
