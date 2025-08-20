const nodemailer = require('nodemailer')
require('dotenv').config()

async function testEmail() {
  console.log('🧪 Test de la configuration SMTP...')
  
  // Vérifier les variables d'environnement
  console.log('📧 SMTP_USER:', process.env.SMTP_USER ? '✅ Configuré' : '❌ Manquant')
  console.log('🔑 SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Configuré' : '❌ Manquant')
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('❌ Variables d\'environnement manquantes. Vérifiez votre fichier .env')
    return
  }

  try {
    // Créer le transporteur
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Tester la connexion
    console.log('🔌 Test de connexion...')
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie !')

    // Envoyer un email de test
    console.log('📤 Envoi d\'un email de test...')
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'solene@pol-ux.fr',
      subject: 'Test SMTP PolUX',
      html: `
        <h2>Test de configuration SMTP</h2>
        <p>Cet email confirme que la configuration SMTP de PolUX fonctionne correctement.</p>
        <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Email de test envoyé avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('💡 Conseil: Vérifiez votre mot de passe d\'application Gmail')
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Conseil: Vérifiez votre connexion internet')
    }
  }
}

testEmail()
