import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Mettre à jour une tâche (titre, description ou statut)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existingTask = await prisma.userTask.findFirst({
      where: {
        id,
        userId: session.user.id
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
    const updateData: any = {}
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
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    // Vérifier que la tâche existe et appartient à l'utilisateur
    const existingTask = await prisma.userTask.findFirst({
      where: {
        id,
        userId: session.user.id
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
