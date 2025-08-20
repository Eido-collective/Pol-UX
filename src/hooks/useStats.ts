'use client'

import useSWR from 'swr'

interface Stats {
  initiatives: number
  articles: number
  tips: number
  forumPosts: number
  users: number
}

export function useStats() {
  const { data, error, isLoading } = useSWR<Stats>('/api/stats', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0
  })

  return {
    stats: data,
    isLoading,
    error
  }
}
