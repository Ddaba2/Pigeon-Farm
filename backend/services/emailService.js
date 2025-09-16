const nodemailer = require('nodemailer');
const { config } = require('../config/config.js');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialiser le transporteur email
  initializeTransporter() {
    try {
      // Configuration pour différents fournisseurs d'email
      const emailConfig = {
        // Configuration SMTP générique
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true pour 465, false pour autres ports
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER || 'dabadiallo694@gmail.com',
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'pabu boof fjwe jntw'
        }
      };

      // Si pas de configuration SMTP, utiliser un service de test
      if (!(process.env.SMTP_USER || process.env.EMAIL_USER) || !(process.env.SMTP_PASS || process.env.EMAIL_PASS)) {
        console.log('⚠️ Configuration SMTP manquante, utilisation du mode test');
        // Mode test - les emails seront affichés dans la console
        this.transporter = {
          sendMail: (options) => {
            console.log('📧 EMAIL TEST - Pas d\'envoi réel:');
            console.log('   À:', options.to);
            console.log('   Sujet:', options.subject);
            console.log('   Contenu:', options.text || options.html);
            console.log('   ---');
            
            return Promise.resolve({
              messageId: 'test-' + Date.now(),
              accepted: [options.to],
              rejected: []
            });
          }
        };
      } else {
        this.transporter = nodemailer.createTransport(emailConfig);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service email:', error);
      this.transporter = null;
    }
  }

  // Envoyer un email
  async sendEmail(to, subject, text, html = null) {
    try {
      if (!this.transporter) {
        throw new Error('Service email non initialisé');
      }

      const mailOptions = {
        from: `"PigeonFarm" <${process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@pigeonfarm.com'}>`,
        to: to,
        subject: subject,
        text: text,
        html: html || text.replace(/\n/g, '<br>')
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email envoyé avec succès:', result.messageId);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  // Template pour compte bloqué
  generateAccountBlockedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte bloqué - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Compte bloqué</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${user.full_name || user.username},</h2>
            <p>Nous vous informons que votre compte PigeonFarm a été temporairement bloqué par un administrateur.</p>
            
            <h3>Détails :</h3>
            <ul>
              <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
              <li><strong>Email :</strong> ${user.email}</li>
              <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
              <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
            </ul>

            <p>Pour plus d'informations ou pour contester cette décision, veuillez contacter l'équipe d'administration :</p>
            <ul>
              <li><strong>Email :</strong> contactpigeonfarm@gmail.com</li>
              <li><strong>Téléphone :</strong> +223 83-78-40-98</li>
            </ul>
            
            <p>Cordialement,<br>L'équipe PigeonFarm</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par le système PigeonFarm.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

Nous vous informons que votre compte PigeonFarm a été temporairement bloqué par un administrateur.

Détails :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}

Pour plus d'informations ou pour contester cette décision, veuillez contacter l'équipe d'administration :
- Email : contactpigeonfarm@gmail.com
- Téléphone : +223 83-78-40-98

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement par le système PigeonFarm.
    `;

    return { html, text };
  }

  // Template pour compte débloqué
  generateAccountUnblockedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte débloqué - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Compte débloqué</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${user.full_name || user.username},</h2>
            <p>Nous avons le plaisir de vous informer que votre compte PigeonFarm a été débloqué et que vous pouvez à nouveau accéder à toutes les fonctionnalités.</p>
            
            <h3>Détails :</h3>
            <ul>
              <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
              <li><strong>Email :</strong> ${user.email}</li>
              <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
              <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
            </ul>

            <p>Vous pouvez maintenant vous connecter normalement à votre compte.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">Se connecter</a>
            </div>
            
            <p>Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à nous contacter :</p>
            <ul>
              <li><strong>Email :</strong> contactpigeonfarm@gmail.com</li>
              <li><strong>Téléphone :</strong> +223 83-78-40-98</li>
            </ul>
            
            <p>Cordialement,<br>L'équipe PigeonFarm</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par le système PigeonFarm.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

Nous avons le plaisir de vous informer que votre compte PigeonFarm a été débloqué et que vous pouvez à nouveau accéder à toutes les fonctionnalités.

Détails :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}

Vous pouvez maintenant vous connecter normalement à votre compte.

Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à nous contacter :
- Email : contactpigeonfarm@gmail.com
- Téléphone : +223 83-78-40-98

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement par le système PigeonFarm.
    `;

    return { html, text };
  }

  // Template pour compte supprimé
  generateAccountDeletedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte supprimé - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗑️ Compte supprimé</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${user.full_name || user.username},</h2>
            <p>Nous vous informons que votre compte PigeonFarm a été définitivement supprimé par un administrateur.</p>
            
            <h3>Détails :</h3>
            <ul>
              <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
              <li><strong>Email :</strong> ${user.email}</li>
              <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
              <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
            </ul>

            <p><strong>Important :</strong> Toutes vos données ont été supprimées de manière permanente et ne peuvent plus être récupérées.</p>

            <p>Si vous souhaitez créer un nouveau compte à l'avenir, vous pouvez vous inscrire à nouveau sur notre plateforme.</p>
            
            <p>Pour toute question ou assistance, vous pouvez nous contacter :</p>
            <ul>
              <li><strong>Email :</strong> contactpigeonfarm@gmail.com</li>
              <li><strong>Téléphone :</strong> +223 83-78-40-98</li>
            </ul>
            
            <p>Cordialement,<br>L'équipe PigeonFarm</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par le système PigeonFarm.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

Nous vous informons que votre compte PigeonFarm a été définitivement supprimé par un administrateur.

Détails :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}

