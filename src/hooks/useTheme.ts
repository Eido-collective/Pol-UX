'use client'

import { useState, useEffect } from 'react'

type Theme = 'black' | 'white'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('black')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('black') // Default to black
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    
    // Apply theme classes
    if (theme === 'black') {
      document.documentElement.classList.add('theme-black')
      document.documentElement.classList.remove('theme-white')
      document.getElementById('logo-navbar')?.classList.add('invert')
      document.getElementById('logo-footer')?.classList.add('invert')
    } else {
      document.documentElement.classList.add('theme-white')
      document.documentElement.classList.remove('theme-black')
      document.getElementById('logo-navbar')?.classList.remove('invert')
      document.getElementById('logo-footer')?.classList.remove('invert')
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'black' ? 'white' : 'black')
  }

  return {
    theme,
    toggleTheme,
    mounted
  }
}
