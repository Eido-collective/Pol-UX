'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      style={{
        backgroundColor: theme === 'black' ? '#000000' : '#ffffff',
        border: theme === 'black' ? '2px solid #333333' : '2px solid #e5e5e5'
      }}
      aria-label={`Basculer vers le mode ${theme === 'black' ? 'clair' : 'sombre'}`}
    >
      <span
        className="inline-block h-6 w-6 transform rounded-full transition-transform duration-300"
        style={{
          backgroundColor: theme === 'black' ? '#ffffff' : '#000000',
          transform: theme === 'black' ? 'translateX(2px)' : 'translateX(26px)'
        }}
      >
        {theme === 'black' ? (
          <Sun className="h-4 w-4 text-black mx-auto mt-0.5" />
        ) : (
          <Moon className="h-4 w-4 text-white mx-auto mt-0.5" />
        )}
      </span>
    </button>
  )
}
