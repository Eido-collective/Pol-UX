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

    const initiative = await prisma.initiative.update({
      where: { id },
      data: { isApproved: true },
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
      message: 'Initiative approuvée avec succès',
      initiative
    })

  } catch (error) {
    console.error('Erreur lors de l\'approbation de l\'initiative:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'approbation' },
      { status: 500 }
    )
  }
}
