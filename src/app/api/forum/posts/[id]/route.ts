import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
                        author: {
                  select: {
                    id: true,
                    name: true,
                    username: true
                  }
                },
        comments: {
          where: { 
            isApproved: true,
            parentId: null // Récupérer seulement les commentaires principaux
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true
              }
            },
            replies: {
              where: { isApproved: true },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    username: true
                  }
                },
                votes: true
              },
              orderBy: {
                createdAt: 'asc'
              }
            },
            votes: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        votes: true,
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du post' },
      { status: 500 }
    )
  }
}
