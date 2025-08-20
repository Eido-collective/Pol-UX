import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour voter' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { value } = body // 1 pour upvote, -1 pour downvote

    // Validation
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'Valeur de vote invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le commentaire existe
    const comment = await prisma.forumComment.findUnique({
      where: { id }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: id
        }
      }
    })

    let vote
    if (existingVote) {
      // Mettre à jour le vote existant
      if (existingVote.value === value) {
        // Supprimer le vote si l'utilisateur clique sur le même bouton
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
        vote = null
      } else {
        // Changer le vote
        vote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        })
      }
    } else {
      // Créer un nouveau vote
      vote = await prisma.vote.create({
        data: {
          value,
          userId: session.user.id,
          commentId: id
        }
      })
    }

    // Récupérer le nombre total de votes
    const voteCount = await prisma.vote.aggregate({
      where: { commentId: id },
      _sum: { value: true }
    })

    return NextResponse.json({
      message: vote ? 'Vote enregistré' : 'Vote supprimé',
      vote,
      totalVotes: voteCount._sum.value || 0
    })

  } catch (error) {
    console.error('Erreur lors du vote:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du vote' },
      { status: 500 }
    )
  }
}
