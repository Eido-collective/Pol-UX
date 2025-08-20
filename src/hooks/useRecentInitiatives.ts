'use client'

import useSWR from 'swr'

interface Initiative {
  id: string
  title: string
  description: string
  type: 'EVENT' | 'PROJECT' | 'ACTOR' | 'COMPANY'
  city: string
  createdAt: string
}

export function useRecentInitiatives() {
  const { data, error, isLoading } = useSWR<{ initiatives: Initiative[] }>('/api/initiatives/recent', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0
  })

  return {
    initiatives: data?.initiatives || [],
    isLoading,
    error
  }
}
