import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email envoyé avec succès:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error: error }
  }
}

export const generateConfirmationEmail = (userName: string, confirmationUrl: string) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        
        .logo {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 16px 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 24px;
        }
        
        .logo-icon {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }
        
        .header-title {
          position: relative;
          z-index: 1;
          color: white;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .header-subtitle {
          position: relative;
          z-index: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 500;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .welcome-text {
          color: #374151;
          font-size: 18px;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        
        .welcome-text strong {
          color: #10b981;
          font-weight: 700;
        }
        
        .cta-section {
          text-align: center;
          margin: 32px 0;
          padding: 32px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border-radius: 16px;
          border: 2px solid #d1fae5;
        }
        
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 18px 36px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          border: none;
          cursor: pointer;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 35px -5px rgba(16, 185, 129, 0.5);
        }
        
        .warning-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          color: #92400e;
          padding: 20px;
          border-radius: 12px;
          margin: 24px 0;
          font-size: 16px;
          position: relative;
        }
        
        .warning-box::before {
          content: '⚠️';
          position: absolute;
          top: -10px;
          left: 20px;
          background: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .warning-box strong {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 32px 0;
        }
        
        .feature-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          border-color: #10b981;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
          font-size: 32px;
          margin-bottom: 16px;
          display: block;
        }
        
        .feature-title {
          color: #1f2937;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .feature-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .footer {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
          line-height: 1.6;
        }
        
        .footer-brand {
          color: #10b981;
          font-weight: 700;
        }
        
        .footer-motto {
          color: #059669;
          font-style: italic;
          margin-top: 8px;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 16px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .header-title {
            font-size: 28px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🌱</span>
            <span class="logo-text">Pol-UX</span>
          </div>
          <h1 class="header-title">Confirmez votre email</h1>
          <p class="header-subtitle">Une dernière étape pour rejoindre la communauté écologique</p>
        </div>

        <div class="content">
          <p class="welcome-text">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p class="welcome-text">
            Merci de vous être inscrit sur <strong>Pol-UX</strong> ! Pour finaliser votre inscription et accéder à votre compte, 
            veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
          </p>

          <div class="cta-section">
            <a href="${confirmationUrl}" class="cta-button">
              <span>✅</span>
              <span>Confirmer mon email</span>
            </a>
          </div>

          <div class="warning-box">
            <strong>Important</strong>
            Ce lien expire dans 24 heures. Si vous ne confirmez pas votre email dans ce délai, 
            vous devrez créer un nouveau compte.
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <span class="feature-icon">🗺️</span>
              <h3 class="feature-title">Carte Interactive</h3>
              <p class="feature-description">Découvrez les initiatives écologiques près de chez vous</p>
            </div>
            <div class="feature-card">
              <span class="feature-icon">💬</span>
              <h3 class="feature-title">Forum Collaboratif</h3>
              <p class="feature-description">Échangez avec la communauté et partagez vos idées</p>
            </div>
            <div class="feature-card">
              <span class="feature-icon">💡</span>
              <h3 class="feature-title">Conseils Écologiques</h3>
              <p class="feature-description">Découvrez des astuces pour réduire votre impact</p>
            </div>
            <div class="feature-card">
              <span class="feature-icon">📚</span>
              <h3 class="feature-title">Articles Engagés</h3>
              <p class="feature-description">Restez informé des dernières actualités écologiques</p>
            </div>
          </div>

          <p class="welcome-text" style="text-align: center; font-size: 16px; color: #6b7280;">
            Si vous n'avez pas créé de compte sur Pol-UX, vous pouvez ignorer cet email en toute sécurité.
          </p>
        </div>

        <div class="footer">
          <p class="footer-text">
            <span class="footer-brand">L'équipe Pol-UX</span> 🌱<br>
            <span class="footer-motto">Ensemble pour un monde plus durable</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const generateWelcomeEmail = (userName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        
        .logo {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 16px 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 24px;
        }
        
        .logo-icon {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }
        
        .header-title {
          position: relative;
          z-index: 1;
          color: white;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .header-subtitle {
          position: relative;
          z-index: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 500;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .welcome-text {
          color: #374151;
          font-size: 18px;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        
        .welcome-text strong {
          color: #10b981;
          font-weight: 700;
        }
        
        .eco-badge {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          display: inline-block;
          margin: 24px 0;
          text-align: center;
          border: 2px solid #86efac;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 32px 0;
        }
        
        .feature-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .feature-card:hover {
          border-color: #10b981;
          transform: translateY(-4px);
          box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
          font-size: 36px;
          margin-bottom: 16px;
          display: block;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .feature-title {
          color: #1f2937;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .feature-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .cta-section {
          text-align: center;
          margin: 40px 0;
          padding: 32px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border-radius: 20px;
          border: 2px solid #d1fae5;
          position: relative;
          overflow: hidden;
        }
        
        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
          animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .cta-button {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px 40px;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          border: none;
          cursor: pointer;
        }
        
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px -5px rgba(16, 185, 129, 0.6);
        }
        
        .role-info {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin: 32px 0;
          text-align: center;
        }
        
        .role-title {
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .role-description {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .footer {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
          line-height: 1.6;
        }
        
        .footer-brand {
          color: #10b981;
          font-weight: 700;
        }
        
        .footer-motto {
          color: #059669;
          font-style: italic;
          margin-top: 8px;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 16px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .header-title {
            font-size: 28px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🌱</span>
            <span class="logo-text">Pol-UX</span>
          </div>
          <h1 class="header-title">Bienvenue dans la communauté !</h1>
          <p class="header-subtitle">Votre voyage vers un monde plus vert commence ici</p>
        </div>

        <div class="content">
          <p class="welcome-text">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p class="welcome-text">
            Félicitations ! Votre compte sur <strong>Pol-UX</strong> a été confirmé avec succès. 
            Vous faites maintenant partie d'une communauté engagée pour l'environnement et le développement durable.
          </p>

          <div class="eco-badge">
            🌍 Ensemble pour un avenir plus vert
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <span class="feature-icon">🗺️</span>
              <h3 class="feature-title">Carte Interactive</h3>
              <p class="feature-description">Découvrez les initiatives écologiques près de chez vous avec notre carte interactive</p>
            </div>
            <div class="feature-card">
              <span class="feature-icon">💡</span>
              <h3 class="feature-title">Conseils Écologiques</h3>
              <p class="feature-description">Partagez vos astuces et découvrez des conseils pratiques pour réduire votre impact</p>
            </div>
            <div class="feature-card">
              <span class="feature-icon">💬</span>
              <h3 class="feature-title">Forum Collaboratif</h3>
              <p class="feature-description">Échangez avec la communauté et participez aux discussions sur l'environnement</p>
            </div>
            <div class="feature-card">
              <span class="feature-icon">📚</span>
              <h3 class="feature-title">Articles Engagés</h3>
              <p class="feature-description">Restez informé des dernières actualités écologiques et des solutions durables</p>
            </div>
          </div>

          <div class="cta-section">
            <a href="${process.env.NEXTAUTH_URL}/login" class="cta-button">
              <span>🚀</span>
              <span>Commencer l'exploration</span>
            </a>
          </div>

          <div class="role-info">
            <h3 class="role-title">Votre rôle : Explorateur</h3>
            <p class="role-description">
              En tant que nouvel <strong>Explorateur</strong>, vous pouvez dès maintenant parcourir tout le contenu de la plateforme. 
              Si vous souhaitez contribuer activement en créant du contenu, vous pouvez demander une promotion vers le rôle de <strong>Contributeur</strong> 
              depuis votre tableau de bord.
            </p>
          </div>
        </div>

        <div class="footer">
          <p class="footer-text">
            <span class="footer-brand">Merci de rejoindre notre mission pour un monde plus durable !</span> 🌱<br>
            <span class="footer-motto">L'équipe Pol-UX</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
