import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token de confirmation requis' },
        { status: 400 }
      )
    }

    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token de confirmation invalide' },
        { status: 400 }
      )
    }

    // Vérifier si le token a expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      })
      return NextResponse.json(
        { error: 'Token de confirmation expiré' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Confirmer l'email de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        emailVerified: new Date()
      }
    })

    // Supprimer le token de vérification
    await prisma.verificationToken.delete({
      where: { token }
    })

    // Envoyer l'email de bienvenue
    try {
      const emailHtml = generateWelcomeEmail(user.name || 'Utilisateur')
      await sendEmail({
        to: user.email,
        subject: '🌱 Bienvenue sur Pol-UX - Votre voyage écologique commence !',
        html: emailHtml
      })
      console.log('Email de bienvenue envoyé à:', user.email)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError)
      // Ne pas faire échouer la confirmation si l'email de bienvenue ne peut pas être envoyé
    }

    return NextResponse.json(
      { message: 'Email confirmé avec succès ! Vous pouvez maintenant vous connecter.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors de la confirmation de l\'email:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la confirmation de l\'email' },
      { status: 500 }
    )
  }
}
