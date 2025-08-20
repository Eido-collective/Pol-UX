import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Initiative, ForumPost, Tip, Article } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const data: {
      initiatives?: Initiative[]
      posts?: ForumPost[]
      tips?: Tip[]
      articles?: Article[]
    } = {}

    if (type === 'all' || type === 'initiatives') {
      const initiatives = await prisma.initiative.findMany({
        include: {
          author: {
            select: {
              name: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      data.initiatives = initiatives
    }

    if (type === 'all' || type === 'posts') {
      const posts = await prisma.forumPost.findMany({
        include: {
          author: {
            select: {
              name: true,
              username: true
            }
          },
          _count: {
            select: {
              comments: true,
              votes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      data.posts = posts
    }

    if (type === 'all' || type === 'tips') {
      const tips = await prisma.tip.findMany({
        include: {
          author: {
            select: {
              name: true,
              username: true
            }
          },
          _count: {
            select: {
              votes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      data.tips = tips
    }

    if (type === 'all' || type === 'articles') {
      const articles = await prisma.article.findMany({
        include: {
          author: {
            select: {
              name: true,
              username: true
            }
          },
          _count: {
            select: {
              votes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      data.articles = articles
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du contenu' },
      { status: 500 }
    )
  }
}
