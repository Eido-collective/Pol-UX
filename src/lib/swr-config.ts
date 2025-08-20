import { SWRConfiguration } from 'swr'

// Configuration globale SWR optimisée pour l'environnement
export const swrConfig: SWRConfiguration = {
  // Réduire la fréquence de revalidation pour économiser les ressources
  revalidateOnFocus: false, // Pas de revalidation au focus (évite les requêtes inutiles)
  revalidateOnReconnect: true, // Revalider seulement à la reconnexion
  refreshInterval: 5 * 60 * 1000, // Revalidation automatique toutes les 5 minutes (au lieu de plus fréquent)
  
  // Cache plus agressif pour réduire les requêtes
  dedupingInterval: 10000, // Déduplication pendant 10 secondes (au lieu de 2s par défaut)
  
  // Stratégie de retry optimisée
  errorRetryCount: 2, // Limiter les tentatives de retry
  errorRetryInterval: 5000, // Attendre 5s entre les tentatives
  
  // Timeout pour éviter les requêtes qui traînent
  loadingTimeout: 10000, // 10 secondes max pour charger
  
  // Fonction fetcher par défaut
  fetcher: async (url: string) => {
    const response = await fetch(url)
    
    if (!response.ok) {
      const error = new Error('Erreur lors de la récupération des données')
      error.cause = response.status
      throw error
    }
    
    return response.json()
  }
}

// Types pour une meilleure intégration TypeScript
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SWRError {
  message: string
  status?: number
}
