'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import LogoutConfirmation from './LogoutConfirmation'
import { Menu, X, User, LogOut, Settings, MapPin, MessageSquare, Lightbulb, FileText } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import Image from 'next/image'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const { user } = useAuth()
  useTheme()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true)
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-theme-card border-b border-theme-primary shadow-theme-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                  <Image 
                    src='/logo-black.svg'
                    id='logo-navbar'
                    alt="Pol-UX" 
                    width={110} 
                    height={110}
                  />
              </div>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                href="/map" 
                className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>Carte</span>
              </Link>
              <Link 
                href="/forum" 
                className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Forum</span>
              </Link>
              <Link 
                href="/tips" 
                className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Conseils</span>
              </Link>
              <Link 
                href="/articles" 
                className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Articles</span>
              </Link>
            </div>
          </div>

          {/* Actions côté droit */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              /* Utilisateur connecté */
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="hidden sm:block">{user.name || user.username}</span>
                  {isMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>

                {/* Menu déroulant */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-lg shadow-theme-lg border border-theme-primary py-2 z-50">
                    <div className="px-4 py-2 border-b border-theme-primary">
                      <p className="text-sm font-medium text-theme-primary">{user.name || user.username}</p>
                      <p className="text-xs text-theme-secondary">{user.email}</p>
                      <p className="text-xs text-green-600 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                    
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se déconnecter</span>
                    </button>
                    
                    <Link 
                      href="/logout" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Page de déconnexion</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Utilisateur non connecté */
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-theme-primary">
              <Link 
                href="/map" 
                className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="h-4 w-4" />
                <span>Carte</span>
              </Link>
              <Link 
                href="/forum" 
                className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Forum</span>
              </Link>
              <Link 
                href="/tips" 
                className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Lightbulb className="h-4 w-4" />
                <span>Conseils</span>
              </Link>
              <Link 
                href="/articles" 
                className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                <span>Articles</span>
              </Link>
              
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Tableau de bord</span>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Se déconnecter</span>
                  </button>
                  
                  <Link
                    href="/logout"
                    className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Page de déconnexion</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmation de déconnexion */}
      <LogoutConfirmation 
        isOpen={showLogoutConfirmation} 
        onClose={() => setShowLogoutConfirmation(false)} 
      />
    </nav>
  )
}

