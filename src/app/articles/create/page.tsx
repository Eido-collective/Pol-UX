'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateArticlePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [article, setArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'ENVIRONMENT',
    imageUrl: ''
  })

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!article.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    } else if (article.title.trim().length < 10) {
      newErrors.title = 'Le titre doit contenir au moins 10 caractères'
    }
    
    if (!article.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire'
    } else if (article.content.trim().length < 100) {
      newErrors.content = 'Le contenu doit contenir au moins 100 caractères'
    }

    if (article.excerpt && article.excerpt.trim().length < 20) {
              newErrors.excerpt = 'L&apos;extrait doit contenir au moins 20 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'title') {
      if (!value.trim()) {
        newErrors.title = 'Le titre est obligatoire'
      } else if (value.trim().length < 10) {
        newErrors.title = 'Le titre doit contenir au moins 10 caractères'
      } else {
        delete newErrors.title
      }
    }
    
    if (field === 'content') {
      if (!value.trim()) {
        newErrors.content = 'Le contenu est obligatoire'
      } else if (value.trim().length < 100) {
        newErrors.content = 'Le contenu doit contenir au moins 100 caractères'
      } else {
        delete newErrors.content
      }
    }

    if (field === 'excerpt') {
      if (value.trim() && value.trim().length < 20) {
        newErrors.excerpt = 'L&apos;extrait doit contenir au moins 20 caractères'
      } else {
        delete newErrors.excerpt
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      })

      if (response.ok) {
        await response.json()
        toast.success('Article créé avec succès ! Il sera visible après modération.')
        router.push('/articles')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la création de l&apos;article')
      }
    } catch (error) {
      console.error('Erreur lors de la création de l&apos;article:', error)
      toast.error('Erreur lors de la création de l&apos;article')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>
            <p className="text-gray-500">Vous devez être connecté pour créer un article.</p>
          </div>
        </div>
      </div>
    )
  }

  if (session.user.role === 'EXPLORER') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>
            <p className="text-gray-500">Vous devez être Contributeur ou Administrateur pour créer des articles.</p>
            <Link 
              href="/promotion"
              className="inline-flex items-center mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Demander une promotion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux articles</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel article</h1>
          <p className="text-gray-600 mt-2">Partagez vos connaissances sur l&apos;écologie et le développement durable</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                value={article.title}
                onChange={(e) => {
                  setArticle(prev => ({ ...prev, title: e.target.value }))
                  validateField('title', e.target.value)
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Titre de votre article..."
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                value={article.category}
                onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="ENVIRONMENT">Environnement</option>
                <option value="SUSTAINABILITY">Développement durable</option>
                <option value="CLIMATE_CHANGE">Changement climatique</option>
                <option value="BIODIVERSITY">Biodiversité</option>
                <option value="RENEWABLE_ENERGY">Énergies renouvelables</option>
                <option value="CIRCULAR_ECONOMY">Économie circulaire</option>
                <option value="GREEN_TECHNOLOGY">Technologies vertes</option>
                <option value="CONSERVATION">Conservation</option>
                <option value="EDUCATION">Éducation</option>
                <option value="POLICY">Politique</option>
              </select>
            </div>

            {/* Extrait */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Extrait (optionnel)
              </label>
              <textarea
                id="excerpt"
                value={article.excerpt}
                onChange={(e) => {
                  setArticle(prev => ({ ...prev, excerpt: e.target.value }))
                  validateField('excerpt', e.target.value)
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                  errors.excerpt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Un bref résumé de votre article..."
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Un court résumé qui apparaîtra dans la liste des articles
              </p>
            </div>

            {/* Contenu */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu *
              </label>
              <textarea
                id="content"
                value={article.content}
                onChange={(e) => {
                  setArticle(prev => ({ ...prev, content: e.target.value }))
                  validateField('content', e.target.value)
                }}
                rows={15}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contenu de votre article..."
                required
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 100 caractères. Utilisez des paragraphes pour une meilleure lisibilité.
              </p>
            </div>

            {/* URL de l'image */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL de l&apos;image (optionnel)
              </label>
              <input
                type="url"
                id="imageUrl"
                value={article.imageUrl}
                onChange={(e) => setArticle(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://..."
              />
              <p className="mt-1 text-sm text-gray-500">
                L&apos;image sera affichée en en-tête de votre article
              </p>
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/articles"
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Créer l&apos;article
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
