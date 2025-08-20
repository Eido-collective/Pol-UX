import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Récupérer les demandes de l'utilisateur connecté
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const roleRequests = await prisma.roleRequest.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ roleRequests })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de promotion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des demandes' },
      { status: 500 }
    )
  }
}
