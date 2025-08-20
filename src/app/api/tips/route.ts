import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma, TipCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: Prisma.TipWhereInput = {
      isApproved: true
    }

    if (category && category !== 'all') {
      where.category = category as TipCategory
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const tips = await prisma.tip.findMany({
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      tips,
      count: tips.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des conseils:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des conseils' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer un conseil' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a le rôle CONTRIBUTOR ou ADMIN
    if (session.user.role === 'EXPLORER') {
      return NextResponse.json(
        { error: 'Vous devez être Contributeur ou Administrateur pour créer des conseils. Demandez une promotion de rôle.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, category, imageUrl } = body

    // Validation des données
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
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

    const tip = await prisma.tip.create({
      data: {
        title,
        content,
        category,
        imageUrl,
        authorId: session.user.id,
        isApproved: session.user.role === 'ADMIN'
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
      message: 'Conseil créé avec succès',
      tip
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du conseil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du conseil' },
      { status: 500 }
    )
  }
}
