'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    // Scroll vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <nav className="flex items-center gap-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2" aria-label="Pagination">
        {/* Bouton Précédent */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
              : 'text-gray-700 bg-white hover:bg-green-50 hover:text-green-700 hover:shadow-md border border-gray-200 hover:border-green-300'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </button>

        {/* Numéros de pages */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2.5 text-gray-400 font-medium">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200 border border-green-600'
                      : 'text-gray-700 bg-white hover:bg-green-50 hover:text-green-700 hover:shadow-md border border-gray-200 hover:border-green-300'
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
              : 'text-gray-700 bg-white hover:bg-green-50 hover:text-green-700 hover:shadow-md border border-gray-200 hover:border-green-300'
          }`}
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  )
}
