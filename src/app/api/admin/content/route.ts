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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const data: {
      initiatives?: Initiative[]
      posts?: ForumPost[]
      tips?: Tip[]
      articles?: Article[]
      total?: number
      pages?: number
    } = {}

    if (type === 'all' || type === 'initiatives') {
      const whereClause: { isPublished?: boolean } = {}
      if (status === 'published') whereClause.isPublished = true
      else if (status === 'unpublished') whereClause.isPublished = false

      const [initiatives, total] = await Promise.all([
        prisma.initiative.findMany({
          where: whereClause,
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
          },
          skip,
          take: limit
        }),
        prisma.initiative.count({ where: whereClause })
      ])
      data.initiatives = initiatives
      if (type === 'initiatives') {
        data.total = total
        data.pages = Math.ceil(total / limit)
      }
    }

    if (type === 'all' || type === 'posts') {
      const whereClause: { isPublished?: boolean } = {}
      if (status === 'published') whereClause.isPublished = true
      else if (status === 'unpublished') whereClause.isPublished = false

      const [posts, total] = await Promise.all([
        prisma.forumPost.findMany({
          where: whereClause,
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
          },
          skip,
          take: limit
        }),
        prisma.forumPost.count({ where: whereClause })
      ])
      data.posts = posts
      if (type === 'posts') {
        data.total = total
        data.pages = Math.ceil(total / limit)
      }
    }

    if (type === 'all' || type === 'tips') {
      const whereClause: { isPublished?: boolean } = {}
      if (status === 'published') whereClause.isPublished = true
      else if (status === 'unpublished') whereClause.isPublished = false

      const [tips, total] = await Promise.all([
        prisma.tip.findMany({
          where: whereClause,
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
          },
          skip,
          take: limit
        }),
        prisma.tip.count({ where: whereClause })
      ])
      data.tips = tips
      if (type === 'tips') {
        data.total = total
        data.pages = Math.ceil(total / limit)
      }
    }

    if (type === 'all' || type === 'articles') {
      const whereClause: { isPublished?: boolean } = {}
      if (status === 'published') whereClause.isPublished = true
      else if (status === 'unpublished') whereClause.isPublished = false

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where: whereClause,
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
          },
          skip,
          take: limit
        }),
        prisma.article.count({ where: whereClause })
      ])
      data.articles = articles
      if (type === 'articles') {
        data.total = total
        data.pages = Math.ceil(total / limit)
      }
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
