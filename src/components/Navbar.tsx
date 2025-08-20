'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Leaf, Menu, X, MapPin, MessageSquare, Lightbulb, Shield, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const navigation = [
    { name: 'Accueil', href: '/', icon: Leaf },
    { name: 'Carte', href: '/map', icon: MapPin },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Conseils', href: '/tips', icon: Lightbulb },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Pol-UX</span>
            </Link>
            
            {/* Navigation desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
            {session ? (
              <div className="flex items-center space-x-4">
                {/* Admin link */}
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                
                {/* User menu */}
                <div className="relative">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {session.user.name || session.user.username}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {session.user.role === 'ADMIN' ? 'Admin' : 
                       session.user.role === 'CONTRIBUTOR' ? 'Contributeur' : 'Explorateur'}
                    </span>
                  </div>
                </div>
                
                {/* Logout button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Menu mobile button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 p-2 rounded-md"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {session?.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  <span>Administration</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
