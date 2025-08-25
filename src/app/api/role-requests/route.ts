import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'
import { Prisma, RoleRequestStatus } from '@prisma/client'

// POST - Créer une demande de promotion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour faire une demande de promotion' },
        { status: 401 }
      )
    }

    const { requestedRole, reason } = await request.json()

    // Validation des champs obligatoires
    if (!requestedRole || !reason) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation du rôle demandé
    if (!['CONTRIBUTOR', 'ADMIN'].includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Validation de la raison
    if (reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'La raison doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà une demande en attente
    const existingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId: session.id,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Vous avez déjà une demande de promotion en attente' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur ne demande pas un rôle inférieur ou égal
    const currentRole = session.role
    if (currentRole === 'ADMIN' || 
        (currentRole === 'CONTRIBUTOR' && requestedRole === 'CONTRIBUTOR')) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas demander ce rôle' },
        { status: 400 }
      )
    }

    // Créer la demande
    const roleRequest = await prisma.roleRequest.create({
      data: {
        requestedRole,
        reason: reason.trim(),
        userId: session.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Demande de promotion créée avec succès',
      roleRequest
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la demande de promotion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la demande' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les demandes (admin seulement)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RoleRequestStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Construire les filtres
    const where: Prisma.RoleRequestWhereInput = {}
    if (status) {
      where.status = status
    }

    const [roleRequests, total] = await Promise.all([
      prisma.roleRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true
            }
          },
          admin: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.roleRequest.count({ where })
    ])

    return NextResponse.json({
      data: roleRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des demandes' },
      { status: 500 }
    )
  }
}
