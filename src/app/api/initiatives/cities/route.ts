import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer toutes les villes distinctes des initiatives publiées
    const cities = await prisma.initiative.groupBy({
      by: ['city'],
      where: {
        isPublished: true
      }
    })

    // Normaliser et trier les villes (supprimer les doublons après normalisation)
    const normalizedCities = [...new Set(cities
      .map(item => item.city?.trim())
      .filter(city => city && city.length > 0)
      .map(city => city!.charAt(0).toUpperCase() + city!.slice(1).toLowerCase())
    )].sort()

    return NextResponse.json({
      cities: normalizedCities
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des villes' },
      { status: 500 }
    )
  }
}
