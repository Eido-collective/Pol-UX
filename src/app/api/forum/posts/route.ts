import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ForumCategory } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

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

    const posts = await prisma.forumPost.findMany({
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
      }
    })

    return NextResponse.json({
      posts,
      count: posts.length
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer un post' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, category } = body

    // Validation des données
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    if (title.length < 5) {
      return NextResponse.json(
        { error: 'Le titre doit contenir au moins 5 caractères' },
        { status: 400 }
      )
    }

    if (content.length < 20) {
      return NextResponse.json(
        { error: 'Le contenu doit contenir au moins 20 caractères' },
        { status: 400 }
      )
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category,
        authorId: session.user.id
        // isPublished est par défaut à true dans le schéma
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
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du post' },
      { status: 500 }
    )
  }
}
