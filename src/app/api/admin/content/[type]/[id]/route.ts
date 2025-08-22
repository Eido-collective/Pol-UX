import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { type, id } = await params
    const body = await request.json()

    // Logique de mise à jour selon le type
    let result
    switch (type) {
      case 'article':
        result = await prisma.article.update({
          where: { id },
          data: body
        })
        break
      case 'tip':
        result = await prisma.tip.update({
          where: { id },
          data: body
        })
        break
      case 'initiative':
        result = await prisma.initiative.update({
          where: { id },
          data: body
        })
        break
      default:
        return NextResponse.json(
          { error: 'Type de contenu non supporté' },
          { status: 400 }
        )
    }

    return NextResponse.json({ message: 'Contenu mis à jour avec succès', result })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    )
  }
}
