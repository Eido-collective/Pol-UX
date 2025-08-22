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
        { error: 'Vous devez être connecté pour voter' },
        { status: 401 }
      )
    }

    const { id } = await params

    const body = await request.json()
    const { value } = body

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'Valeur de vote invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'article existe et est publié
    const article = await prisma.article.findUnique({
      where: {
        id: id,
        isPublished: true
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: id
        }
      }
    })

    if (existingVote) {
      if (existingVote.value === value) {
        // Supprimer le vote si l'utilisateur clique sur le même bouton
        await prisma.vote.delete({
          where: {
            id: existingVote.id
          }
        })
      } else {
        // Mettre à jour le vote
        await prisma.vote.update({
          where: {
            id: existingVote.id
          },
          data: {
            value
          }
        })
      }
    } else {
      // Créer un nouveau vote
      await prisma.vote.create({
        data: {
          value,
          userId: session.user.id,
          articleId: id
        }
      })
    }

    return NextResponse.json({ message: 'Vote enregistré avec succès' })

  } catch (error) {
    console.error('Erreur lors du vote:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du vote' },
      { status: 500 }
    )
  }
}
