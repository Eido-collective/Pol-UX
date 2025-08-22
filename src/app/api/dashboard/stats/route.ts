import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    // Récupérer les statistiques de l'utilisateur
    const stats = {
      initiatives: 0,
      articles: 0,
      tips: 0,
      forumPosts: 0,
      comments: 0,
      votes: 0
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
