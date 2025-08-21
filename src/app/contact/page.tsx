'use client'

import { useState } from 'react'
import { Mail, Globe, Building, User, Clock, Send, Target } from 'lucide-react'
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
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">Contact</h1>
          <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
            Nous sommes là pour vous accompagner dans votre démarche de numérique écoresponsable. 
            N&apos;hésitez pas à nous contacter !
          </p>
        </div>

        {/* Informations de contact */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact principal */}
          <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8">
            <h2 className="text-2xl font-bold text-theme-primary mb-6">Nous contacter</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Email</p>
                  <a 
                    href="mailto:solene@pol-ux.fr" 
                    className="text-theme-primary hover:text-green-600 transition-colors"
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
                  <p className="text-sm text-theme-secondary">Site web</p>
                  <a 
                    href="https://www.pol-ux.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:text-green-600 transition-colors"
                  >
                    www.pol-ux.fr
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Réponse</p>
                  <p className="text-theme-primary font-medium">Sous 24-48h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8">
            <h2 className="text-2xl font-bold text-theme-primary mb-6">Informations</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Entreprise</p>
                  <p className="text-theme-primary font-medium">WGC Concept</p>
                  <p className="text-theme-secondary text-sm">Entreprise Individuelle</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Responsable</p>
                  <p className="text-theme-primary font-medium">Solène Zulfiqar</p>
                  <p className="text-theme-secondary text-sm">Fondatrice de PolUX</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Domaine</p>
                  <p className="text-theme-primary font-medium">Numérique écoresponsable</p>
                  <p className="text-theme-secondary text-sm">Transition écologique</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-theme-card rounded-xl shadow-theme-sm border border-theme-primary p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-theme-primary mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-theme-primary mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-theme-primary mb-2">
                Sujet *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sujet de votre message"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-theme-primary mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-theme-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Votre message..."
              />
            </div>

            <p className="text-sm text-theme-secondary">
              * Champs obligatoires. Nous vous répondrons dans les plus brefs délais.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? 'bg-theme-secondary text-theme-primary cursor-not-allowed'
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
