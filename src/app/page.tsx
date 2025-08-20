import Link from 'next/link'
import { Leaf, MapPin, MessageSquare, Lightbulb, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100">

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Découvrez et participez aux
            <span className="text-green-600"> initiatives écologiques</span>
            <br />
            partout en France
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Rejoignez la communauté Pol-UX pour explorer, partager et contribuer 
            aux projets environnementaux qui façonnent l'avenir de notre planète.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold">
              Explorer la carte
            </Link>
            <Link href="/register" className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors text-lg font-semibold">
              Rejoindre la communauté
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Carte Interactive</h3>
            <p className="text-gray-600">
              Découvrez les initiatives écologiques près de chez vous avec notre carte interactive
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Forum Collaboratif</h3>
            <p className="text-gray-600">
              Échangez avec la communauté, partagez vos idées et posez vos questions
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <Lightbulb className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Conseils Écologiques</h3>
            <p className="text-gray-600">
              Découvrez des conseils pratiques pour réduire votre impact environnemental
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Communauté Active</h3>
            <p className="text-gray-600">
              Rejoignez une communauté engagée pour un avenir plus durable
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-xl shadow-sm border border-green-100 p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Notre impact en chiffres
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Initiatives recensées</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10k+</div>
              <div className="text-gray-600">Membres actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction utilisateurs</div>
            </div>
          </div>
        </div>
      </main>


    </div>
  )
}
