import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'
import { RoleRequestStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    // Validation du statut
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la demande existe
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
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

    if (!roleRequest) {
      return NextResponse.json(
        { error: 'Demande de promotion non trouvée' },
        { status: 404 }
      )
    }

    if (roleRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette demande a déjà été traitée' },
        { status: 400 }
      )
    }

    // Traiter la demande
    const updatedRequest = await prisma.roleRequest.update({
      where: { id },
      data: {
        status: status as RoleRequestStatus,
        processedAt: new Date(),
        processedBy: session.id,
        adminNotes: adminNotes?.trim() || null
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
        },
        admin: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    })

    // Si approuvée, mettre à jour le rôle de l'utilisateur
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: roleRequest.user.id },
        data: { role: roleRequest.requestedRole }
      })
    }

    return NextResponse.json({
      message: status === 'APPROVED' 
        ? 'Demande approuvée et rôle mis à jour' 
        : 'Demande rejetée',
      roleRequest: updatedRequest
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de la demande' },
      { status: 500 }
    )
  }
}
