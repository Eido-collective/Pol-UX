import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

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
    const { role } = await request.json()

    if (!role || !['EXPLORER', 'CONTRIBUTOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    })

    return NextResponse.json({ 
      message: 'Rôle mis à jour avec succès', 
      user: { id: user.id, role: user.role } 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}
