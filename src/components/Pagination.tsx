'use client'


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


  return (
    <div className={`flex items-center justify-center ${className}`}>
      <nav className="flex items-center gap-2 bg-theme-card rounded-xl shadow-theme-lg border border-theme-primary p-2" aria-label="Pagination">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'text-theme-secondary bg-theme-tertiary cursor-not-allowed'
              : 'text-theme-secondary bg-theme-card hover:bg-green-50 hover:text-green-700 hover:shadow-theme-md border border-theme-primary hover:border-green-300'
          }`}
        >
          Précédent
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page) => {
            if (page === '...') {
              return (
                <span key={page} className="px-3 py-2.5 text-theme-secondary font-medium">...</span>
              )
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'text-white bg-green-600 shadow-theme-md'
                    : 'text-theme-secondary bg-theme-card hover:bg-green-50 hover:text-green-700 hover:shadow-theme-md border border-theme-primary hover:border-green-300'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-theme-secondary bg-theme-tertiary cursor-not-allowed'
              : 'text-theme-secondary bg-theme-card hover:bg-green-50 hover:text-green-700 hover:shadow-theme-md border border-theme-primary hover:border-green-300'
          }`}
        >
          Suivant
        </button>
      </nav>
    </div>
  )
}
