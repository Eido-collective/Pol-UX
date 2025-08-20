'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Initiative {
  id: string
  title: string
  description: string
  type: 'EVENT' | 'PROJECT' | 'ASSOCIATION' | 'COMPANY'
  latitude: number
  longitude: number
  address: string
  city: string
  startDate?: string
  endDate?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  author: {
    name: string
    username: string
  }
}

interface MapComponentProps {
  initiatives: Initiative[]
}

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapComponent = ({ initiatives }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialiser la carte centrée sur la France
    const map = L.map(mapRef.current).setView([46.603354, 1.888334], 6)

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Supprimer les marqueurs existants
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Créer les icônes personnalisées pour chaque type
    const createCustomIcon = (type: string) => {
      const colors = {
        EVENT: '#3B82F6',
        PROJECT: '#10B981',
        ASSOCIATION: '#8B5CF6',
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
      const marker = L.marker([initiative.latitude, initiative.longitude], {
        icon: createCustomIcon(initiative.type)
      }).addTo(map)

      const getTypeLabel = (type: string) => {
        switch (type) {
          case 'EVENT': return 'Événement'
          case 'PROJECT': return 'Projet'
          case 'ASSOCIATION': return 'Association'
          case 'COMPANY': return 'Entreprise'
          default: return type
        }
      }

      const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('fr-FR')
      }

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1F2937; font-weight: bold;">${initiative.title}</h3>
          <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">${initiative.description}</p>
          <div style="margin: 8px 0;">
            <span style="background-color: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
              ${getTypeLabel(initiative.type)}
            </span>
          </div>
          <p style="margin: 4px 0; color: #374151; font-size: 14px;">
            <strong>📍</strong> ${initiative.address}, ${initiative.city}
          </p>
          ${initiative.startDate ? `
            <p style="margin: 4px 0; color: #374151; font-size: 14px;">
              <strong>📅</strong> ${formatDate(initiative.startDate)}
            </p>
          ` : ''}
          ${initiative.contactEmail ? `
            <p style="margin: 4px 0; color: #374151; font-size: 14px;">
              <strong>📧</strong> ${initiative.contactEmail}
            </p>
          ` : ''}
          ${initiative.website ? `
            <p style="margin: 4px 0; color: #374151; font-size: 14px;">
              <strong>🌐</strong> <a href="${initiative.website}" target="_blank" style="color: #059669;">${initiative.website}</a>
            </p>
          ` : ''}
          <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 12px;">
            Par ${initiative.author.name}
          </p>
        </div>
      `

      marker.bindPopup(popupContent)
    })

    // Ajuster la vue si des initiatives sont présentes
    if (initiatives.length > 0) {
      const group = new L.FeatureGroup(initiatives.map(i => 
        L.marker([i.latitude, i.longitude])
      ))
      map.fitBounds(group.getBounds().pad(0.1))
    }

  }, [initiatives])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg"
      style={{ zIndex: 1 }}
    />
  )
}

export default MapComponent
