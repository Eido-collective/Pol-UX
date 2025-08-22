import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour supprimer un commentaire' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier que le commentaire existe
    const comment = await prisma.forumComment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions (auteur ou admin)
    const isAuthor = comment.author.id === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer ce commentaire' },
        { status: 403 }
      )
    }

    // Supprimer le commentaire (les réponses seront supprimées automatiquement grâce à onDelete: Cascade)
    await prisma.forumComment.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Commentaire supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du commentaire' },
      { status: 500 }
    )
  }
}
