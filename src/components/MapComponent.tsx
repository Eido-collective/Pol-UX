'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Initiative {
  id: string
  title: string
  description: string
  type: 'EVENT' | 'PROJECT' | 'ACTOR' | 'COMPANY'
  latitude: number
  longitude: number
  address: string
  city: string
  startDate?: string
  endDate?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  isPublished: boolean
  author: {
    name: string
    username: string
  }
}

interface MapComponentProps {
  initiatives: Initiative[]
  selectedInitiativeId?: string
  onInitiativeClick?: (initiative: Initiative) => void
}

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapComponent = ({ initiatives, selectedInitiativeId, onInitiativeClick }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{[key: string]: L.Marker}>({})
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialiser la carte centrée sur la France avec un zoom adapté
    const map = L.map(mapRef.current).setView([46.603354, 1.888334], 5)

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Marquer la carte comme chargée après un délai pour s'assurer qu'elle est complètement initialisée
    setTimeout(() => {
      setIsMapLoaded(true)
    }, 100)
    
    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onInitiativeClick])

  // Effet pour créer les marqueurs (séparé de l'ajustement de vue)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    const map = mapInstanceRef.current

    // Utiliser un délai pour éviter les conflits de rendu
    const timeoutId = setTimeout(() => {
      // Vérifier que la carte est dans un état stable
      if (!map.getContainer() || !map.getSize()) {
        return
      }

      // Supprimer les marqueurs existants de manière sécurisée
      try {
        // Nettoyer les marqueurs stockés d'abord
        Object.values(markersRef.current).forEach(marker => {
          try {
            if (marker && map.hasLayer(marker)) {
              map.removeLayer(marker)
            }
          } catch (error) {
            console.warn('Erreur lors de la suppression d\'un marqueur:', error)
          }
        })
        markersRef.current = {}
      } catch (error) {
        console.warn('Erreur lors de la suppression des marqueurs:', error)
      }

      // Créer les icônes personnalisées pour chaque type
      const createCustomIcon = (type: string) => {
        const colors = {
          EVENT: '#3B82F6',
          PROJECT: '#10B981',
          ACTOR: '#8B5CF6',
          COMPANY: '#F59E0B'
        }

        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${colors[type as keyof typeof colors] || '#6B7280'};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">
              ${type.charAt(0)}
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }

      // Ajouter les marqueurs pour chaque initiative
      initiatives.forEach((initiative) => {
        // Vérifier que les coordonnées sont valides
        if (!initiative.latitude || !initiative.longitude || 
            isNaN(initiative.latitude) || isNaN(initiative.longitude) ||
            initiative.latitude === 0 && initiative.longitude === 0) {
          console.log('Initiative ignorée (coordonnées invalides):', initiative.title, initiative.latitude, initiative.longitude)
          return
        }

        try {
          const marker = L.marker([initiative.latitude, initiative.longitude], {
            icon: createCustomIcon(initiative.type)
          }).addTo(map)

          // Stocker le marqueur
          markersRef.current[initiative.id] = marker
          console.log('Marqueur créé pour:', initiative.title, 'ID:', initiative.id, 'Coords:', initiative.latitude, initiative.longitude)

          const getTypeLabel = (type: string) => {
            switch (type) {
              case 'EVENT': return 'Événement'
              case 'PROJECT': return 'Projet'
              case 'ACTOR': return 'Acteur'
              case 'COMPANY': return 'Entreprise'
              default: return type
            }
          }

          const formatDate = (dateString?: string) => {
            if (!dateString) return ''
            return new Date(dateString).toLocaleDateString('fr-FR')
          }

          // Limiter le nombre de caractères pour le titre et la description
          const truncatedTitle = initiative.title.length > 40 ? initiative.title.substring(0, 40) + '...' : initiative.title
          const truncatedDescription = initiative.description.length > 80 ? initiative.description.substring(0, 80) + '...' : initiative.description

          const popupContent = `
            <div style="min-width: 250px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; color: #1F2937; font-weight: bold; font-size: 16px;">${truncatedTitle}</h3>
              <p style="margin: 0 0 12px 0; color: #6B7280; font-size: 14px; line-height: 1.4;">${truncatedDescription}</p>
              <div style="margin: 8px 0;">
                <span style="background-color: #D1FAE5; color: #065F46; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                  ${getTypeLabel(initiative.type)}
                </span>
              </div>
              ${initiative.address ? `
                <p style="margin: 6px 0; color: #374151; font-size: 13px;">
                  <strong>📍</strong> ${initiative.address}${initiative.city ? `, ${initiative.city}` : ''}
                </p>
              ` : ''}
              ${initiative.startDate ? `
                <p style="margin: 6px 0; color: #374151; font-size: 13px;">
                  <strong>📅</strong> ${formatDate(initiative.startDate)}
                </p>
              ` : ''}
              <div style="margin: 12px 0 0 0; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; font-style: italic;">
                  Cliquez sur l'initiative dans la liste pour voir plus de détails
                </p>
              </div>
            </div>
          `

          marker.bindPopup(popupContent)
        } catch (error) {
          console.warn(`Erreur lors de l'ajout du marqueur pour l'initiative ${initiative.id}:`, error)
        }
      })
    }, 100) // Délai de 100ms

    return () => {
      clearTimeout(timeoutId)
    }
  }, [initiatives, isMapLoaded])

  // Effet séparé pour l'ajustement initial de la vue (seulement au chargement)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || selectedInitiativeId) return

    const map = mapInstanceRef.current

    const timeoutId = setTimeout(() => {
      try {
        if (initiatives.length > 0) {
          // Filtrer les initiatives avec des coordonnées valides
          const validInitiatives = initiatives.filter(i => 
            i.latitude && i.longitude && 
            !isNaN(i.latitude) && !isNaN(i.longitude) &&
            !(i.latitude === 0 && i.longitude === 0)
          )

          if (validInitiatives.length > 0) {
            const group = new L.FeatureGroup(validInitiatives.map(i => 
              L.marker([i.latitude, i.longitude])
            ))
            const bounds = group.getBounds()
            
            // Si les initiatives sont dispersées, ajuster la vue pour les voir toutes
            if (bounds.isValid()) {
              console.log('Ajustement initial de la vue pour', validInitiatives.length, 'initiatives')
              map.fitBounds(bounds.pad(0.2))
            } else {
              console.log('Bounds invalides, centrage sur la France')
              map.setView([46.603354, 1.888334], 5)
            }
          } else {
            console.log('Aucune initiative valide, centrage sur la France')
            map.setView([46.603354, 1.888334], 5)
          }
        } else {
          console.log('Aucune initiative, centrage sur la France')
          map.setView([46.603354, 1.888334], 5)
        }
      } catch (error) {
        console.warn('Erreur lors de l\'ajustement de la vue:', error)
        map.setView([46.603354, 1.888334], 5)
      }
    }, 200)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isMapLoaded, initiatives, selectedInitiativeId]) // Ajouter les dépendances manquantes

  // Effet pour centrer sur une initiative sélectionnée
  useEffect(() => {
    console.log('MapComponent: Effet zoom - selectedInitiativeId =', selectedInitiativeId)
    if (!mapInstanceRef.current || !selectedInitiativeId) return

    const map = mapInstanceRef.current
    const selectedInitiative = initiatives.find(i => i.id === selectedInitiativeId)
    const marker = markersRef.current[selectedInitiativeId]

    console.log('MapComponent: Initiative trouvée =', selectedInitiative?.title)
    console.log('MapComponent: Coordonnées =', selectedInitiative?.latitude, selectedInitiative?.longitude)
    console.log('MapComponent: Marker trouvé =', !!marker)

    if (selectedInitiative && marker) {
      // Utiliser un délai pour s'assurer que la carte est stable
      const timeoutId = setTimeout(() => {
        try {
          // Vérifier que la carte est toujours valide
          if (!map.getContainer()) {
            console.log('MapComponent: Carte non valide')
            return
          }

          // Vérifier que les coordonnées sont valides
          if (selectedInitiative.latitude && selectedInitiative.longitude && 
              !isNaN(selectedInitiative.latitude) && !isNaN(selectedInitiative.longitude) &&
              !(selectedInitiative.latitude === 0 && selectedInitiative.longitude === 0)) {
            
            // Centrer la carte sur l'initiative avec un zoom plus proche
            console.log('MapComponent: Zoom sur', selectedInitiative.title, 'aux coordonnées', selectedInitiative.latitude, selectedInitiative.longitude)
            map.setView([selectedInitiative.latitude, selectedInitiative.longitude], 16)
            
            // Ouvrir la popup après un court délai pour s'assurer que la carte est centrée
            setTimeout(() => {
              try {
                if (marker && map.hasLayer(marker)) {
                  console.log('MapComponent: Ouverture de la popup')
                  marker.openPopup()
                } else {
                  console.log('MapComponent: Marqueur non trouvé sur la carte')
                }
              } catch (error) {
                console.warn('Erreur lors de l\'ouverture de la popup:', error)
              }
            }, 500) // Délai plus long pour l'ouverture de la popup
          } else {
            console.log('MapComponent: Coordonnées invalides pour le zoom')
          }
        } catch (error) {
          console.warn('Erreur lors du centrage sur l\'initiative sélectionnée:', error)
        }
      }, 300) // Délai plus long pour le centrage

      return () => {
        clearTimeout(timeoutId)
      }
    } else {
      console.log('MapComponent: Initiative ou marqueur non trouvé')
    }
  }, [selectedInitiativeId, initiatives])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[700px] rounded-lg"
      style={{ zIndex: 1 }}
    />
  )
}

export default MapComponent
