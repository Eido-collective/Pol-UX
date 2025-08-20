import useSWR from 'swr'
import { PaginatedResponse } from '@/lib/swr-config'

export interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  publishedAt?: string
  createdAt: string
  author: {
    name: string
    username: string
  }
  votes: Vote[]
  _count: {
    votes: number
    comments: number
  }
}

interface Vote {
  id: string
  value: number
  userId: string
}

interface UseForumPostsOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
}

export function useForumPosts(options: UseForumPostsOptions = {}) {
  const { page = 1, limit = 10, search, category } = options
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })
  
  if (search) params.append('search', search)
  if (category && category !== 'all') params.append('category', category)
  
  const key = `/api/forum/posts?${params.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<ForumPost>>(
    key,
    {
      // Le forum change plus souvent, cache moins agressif
      dedupingInterval: 15000, // 15 secondes
      revalidateOnMount: true,
      refreshInterval: 3 * 60 * 1000, // 3 minutes
    }
  )
  
  return {
    posts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate
  }
}

// Hook pour un post spécifique
export function useForumPost(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ post: ForumPost }>(
    id ? `/api/forum/posts/${id}` : null,
    {
      dedupingInterval: 30000, // 30 secondes
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  )
  
  return {
    post: data?.post,
    isLoading,
    error,
    mutate
  }
}
