'use client'

import Link from 'next/link'
import { Leaf, MapPin, MessageSquare, Lightbulb, Mail, Heart, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from '@/hooks/useTheme'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  useTheme()

  const navigation = {
    main: [
      { name: 'Accueil', href: '/', icon: Leaf },
      { name: 'Carte', href: '/map', icon: MapPin },
      { name: 'Forum', href: '/forum', icon: MessageSquare },
      { name: 'Conseils', href: '/tips', icon: Lightbulb },
      { name: 'Articles', href: '/articles', icon: BookOpen },
    ],
    social: [
      {
        name: 'Email',
        href: 'mailto:solene@pol-ux.fr',
        icon: Mail,
      },
    ],
  }

  return (
    <footer className="bg-theme-card border-t border-theme-primary">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo et description */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-2">
              <Image 
                src='/logo-black.svg'
                id='logo-footer'
                alt="Pol-UX" 
                width={110} 
                height={110}
              />
            </div>
            <p className="text-theme-secondary text-base">
              Plateforme collaborative pour promouvoir les initiatives écologiques 
              et connecter les acteurs du développement durable en France.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-theme-tertiary hover:text-green-500 transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-theme-tertiary tracking-wider uppercase">
                  Navigation
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.main.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-2 text-base text-theme-secondary hover:text-green-500 transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-theme-tertiary tracking-wider uppercase">
                  Ressources
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link
                      href="/about"
                      className="text-base text-theme-secondary hover:text-green-500 transition-colors"
                    >
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-base text-theme-secondary hover:text-green-500 transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-base text-theme-secondary hover:text-green-500 transition-colors"
                    >
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-base text-theme-secondary hover:text-green-500 transition-colors"
                    >
                      Conditions d&apos;utilisation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legals"
                      className="text-base text-theme-secondary hover:text-green-500 transition-colors"
                    >
                      Mentions légales
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-theme-primary">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-theme-secondary text-sm">
              © {currentYear} Pol-UX. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-theme-secondary text-sm">Fait avec</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-theme-secondary text-sm">pour la planète</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
