import { cleanupExpiredSessions } from './auth-utils'

// Fonction pour nettoyer les sessions expirées
export async function cleanupSessions() {
  try {
    console.log('🧹 Nettoyage des sessions expirées...')
    await cleanupExpiredSessions()
    console.log('✅ Sessions expirées nettoyées avec succès')
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des sessions:', error)
  }
}

// Fonction pour exécuter le nettoyage périodiquement
export function startSessionCleanup(intervalMinutes: number = 60) {
  console.log(`🔄 Démarrage du nettoyage automatique des sessions (toutes les ${intervalMinutes} minutes)`)
  
  // Nettoyer immédiatement
  cleanupSessions()
  
  // Puis nettoyer périodiquement
  setInterval(cleanupSessions, intervalMinutes * 60 * 1000)
}

// Fonction pour nettoyer les sessions d'un utilisateur spécifique
export async function cleanupUserSessions(userId: string) {
  try {
    const { prisma } = await import('./prisma')
    
    console.log(`🧹 Nettoyage des sessions pour l'utilisateur ${userId}...`)
    
    await prisma.session.deleteMany({
      where: {
        userId
      }
    })
    
    console.log(`✅ Sessions de l'utilisateur ${userId} nettoyées avec succès`)
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage des sessions de l'utilisateur ${userId}:`, error)
  }
}
