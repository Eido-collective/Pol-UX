import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, username, password } = await request.json()

    // Validation des données
    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà utilisée' },
        { status: 400 }
      )
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur (email non confirmé)
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        username,
        password: hashedPassword,
        role: 'EXPLORER',
        emailConfirmed: false
      }
    })

    // Créer un token de vérification
    const verificationToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires
      }
    })

    // Envoyer l'email de confirmation
    try {
      const confirmationUrl = `${process.env.NEXTAUTH_URL}/confirm-email?token=${verificationToken}`
      const emailHtml = generateConfirmationEmail(user.name || `${firstName} ${lastName}`, confirmationUrl)
      await sendEmail({
        to: user.email,
        subject: '🌱 Confirmez votre email - Pol-UX',
        html: emailHtml
      })
      console.log('Email de confirmation envoyé à:', user.email)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError)
      // Supprimer l'utilisateur si l'email ne peut pas être envoyé
      await prisma.user.delete({ where: { id: user.id } })
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email de confirmation. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    // Retourner la réponse sans le mot de passe
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès ! Veuillez vérifier votre boîte email pour confirmer votre adresse.',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}
