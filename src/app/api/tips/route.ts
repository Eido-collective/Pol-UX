import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Construire les filtres
    const where: any = {
      isApproved: true
    }

    if (category && category !== 'all') {
      where.category = category
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

    // TODO: Récupérer l'utilisateur connecté depuis la session
    // Pour l'instant, on utilise un utilisateur par défaut
    const defaultUserId = 'default-user-id'

    const tip = await prisma.tip.create({
      data: {
        title,
        content,
        category,
        imageUrl,
        authorId: defaultUserId,
        isApproved: false // Les nouveaux conseils doivent être approuvés
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
