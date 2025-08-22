import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// PUT - Mettre à jour une tâche (titre, description ou statut)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existingTask = await prisma.userTask.findFirst({
      where: {
        id,
        userId: session.id
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, description, completed } = body

    // Validation du titre si fourni
    if (title !== undefined) {
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
    }

    // Construire l'objet de mise à jour
    const updateData: Prisma.UserTaskUpdateInput = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (completed !== undefined) updateData.completed = Boolean(completed)

    const updatedTask = await prisma.userTask.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      message: 'Tâche mise à jour avec succès', 
      task: updatedTask 
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la tâche' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une tâche
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existingTask = await prisma.userTask.findFirst({
      where: {
        id,
        userId: session.id
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    await prisma.userTask.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Tâche supprimée avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la tâche' },
      { status: 500 }
    )
  }
}
