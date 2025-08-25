import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Prisma.ArticleWhereInput = {
      isPublished: true
    }

    if (category && category !== 'all' && category !== '') {
      where.category = category as Prisma.EnumArticleCategoryFilter
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Si le tri par score est demandé, récupérer tous les articles d'abord
    if (sortBy === 'mostVoted') {
      const allArticles = await prisma.article.findMany({
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
        }
      })

      // Trier par score de votes
      const sortedArticles = allArticles.sort((a, b) => {
        const scoreA = a.votes.reduce((sum, vote) => sum + vote.value, 0)
        const scoreB = b.votes.reduce((sum, vote) => sum + vote.value, 0)
        return scoreB - scoreA // Tri décroissant
      })

      // Appliquer la pagination
      const total = sortedArticles.length
      const articles = sortedArticles.slice(skip, skip + limit)

      return NextResponse.json({
        data: articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    }

    // Pour les autres tris, utiliser la requête normale avec pagination
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
          publishedAt: sortBy === 'oldest' ? 'asc' : 'desc'
        },
        skip,
        take: limit
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer un article' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a le rôle CONTRIBUTOR ou ADMIN
    if (session.role === 'EXPLORER') {
      return NextResponse.json(
        { error: 'Vous devez être Contributeur ou Administrateur pour créer des articles. Demandez une promotion de rôle.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, category, source } = body

    // Validation des données
    if (!title || !content || !excerpt || !category) {
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
        source,
        authorId: session.id
        // isPublished et publishedAt sont par défaut gérés dans le schéma
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
