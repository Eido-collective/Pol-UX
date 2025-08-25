import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer la demande
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!roleRequest) {
      return NextResponse.json(
        { error: 'Demande de rôle non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: roleRequest.userId },
      data: { role: roleRequest.requestedRole }
    })

    // Marquer la demande comme approuvée
    await prisma.roleRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de l\'approbation de la demande:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'approbation de la demande' },
      { status: 500 }
    )
  }
}
