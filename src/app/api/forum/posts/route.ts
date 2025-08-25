import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ForumCategory } from '@prisma/client'
import { getServerSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'
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

    // Définir l'ordre de tri
    let orderBy: Prisma.ForumPostOrderByWithRelationInput
    let shouldFetchAll = false
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'mostVoted':
        shouldFetchAll = true // Récupérer tous les posts pour le tri par score
        orderBy = { createdAt: 'desc' } // Tri temporaire
        break
      case 'mostCommented':
        shouldFetchAll = true // Récupérer tous les posts pour le tri par commentaires
        orderBy = { createdAt: 'desc' } // Tri temporaire
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    let posts
    if (shouldFetchAll) {
      // Récupérer tous les posts pour le tri par score ou commentaires
      posts = await prisma.forumPost.findMany({
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
        orderBy
      })

      // Appliquer le tri approprié
      if (sortBy === 'mostVoted') {
        posts = posts.sort((a, b) => {
          const scoreA = a.votes.reduce((sum, vote) => sum + vote.value, 0)
          const scoreB = b.votes.reduce((sum, vote) => sum + vote.value, 0)
          return scoreB - scoreA
        })
      } else if (sortBy === 'mostCommented') {
        posts = posts.sort((a, b) => {
          return (b._count.comments || 0) - (a._count.comments || 0)
        })
      }

      // Appliquer la pagination après le tri
      posts = posts.slice(skip, skip + limit)
    } else {
      // Récupération normale avec pagination
      posts = await prisma.forumPost.findMany({
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
        orderBy,
        skip,
        take: limit
      })
    }

    const total = await prisma.forumPost.count({ where })

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

    // Validation des longueurs
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Le titre ne peut pas dépasser 200 caractères' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Le contenu ne peut pas dépasser 5000 caractères' },
        { status: 400 }
      )
    }

    // Créer le post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category: category as ForumCategory,
        authorId: session.id
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
