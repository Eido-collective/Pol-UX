'use client'

import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-theme-card shadow-theme-sm border border-theme-primary"
      style={{
        backgroundColor: theme === 'black' ? '#1a1a1a' : '#f8f9fa'
      }}
      aria-label={`Basculer vers le mode ${theme === 'black' ? 'clair' : 'sombre'}`}
    >
      {/* Track background with gradient */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-500 ease-in-out"
        style={{
          background: theme === 'black' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      />
      
      {/* Toggle handle */}
      <span
        className="relative inline-flex h-7 w-7 transform items-center justify-center rounded-full transition-all duration-500 ease-in-out shadow-lg"
        style={{
          backgroundColor: theme === 'black' ? '#ffffff' : '#000000',
          transform: theme === 'black' ? 'translateX(2px)' : 'translateX(27px)',
          boxShadow: theme === 'black' 
            ? '0 2px 8px rgba(255, 255, 255, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)' 
            : '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Emoji with smooth transition */}
        <div className="transition-all duration-300 ease-in-out text-lg">
          {theme === 'black' ? (
            <span className="transition-all duration-300 ease-in-out">🌙</span>
          ) : (
            <span className="transition-all duration-300 ease-in-out">☀️</span>
          )}
        </div>
      </span>
      
      {/* Decorative dots */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <div 
          className={`w-1 h-1 rounded-full transition-all duration-300 ${
            theme === 'black' ? 'bg-white/30' : 'bg-black/20'
          }`}
        />
        <div 
          className={`w-1 h-1 rounded-full transition-all duration-300 ${
            theme === 'black' ? 'bg-white/30' : 'bg-black/20'
          }`}
        />
      </div>
    </button>
  )
}
