import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'

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
    const users = []

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}
