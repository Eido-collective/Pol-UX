import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { action, adminNotes } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      )
    }

    // Récupérer la demande
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    // Traiter la demande
    await prisma.roleRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNotes: adminNotes?.trim() || null,
        processedAt: new Date(),
        processedBy: session.user.id
      }
    })

    // Si approuvée, mettre à jour le rôle de l'utilisateur
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: roleRequest.userId },
        data: { role: roleRequest.requestedRole }
      })
    }

    return NextResponse.json({
      message: `Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la demande de promotion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de la demande' },
      { status: 500 }
    )
  }
}
