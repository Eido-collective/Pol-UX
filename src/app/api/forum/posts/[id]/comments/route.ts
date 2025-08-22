import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour ajouter un commentaire' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { content, parentId } = body

    // Validation des données
    if (!content || content.trim().length < 3) {
      return NextResponse.json(
        { error: 'Le commentaire doit contenir au moins 3 caractères' },
        { status: 400 }
      )
    }

    // Vérifier que le post existe
    const post = await prisma.forumPost.findUnique({
      where: { id }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      )
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe et n'est pas déjà une réponse
    if (parentId) {
      const parentComment = await prisma.forumComment.findUnique({
        where: { id: parentId },
        select: { parentId: true, postId: true }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Commentaire parent non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier que le parent appartient au même post
      if (parentComment.postId !== id) {
        return NextResponse.json(
          { error: 'Le commentaire parent n\'appartient pas à ce post' },
          { status: 400 }
        )
      }

      // Empêcher les réponses aux réponses (max 2 niveaux)
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: 'Impossible de répondre à une réponse. Veuillez répondre au commentaire principal.' },
          { status: 400 }
        )
      }
    }

    // Créer le commentaire
    const comment = await prisma.forumComment.create({
      data: {
        content: content.trim(),
        postId: id,
        parentId: parentId || null,
        authorId: session.id,
        isPublished: true // S'assurer que le commentaire est publié
      },
      include: {
        author: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    // Debug: afficher les détails du commentaire créé
    console.log(`Commentaire créé: ID=${comment.id}, isPublished=${comment.isPublished}, content="${comment.content.substring(0, 50)}..."`)

    return NextResponse.json({
      message: parentId 
        ? 'Réponse ajoutée avec succès' 
        : 'Commentaire ajouté avec succès',
      comment,
      isReply: !!parentId
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'ajout du commentaire' },
      { status: 500 }
    )
  }
}
