import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma, RoleRequestStatus } from '@prisma/client'

// POST - Créer une demande de promotion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour faire une demande de promotion' },
        { status: 401 }
      )
    }

    const { requestedRole, reason } = await request.json()

    // Validation du rôle demandé
    if (!['CONTRIBUTOR', 'ADMIN'].includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà une demande en attente
    const existingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId: session.user.id,
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
    const currentRole = session.user.role
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
        userId: session.user.id
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Prisma.RoleRequestWhereInput = {}
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status as RoleRequestStatus
    }

    const roleRequests = await prisma.roleRequest.findMany({
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
      }
    })

    return NextResponse.json({ roleRequests })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de promotion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des demandes' },
      { status: 500 }
    )
  }
}
