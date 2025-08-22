import { NextResponse } from 'next/server'
import { getServerSession, clearSessionAndCookie } from '@/lib/auth-utils'

export async function POST() {
  try {
    console.log('🚪 Déconnexion demandée...')
    
    const session = await getServerSession()
    if (session) {
      console.log('👤 Utilisateur connecté:', session.email)
    } else {
      console.log('⚠️ Aucune session active trouvée')
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })

    // Supprimer la session de la base de données ET le cookie
    console.log('🧹 Nettoyage de la session...')
    await clearSessionAndCookie(response)
    
    console.log('✅ Déconnexion terminée avec succès')
    return response

  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de déconnexion' },
      { status: 500 }
    )
  }
}
