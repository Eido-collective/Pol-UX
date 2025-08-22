import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

interface UserResponse {
  id: string
  name: string | null
  email: string
  username: string
  role: string
  emailConfirmed: boolean
  createdAt: Date
}

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer la liste des utilisateurs
    const users: UserResponse[] = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        emailConfirmed: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}
