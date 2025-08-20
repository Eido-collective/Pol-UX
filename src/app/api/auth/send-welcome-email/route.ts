import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'email est confirmé
    if (!user.emailConfirmed) {
      return NextResponse.json(
        { error: 'Email non confirmé' },
        { status: 400 }
      )
    }

    // Envoyer l'email de bienvenue
    try {
      const emailHtml = generateWelcomeEmail(user.name || 'Utilisateur')
      await sendEmail({
        to: user.email,
        subject: '🌱 Bienvenue sur Pol-UX - Votre voyage écologique commence !',
        html: emailHtml
      })
      console.log('Email de bienvenue envoyé à:', user.email)
      
      return NextResponse.json(
        { message: 'Email de bienvenue envoyé avec succès' },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email de bienvenue' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
