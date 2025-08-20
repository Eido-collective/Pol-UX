import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ForumCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: Prisma.ForumPostWhereInput = {
      isApproved: true
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
          where: { isApproved: true },
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

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Le contenu doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    // TODO: Récupérer l'utilisateur connecté depuis la session
    // Pour l'instant, on utilise un utilisateur par défaut
    const defaultUserId = 'default-user-id'

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category,
        authorId: defaultUserId,
        isApproved: false // Les nouveaux posts doivent être approuvés
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
