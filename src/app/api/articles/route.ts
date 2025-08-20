import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Prisma.ArticleWhereInput = {
      isApproved: true,
      isPublished: true
    }

    if (category && category !== 'all') {
      where.category = category as Prisma.EnumArticleCategoryFilter
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
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
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du chargement des articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer un article' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a le rôle CONTRIBUTOR ou ADMIN
    if (session.user.role === 'EXPLORER') {
      return NextResponse.json(
        { error: 'Vous devez être Contributeur ou Administrateur pour créer des articles. Demandez une promotion de rôle.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, category, imageUrl } = body

    // Validation des données
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    if (title.length < 10) {
      return NextResponse.json(
        { error: 'Le titre doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    if (content.length < 100) {
      return NextResponse.json(
        { error: 'Le contenu doit contenir au moins 100 caractères' },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt,
        category,
        imageUrl,
        authorId: session.user.id,
        isApproved: session.user.role === 'ADMIN',
        isPublished: session.user.role === 'ADMIN',
        publishedAt: session.user.role === 'ADMIN' ? new Date() : null
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
      message: 'Article créé avec succès',
      article
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'article' },
      { status: 500 }
    )
  }
}
