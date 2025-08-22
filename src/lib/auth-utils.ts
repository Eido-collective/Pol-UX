import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Types pour l'utilisateur de session
export interface SessionUser {
  id: string
  name: string | null
  email: string
  username: string
  role: string
  emailConfirmed: boolean
}

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const SESSION_COOKIE_NAME = 'polux-session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 jours

// Générer un token JWT
export function generateJWT(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      emailConfirmed: user.emailConfirmed
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Vérifier et décoder un token JWT
export function verifyJWT(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    return {
      id: decoded.id as string,
      name: decoded.name as string | null,
      email: decoded.email as string,
      username: decoded.username as string,
      role: decoded.role as string,
      emailConfirmed: decoded.emailConfirmed as boolean
    }
  } catch (error) {
    console.error('Erreur de vérification JWT:', error)
    return null
  }
}

// Créer une session utilisateur
export async function createSession(user: SessionUser): Promise<string> {
  // Générer un token de session unique
  const sessionToken = crypto.randomUUID()
  
  // Calculer la date d'expiration
  const expires = new Date(Date.now() + SESSION_DURATION)
  
  // Sauvegarder la session en base de données
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires
    }
  })
  
  return sessionToken
}

// Récupérer une session par token
export async function getSessionByToken(sessionToken: string): Promise<SessionUser | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            emailConfirmed: true
          }
        }
      }
    })

    if (!session || session.expires < new Date()) {
      return null
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      username: session.user.username,
      role: session.user.role,
      emailConfirmed: session.user.emailConfirmed
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de session:', error)
    return null
  }
}

// Supprimer une session
export async function deleteSession(sessionToken: string): Promise<boolean> {
  try {
    const result = await prisma.session.delete({
      where: { sessionToken }
    })
    console.log('✅ Session supprimée:', sessionToken.substring(0, 8) + '...')
    return true
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de session:', error)
    return false
  }
}

// Nettoyer les sessions expirées
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
  } catch (error) {
    console.error('Erreur lors du nettoyage des sessions:', error)
  }
}

// Récupérer l'utilisateur depuis les cookies (côté serveur)
export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    return await getSessionByToken(sessionToken)
  } catch (error) {
    console.error('Erreur lors de la récupération de session côté serveur:', error)
    return null
  }
}

// Récupérer l'utilisateur depuis les cookies (côté client)
export async function getClientSession(): Promise<SessionUser | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Erreur lors de la récupération de session côté client:', error)
    return null
  }
}

// Définir un cookie de session
export function setSessionCookie(sessionToken: string, response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convertir en secondes
    path: '/'
  })
  
  return response
}

// Supprimer le cookie de session
export function clearSessionCookie(response: NextResponse): NextResponse {
  // Supprimer le cookie en définissant une date d'expiration dans le passé
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0), // Date dans le passé pour forcer la suppression
    path: '/'
  })
  
  return response
}

// Supprimer le cookie de session et la session de la base de données
export async function clearSessionAndCookie(response: NextResponse): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      console.log('🔍 Token de session trouvé:', sessionToken.substring(0, 8) + '...')
      // Supprimer la session de la base de données
      const deleted = await deleteSession(sessionToken)
      if (deleted) {
        console.log('✅ Session supprimée de la base de données')
      } else {
        console.log('⚠️ Échec de la suppression de session en base')
      }
    } else {
      console.log('⚠️ Aucun token de session trouvé dans les cookies')
    }

    // Supprimer le cookie
    const result = clearSessionCookie(response)
    console.log('✅ Cookie de session supprimé')
    return result
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de session:', error)
    // Même en cas d'erreur, supprimer le cookie
    return clearSessionCookie(response)
  }
}

// Middleware pour protéger les routes API
export function withAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }
    
    // Ajouter l'utilisateur à la requête
    ;(request as NextRequest & { user: SessionUser }).user = session
    
    return handler(request, ...args)
  }
}

// Middleware pour vérifier les rôles
export function withRole(requiredRole: string) {
  return (handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: unknown[]) => {
      const session = await getServerSession()
      
      if (!session) {
        return NextResponse.json(
          { error: 'Authentification requise' },
          { status: 401 }
        )
      }
      
      if (session.role !== requiredRole && session.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Permissions insuffisantes' },
          { status: 403 }
        )
      }
      
      // Ajouter l'utilisateur à la requête
      ;(request as NextRequest & { user: SessionUser }).user = session
      
      return handler(request, ...args)
    }
  }
}

// Vérifier si l'utilisateur est connecté
export function isAuthenticated(session: SessionUser | null): boolean {
  return session !== null && session.emailConfirmed
}

// Vérifier si l'utilisateur a un rôle spécifique
export function hasRole(session: SessionUser | null, role: string): boolean {
  return isAuthenticated(session) && (session.role === role || session.role === 'ADMIN')
}
