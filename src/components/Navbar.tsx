'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import LogoutConfirmation from './LogoutConfirmation'
import { User, LogOut, Settings, MapPin, MessageSquare, Lightbulb, FileText, ChevronDown, Shield } from 'lucide-react'
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

  // Fermer le menu quand on clique ailleurs
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (!target.closest('.user-menu-container')) {
      setIsMenuOpen(false)
    }
  }

  // Ajouter/retirer l'écouteur d'événement
  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <nav className="bg-theme-card border-b border-theme-primary shadow-theme-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Layout mobile en colonne */}
        <div className="md:hidden flex flex-col">
          {/* Première ligne - Logo à gauche, Dark mode et User à droite */}
          <div className="flex justify-between items-center py-3">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src='/logo-black.svg'
                  id='logo-navbar'
                  alt="Pol-UX" 
                  width={110} 
                  height={110}
                />
              </Link>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {user ? (
                <button
                  onClick={toggleMenu}
                  className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <User className="h-4 w-4 text-white" />
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="text-theme-secondary hover:text-theme-primary transition-colors text-sm"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
          
          {/* Deuxième ligne - Navigation horizontale */}
          <div className="flex justify-between items-center pb-3 space-x-2">
            <Link 
              href="/map" 
              className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors text-sm"
            >
              <MapPin className="h-4 w-4" />
              <span>Carte</span>
            </Link>
            <Link 
              href="/forum" 
              className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Forum</span>
            </Link>
            <Link 
              href="/tips" 
              className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors text-sm"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Conseils</span>
            </Link>
            <Link 
              href="/articles" 
              className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors text-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Articles</span>
            </Link>
          </div>
        </div>

        {/* Menu déroulant mobile pour utilisateur connecté */}
        {isMenuOpen && user && (
          <div className="md:hidden bg-theme-card border-t border-theme-primary">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <div className="px-4 py-2 border-b border-theme-primary mb-2">
                <p className="text-sm font-medium text-theme-primary">{user.name || user.username}</p>
                <p className="text-xs text-theme-secondary">{user.email}</p>
                <p className="text-xs text-green-600 capitalize">{user.role.toLowerCase()}</p>
              </div>
              
                             {(user.role === 'ADMIN' || user.role === 'CONTRIBUTOR') && (
                 <Link 
                   href="/dashboard" 
                   className="flex items-center space-x-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary transition-colors rounded-lg"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   <Settings className="h-5 w-5" />
                   <span className="text-base font-medium">Tableau de bord</span>
                 </Link>
               )}
               
               {user.role === 'ADMIN' && (
                 <Link 
                   href="/admin" 
                   className="flex items-center space-x-3 px-4 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary transition-colors rounded-lg"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   <Shield className="h-5 w-5" />
                   <span className="text-base font-medium">Administration</span>
                 </Link>
               )}
              
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors rounded-lg"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-base font-medium">Se déconnecter</span>
              </button>
            </div>
          </div>
        )}

        {/* Layout desktop */}
        <div className="hidden md:flex justify-between h-16">
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
                       className="w-28 h-auto"
                     />
               </div>
             </Link>

            {/* Navigation desktop */}
            <div className="ml-10 flex space-x-8">
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
               <div className="relative user-menu-container">
                 <button
                   onClick={toggleMenu}
                   className="flex items-center space-x-2 text-theme-secondary hover:text-theme-primary transition-colors"
                 >
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                     <User className="h-4 w-4 text-green-600" />
                   </div>
                   <span>{user.name || user.username}</span>
                   <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                 </button>

                                 {/* Menu déroulant */}
                 {isMenuOpen && (
                   <div className="absolute right-0 mt-2 min-w-48 w-auto bg-theme-card rounded-lg shadow-theme-lg border border-theme-primary py-2 z-50">
                    <div className="px-4 py-2 border-b border-theme-primary">
                      <p className="text-sm font-medium text-theme-primary">{user.name || user.username}</p>
                      <p className="text-xs text-theme-secondary">{user.email}</p>
                      <p className="text-xs text-green-600 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    
                                         {(user.role === 'ADMIN' || user.role === 'CONTRIBUTOR') && (
                       <Link 
                         href="/dashboard" 
                         className="flex items-center space-x-2 px-4 py-2 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors"
                         onClick={() => setIsMenuOpen(false)}
                       >
                         <Settings className="h-4 w-4" />
                         <span>Tableau de bord</span>
                       </Link>
                     )}
                     
                     {user.role === 'ADMIN' && (
                       <Link 
                         href="/admin" 
                         className="flex items-center space-x-2 px-4 py-2 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors"
                         onClick={() => setIsMenuOpen(false)}
                       >
                         <Shield className="h-4 w-4" />
                         <span>Administration</span>
                       </Link>
                     )}
                    
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se déconnecter</span>
                    </button>
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
      </div>
      
      {/* Modal de confirmation de déconnexion */}
      <LogoutConfirmation 
        isOpen={showLogoutConfirmation} 
        onClose={() => setShowLogoutConfirmation(false)} 
      />
    </nav>
  )
}

