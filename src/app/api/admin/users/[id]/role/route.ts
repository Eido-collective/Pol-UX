import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { id } = params
    const { role } = await request.json()

    // Validation du rôle
    if (!['EXPLORER', 'CONTRIBUTOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Rôle utilisateur mis à jour avec succès',
      user
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}
