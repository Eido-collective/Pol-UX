'use client'

interface FilterOption {
  value: string
  label: string
  count: number
}

interface ContentFiltersProps {
  options: FilterOption[]
  currentFilter: string
  onFilterChange: (filter: string) => void
  className?: string
}

export default function ContentFilters({ 
  options, 
  currentFilter, 
  onFilterChange, 
  className = '' 
}: ContentFiltersProps) {
  return (
    <div className={`flex gap-2 mb-4 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentFilter === option.value
              ? 'bg-green-600 text-white'
              : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-primary'
          }`}
        >
          {option.label} ({option.count})
        </button>
      ))}
    </div>
  )
}
