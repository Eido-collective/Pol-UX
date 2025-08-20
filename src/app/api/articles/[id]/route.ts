import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
          const article = await prisma.article.findUnique({
        where: {
          id: id,
          isApproved: true,
          isPublished: true
        },
      include: {
        author: {
          select: {
            name: true,
            username: true
          }
        },
        votes: true,
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ article })

  } catch (error) {
    console.error('Erreur lors du chargement de l\'article:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du chargement de l\'article' },
      { status: 500 }
    )
  }
}