Important : Toutes vos données ont été supprimées de manière permanente et ne peuvent plus être récupérées.

Si vous souhaitez créer un nouveau compte à l'avenir, vous pouvez vous inscrire à nouveau sur notre plateforme.

Pour toute question ou assistance, vous pouvez nous contacter :
- Email : contactpigeonfarm@gmail.com
- Téléphone : +223 83-78-40-98

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement par le système PigeonFarm.
    `;

    return { html, text };
  }

  // Envoyer notification de compte bloqué
  async sendAccountBlockedNotification(user) {
    try {
      const templates = this.generateAccountBlockedTemplate(user);
      const subject = '🚫 Votre compte PigeonFarm a été bloqué';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Notification de blocage envoyée à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de blocage:', error);
      return false;
    }
  }

  // Envoyer notification de compte débloqué
  async sendAccountUnblockedNotification(user) {
    try {
      const templates = this.generateAccountUnblockedTemplate(user);
      const subject = '✅ Votre compte PigeonFarm a été débloqué';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Notification de déblocage envoyée à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de déblocage:', error);
      return false;
    }
  }

  // Envoyer notification de compte supprimé
  async sendAccountDeletedNotification(user) {
    try {
      const templates = this.generateAccountDeletedTemplate(user);
      const subject = '🗑️ Votre compte PigeonFarm a été supprimé';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Notification de suppression envoyée à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de suppression:', error);
      return false;
    }
  }

  // Template pour email de bienvenue
  generateWelcomeTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background-color: #e9ecef; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .feature { margin: 20px 0; padding: 15px; background-color: white; border-radius: 8px; border-left: 4px solid #667eea; }
          .welcome-icon { font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="welcome-icon">🐦</div>
            <h1>Bienvenue sur PigeonFarm !</h1>
            <p>Votre aventure commence maintenant</p>
          </div>
          <div class="content">
            <h2>Bonjour ${user.full_name || user.username},</h2>
            <p>Nous sommes ravis de vous accueillir dans la communauté PigeonFarm ! Votre compte a été créé avec succès.</p>
            
            <h3>🎉 Votre compte est maintenant actif</h3>
            <ul>
              <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
              <li><strong>Email :</strong> ${user.email}</li>
              <li><strong>Date d'inscription :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
              <li><strong>Statut :</strong> Actif</li>
            </ul>

            <div class="feature">
              <h4>🚀 Découvrez nos fonctionnalités</h4>
              <p>Gérez vos pigeons, suivez leur reproduction, enregistrez les œufs et pigeonneaux, et bien plus encore !</p>
            </div>

            <div class="feature">
              <h4>📊 Tableau de bord complet</h4>
              <p>Accédez à vos statistiques, suivez l'évolution de votre élevage et analysez vos performances.</p>
            </div>

            <div class="feature">
              <h4>🔔 Notifications intelligentes</h4>
              <p>Recevez des alertes pour la santé de vos pigeons, les éclosions et les événements importants.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">Commencer maintenant</a>
            </div>

            <h3>💡 Conseils pour bien commencer :</h3>
            <ul>
              <li>Complétez votre profil avec vos informations personnelles</li>
              <li>Ajoutez vos premiers couples de pigeons</li>
              <li>Explorez le tableau de bord pour vous familiariser</li>
              <li>Consultez l'aide en cas de questions</li>
            </ul>
            
            <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Notre équipe est là pour vous accompagner !</p>
            
            <p>Bienvenue dans la famille PigeonFarm !<br><strong>L'équipe PigeonFarm</strong></p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement après votre inscription sur PigeonFarm.</p>
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

Bienvenue sur PigeonFarm ! 🐦

Nous sommes ravis de vous accueillir dans notre communauté. Votre compte a été créé avec succès.

🎉 Votre compte est maintenant actif :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date d'inscription : ${new Date().toLocaleDateString('fr-FR')}
- Statut : Actif

🚀 Découvrez nos fonctionnalités :
- Gérez vos pigeons et leur reproduction
- Enregistrez les œufs et pigeonneaux
- Suivez la santé de vos animaux
- Analysez vos performances avec des statistiques détaillées

💡 Conseils pour bien commencer :
1. Complétez votre profil avec vos informations personnelles
2. Ajoutez vos premiers couples de pigeons
3. Explorez le tableau de bord pour vous familiariser
4. Consultez l'aide en cas de questions

Commencer maintenant : ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login

Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.

Bienvenue dans la famille PigeonFarm !

L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement après votre inscription sur PigeonFarm.
Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
    `;

    return { html, text };
  }

  // Envoyer email de bienvenue
  async sendWelcomeEmail(user) {
    try {
      const templates = this.generateWelcomeTemplate(user);
      const subject = '🐦 Bienvenue sur PigeonFarm !';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Email de bienvenue envoyé à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      return false;
    }
  }
}

module.exports = EmailService;