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

    // Récupérer les statistiques de contenu
    const stats = {
      initiatives: 0,
      articles: 0,
      tips: 0,
      forumPosts: 0
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
