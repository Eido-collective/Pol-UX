import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ForumCategory } from '@prisma/client'
import { getServerSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Construire les filtres
    const where: Prisma.ForumPostWhereInput = {
      isPublished: true
    }

    if (category && category !== 'all') {
      where.category = category as ForumCategory
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              username: true
            }
          },
          comments: {
            where: { isPublished: true },
            include: {
              author: {
                select: {
                  name: true,
                  username: true
                }
              },
              votes: true
            }
          },
          votes: true,
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
      prisma.forumPost.count({ where })
    ])

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer un post' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, category } = body

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: 'Le titre doit contenir entre 3 et 200 caractères' },
        { status: 400 }
      )
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Le contenu doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    // Créer le post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category: category as ForumCategory,
        authorId: session.user.id
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

    return NextResponse.json({
      message: 'Post créé avec succès',
      post
    })

  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du post' },
      { status: 500 }
    )
  }
}
