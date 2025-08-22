import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, setSessionCookie } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont obligatoires' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier si l'email est confirmé
    if (!user.emailConfirmed) {
      return NextResponse.json(
        { error: 'Veuillez confirmer votre adresse email avant de vous connecter' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password || '')
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer la session utilisateur
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      emailConfirmed: user.emailConfirmed
    }

    const sessionToken = await createSession(sessionUser)

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    })

    // Définir le cookie de session
    setSessionCookie(sessionToken, response)

    return response

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error)
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}
