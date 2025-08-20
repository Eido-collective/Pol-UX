'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Leaf, Menu, X, MapPin, MessageSquare, Lightbulb, BookOpen, Shield, User, LogOut } from 'lucide-react'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  useTheme()

  const navigation = [
    { name: 'Accueil', href: '/', icon: Leaf },
    { name: 'Carte', href: '/map', icon: MapPin },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Conseils', href: '/tips', icon: Lightbulb },
    { name: 'Articles', href: '/articles', icon: BookOpen },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-theme-card shadow-theme-md border-b border-theme-primary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src='/logo-black.svg'
                id='logo-navbar'
                alt="Pol-UX" 
                width={110} 
                height={110}
              />
            </Link>
            
            {/* Navigation desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-theme-secondary hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {session ? (
              <div className="flex items-center space-x-4">
                {/* Admin link */}
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-theme-secondary hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                
                {/* User menu */}
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-theme-secondary hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {session.user.name || session.user.username}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                    {session.user.role === 'ADMIN' ? 'Admin' : 
                     session.user.role === 'CONTRIBUTOR' ? 'Contributeur' : 'Explorateur'}
                  </span>
                </Link>
                
                {/* Logout button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-theme-secondary hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-theme-secondary hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Menu mobile button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-theme-secondary hover:text-green-500 p-2 rounded-md"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-theme-primary bg-theme-card">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-theme-secondary hover:text-green-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-theme-secondary hover:text-green-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Tableau de bord</span>
                  </Link>
                  
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 text-theme-secondary hover:text-green-500 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-5 w-5" />
                      <span>Administration</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 text-theme-secondary hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Déconnexion</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
