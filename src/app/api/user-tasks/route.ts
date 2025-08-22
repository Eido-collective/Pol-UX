import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET - Récupérer les tâches de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const tasks = await prisma.userTask.findMany({
      where: {
        userId: session.id
      },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des tâches' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle tâche
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le titre est obligatoire' },
        { status: 400 }
      )
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: 'Le titre ne peut pas dépasser 100 caractères' },
        { status: 400 }
      )
    }

    // Vérifier la limite de 5 tâches
    const existingTasksCount = await prisma.userTask.count({
      where: { userId: session.id }
    })

    if (existingTasksCount >= 5) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas avoir plus de 5 tâches. Supprimez-en une pour en créer une nouvelle.' },
        { status: 400 }
      )
    }

    const task = await prisma.userTask.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: session.id
      }
    })

    return NextResponse.json({ 
      message: 'Tâche créée avec succès', 
      task 
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la tâche' },
      { status: 500 }
    )
  }
}
