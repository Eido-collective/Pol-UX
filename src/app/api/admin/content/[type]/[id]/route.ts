import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { type, id } = await params
    const body = await request.json()
    const { action } = body

    let result
    
    switch (type) {
      case 'initiatives':
        if (action === 'unpublish') {
          result = await prisma.initiative.update({
            where: { id },
            data: { isPublished: false }
          })
        } else if (action === 'publish') {
          result = await prisma.initiative.update({
            where: { id },
            data: { isPublished: true }
          })
        }
        break

      case 'posts':
        if (action === 'unpublish') {
          result = await prisma.forumPost.update({
            where: { id },
            data: { isPublished: false }
          })
        } else if (action === 'publish') {
          result = await prisma.forumPost.update({
            where: { id },
            data: { isPublished: true }
          })
        }
        break

      case 'tips':
        if (action === 'unpublish') {
          result = await prisma.tip.update({
            where: { id },
            data: { isPublished: false }
          })
        } else if (action === 'publish') {
          result = await prisma.tip.update({
            where: { id },
            data: { isPublished: true }
          })
        }
        break

      case 'articles':
        if (action === 'unpublish') {
          result = await prisma.article.update({
            where: { id },
            data: { isPublished: false }
          })
        } else if (action === 'publish') {
          result = await prisma.article.update({
            where: { id },
            data: { isPublished: true }
          })
        }
        break

      default:
        return NextResponse.json(
          { error: 'Type de contenu non supporté' },
          { status: 400 }
        )
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Action non supportée' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Contenu ${action === 'publish' ? 'publié' : 'dépublié'} avec succès`,
      item: result
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du contenu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { type, id } = await params

    switch (type) {
      case 'initiatives':
        await prisma.initiative.delete({
          where: { id }
        })
        break

      case 'posts':
        await prisma.forumPost.delete({
          where: { id }
        })
        break

      case 'tips':
        await prisma.tip.delete({
          where: { id }
        })
        break

      case 'articles':
        await prisma.article.delete({
          where: { id }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Type de contenu non supporté' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: 'Contenu supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du contenu:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du contenu' },
      { status: 500 }
    )
  }
}
