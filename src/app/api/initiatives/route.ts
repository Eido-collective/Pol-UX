import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

import { Prisma, InitiativeType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: Prisma.InitiativeWhereInput = {
      isPublished: true
    }

    if (type && type !== 'all') {
      where.type = type as InitiativeType
    }

    if (city && city !== 'all') {
      where.city = {
        equals: city,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    const initiatives = await prisma.initiative.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      initiatives,
      count: initiatives.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des initiatives:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des initiatives' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer une initiative' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a le rôle CONTRIBUTOR ou ADMIN
    if (session.role === 'EXPLORER') {
      return NextResponse.json(
        { error: 'Vous devez être Contributeur ou Administrateur pour créer des initiatives. Demandez une promotion de rôle.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      latitude,
      longitude,
      address,
      city,
      postalCode,
      startDate,
      endDate,
      website,
      contactEmail,
      contactPhone,
      imageUrl
    } = body

    // Validation des données
    if (!title || !description || !type || !latitude || !longitude || !address || !city) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    const initiative = await prisma.initiative.create({
      data: {
        title,
        description,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        city,
        postalCode,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        website,
        contactEmail,
        contactPhone,
        imageUrl,
        authorId: session.id
        // isPublished est par défaut à true dans le schéma
      },
      include: {
        author: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Initiative créée avec succès',
      initiative
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de l\'initiative:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'initiative' },
      { status: 500 }
    )
  }
}
