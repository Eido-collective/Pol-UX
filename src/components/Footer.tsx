import Link from 'next/link'
import { Leaf, MapPin, MessageSquare, Lightbulb, Github, Twitter, Mail, Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const navigation = {
    main: [
      { name: 'Accueil', href: '/', icon: Leaf },
      { name: 'Carte', href: '/map', icon: MapPin },
      { name: 'Forum', href: '/forum', icon: MessageSquare },
      { name: 'Conseils', href: '/tips', icon: Lightbulb },
    ],
    social: [
      {
        name: 'GitHub',
        href: '#',
        icon: Github,
      },
      {
        name: 'Twitter',
        href: '#',
        icon: Twitter,
      },
      {
        name: 'Email',
        href: 'mailto:contact@polux.fr',
        icon: Mail,
      },
    ],
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo et description */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Pol-UX</span>
            </div>
            <p className="text-gray-500 text-base">
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
                    className="text-gray-400 hover:text-green-600 transition-colors"
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
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Navigation
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.main.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-2 text-base text-gray-500 hover:text-green-600 transition-colors"
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
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Ressources
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link
                      href="/about"
                      className="text-base text-gray-500 hover:text-green-600 transition-colors"
                    >
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-base text-gray-500 hover:text-green-600 transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-base text-gray-500 hover:text-green-600 transition-colors"
                    >
                      Confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-base text-gray-500 hover:text-green-600 transition-colors"
                    >
                      Conditions d&apos;utilisation
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-400">
              © {currentYear} Pol-UX. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-1 text-gray-400">
              <span className="text-sm">Fait avec</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">pour la planète</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
