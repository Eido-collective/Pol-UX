import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { type } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let result
    let total

    switch (type) {
      case 'articles':
        [result, total] = await Promise.all([
          prisma.article.findMany({
            skip,
            take: limit,
            include: {
              author: {
                select: {
                  name: true,
                  username: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.article.count()
        ])
        break
      case 'tips':
        [result, total] = await Promise.all([
          prisma.tip.findMany({
            skip,
            take: limit,
            include: {
              author: {
                select: {
                  name: true,
                  username: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.tip.count()
        ])
        break
      case 'initiatives':
        [result, total] = await Promise.all([
          prisma.initiative.findMany({
            skip,
            take: limit,
            include: {
              author: {
                select: {
                  name: true,
                  username: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.initiative.count()
        ])
        break
      case 'forumComments':
        [result, total] = await Promise.all([
          prisma.forumComment.findMany({
            skip,
            take: limit,
            include: {
              author: {
                select: {
                  name: true,
                  username: true
                }
              },
              post: {
                select: {
                  id: true,
                  title: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.forumComment.count()
        ])
        break
      case 'forumPosts':
        [result, total] = await Promise.all([
          prisma.forumPost.findMany({
            skip,
            take: limit,
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
            orderBy: { createdAt: 'desc' }
          }),
          prisma.forumPost.count()
        ])
        break
      default:
        return NextResponse.json(
          { error: 'Type de contenu non supporté' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération' },
      { status: 500 }
    )
  }
}
