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
    const { value } = await request.json()

    // Validation de la valeur de vote
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'La valeur de vote doit être 1 ou -1' },
        { status: 400 }
      )
    }

    // Vérifier que le tip existe
    const tip = await prisma.tip.findUnique({
      where: { id },
      include: { votes: true }
    })

    if (!tip) {
      return NextResponse.json(
        { error: 'Conseil non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le tip est approuvé
    if (!tip.isApproved) {
      return NextResponse.json(
        { error: 'Ce conseil n\'est pas encore approuvé' },
        { status: 403 }
      )
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findFirst({
      where: {
        tipId: id,
        userId: session.user.id
      }
    })

    if (existingVote) {
      // Si l'utilisateur vote la même valeur, supprimer le vote
      if (existingVote.value === value) {
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
      } else {
        // Sinon, mettre à jour le vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        })
      }
    } else {
      // Créer un nouveau vote
      await prisma.vote.create({
        data: {
          value,
          tipId: id,
          userId: session.user.id
        }
      })
    }

    // Récupérer le tip mis à jour avec les votes
    const updatedTip = await prisma.tip.findUnique({
      where: { id },
      include: {
        votes: true,
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Vote enregistré avec succès',
      tip: updatedTip
    })

  } catch (error) {
    console.error('Erreur lors du vote:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du vote' },
      { status: 500 }
    )
  }
}
