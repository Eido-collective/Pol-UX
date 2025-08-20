import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
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

    await prisma.forumPost.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Post supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression' },
      { status: 500 }
    )
  }
}
