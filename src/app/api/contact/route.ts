import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validation des champs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Configuration du transporteur SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'solene@pol-ux.fr',
      subject: `[PolUX Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
            Nouveau message de contact - PolUX
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Informations du contact</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Sujet :</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Ce message a été envoyé depuis le formulaire de contact de PolUX.</p>
            <p>Date d'envoi : ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `,
    }

    // Envoi de l'email
    await transporter.sendMail(mailOptions)

    // Email de confirmation pour l'expéditeur
    const confirmationMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Confirmation de votre message - PolUX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
            Confirmation de votre message
          </h2>
          
          <p>Bonjour ${name},</p>
          
          <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Récapitulatif de votre message</h3>
            <p><strong>Sujet :</strong> ${subject}</p>
            <p><strong>Message :</strong></p>
            <p style="background-color: #ffffff; padding: 15px; border-radius: 4px; border-left: 4px solid #059669;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <p>Nous vous répondrons dans les plus brefs délais (généralement sous 24-48h).</p>
          
          <p>Cordialement,<br>
          <strong>L'équipe PolUX</strong></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            <p>Pour nous contacter : solene@pol-ux.fr</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(confirmationMailOptions)

    return NextResponse.json(
      { message: 'Message envoyé avec succès' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
