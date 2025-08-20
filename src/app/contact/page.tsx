'use client'

import { useState } from 'react'
import { Mail, Globe, Building, User, MapPin, Clock, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return

    // Validation côté client
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez saisir une adresse email valide')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Message envoyé avec succès ! Vous recevrez une confirmation par email.')
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous sommes là pour vous accompagner dans votre démarche de numérique écoresponsable. 
            N&apos;hésitez pas à nous contacter !
          </p>
        </div>

        {/* Informations de contact */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact principal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nous contacter</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href="mailto:solene@pol-ux.fr" 
                    className="text-green-600 hover:text-green-700 font-medium text-lg"
                  >
                    solene@pol-ux.fr
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Site web</p>
                  <a 
                    href="https://www.pol-ux.fr" 
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.pol-ux.fr
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Réponse</p>
                  <p className="text-gray-900 font-medium">Sous 24-48h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entreprise</p>
                  <p className="text-gray-900 font-medium">WGC Concept</p>
                  <p className="text-gray-600 text-sm">Entreprise Individuelle</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Responsable</p>
                  <p className="text-gray-900 font-medium">Solène Zulfiqar</p>
                  <p className="text-gray-600 text-sm">Fondatrice de PolUX</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Domaine</p>
                  <p className="text-gray-900 font-medium">Numérique écoresponsable</p>
                  <p className="text-gray-600 text-sm">Transition écologique</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre nom"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Sujet *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sujet de votre message"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Votre message..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                * Champs obligatoires
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Note importante */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Information importante</h3>
              <p className="text-blue-800">
                Pour toute question concernant le numérique écoresponsable, l&apos;ajout d&apos;initiatives sur la carte, 
                ou la collaboration, n&apos;hésitez pas à nous contacter. Nous répondons généralement sous 24-48h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
