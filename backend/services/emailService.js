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
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        }
      };

      // Si pas de configuration SMTP valide, utiliser un service de test
      if (!process.env.SMTP_USER && !process.env.EMAIL_USER || 
          (!process.env.SMTP_PASS && !process.env.EMAIL_PASS) ||
          process.env.EMAIL_USER === 'votre-email@gmail.com') {
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
          .welcome-icon { margin-bottom: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="welcome-icon">
              <img src="https://pigeonfarm.com/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png" alt="Logo PigeonFarm" style="height: 60px; width: auto;">
            </div>
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
      const subject = 'Bienvenue sur PigeonFarm !';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Email de bienvenue envoyé à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      return false;
    }
  }

  // ========== NOTIFICATIONS ADMIN ==========

  // Générer template pour compte bloqué
  generateAccountBlockedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte bloqué - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚫 Compte bloqué</h1>
        </div>
        <div class="content">
          <div class="alert">
            <h3>⚠️ Votre compte a été bloqué</h3>
            <p>Bonjour ${user.full_name || user.username},</p>
            <p>Votre compte PigeonFarm a été temporairement bloqué par un administrateur.</p>
          </div>
          
          <h3>📋 Détails du compte :</h3>
          <ul>
            <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
            <li><strong>Email :</strong> ${user.email}</li>
            <li><strong>Date de blocage :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            <li><strong>Statut :</strong> Bloqué</li>
          </ul>

          <h3>🔍 Que faire maintenant ?</h3>
          <p>Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions :</p>
          <ul>
            <li>Contactez notre équipe support : contactpigeonfarm@gmail.com</li>
            <li>Expliquez votre situation et fournissez votre nom d'utilisateur</li>
            <li>Nous examinerons votre cas dans les plus brefs délais</li>
          </ul>
          
          <p>Nous nous excusons pour la gêne occasionnée.</p>
          
          <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement suite à une action administrative.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

⚠️ VOTRE COMPTE A ÉTÉ BLOQUÉ

Votre compte PigeonFarm a été temporairement bloqué par un administrateur.

📋 Détails du compte :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date de blocage : ${new Date().toLocaleDateString('fr-FR')}
- Statut : Bloqué

🔍 Que faire maintenant ?
Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions :
- Contactez notre équipe support : contactpigeonfarm@gmail.com
- Expliquez votre situation et fournissez votre nom d'utilisateur
- Nous examinerons votre cas dans les plus brefs délais

Nous nous excusons pour la gêne occasionnée.

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à une action administrative.
    `;

    return { html, text };
  }

  // Générer template pour compte débloqué
  generateAccountUnblockedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte débloqué - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Compte débloqué</h1>
        </div>
        <div class="content">
          <div class="success">
            <h3>🎉 Votre compte a été débloqué !</h3>
            <p>Bonjour ${user.full_name || user.username},</p>
            <p>Nous avons le plaisir de vous informer que votre compte PigeonFarm a été débloqué et est maintenant actif.</p>
          </div>
          
          <h3>📋 Détails du compte :</h3>
          <ul>
            <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
            <li><strong>Email :</strong> ${user.email}</li>
            <li><strong>Date de déblocage :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            <li><strong>Statut :</strong> Actif</li>
          </ul>

          <h3>🚀 Vous pouvez maintenant :</h3>
          <ul>
            <li>Vous connecter à votre compte</li>
            <li>Accéder à toutes les fonctionnalités</li>
            <li>Gérer votre élevage de pigeons</li>
            <li>Utiliser le tableau de bord</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Se connecter maintenant</a>
          </div>
          
          <p>Merci de votre compréhension et bienvenue de retour !</p>
          
          <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement suite à une action administrative.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

🎉 VOTRE COMPTE A ÉTÉ DÉBLOQUÉ !

Nous avons le plaisir de vous informer que votre compte PigeonFarm a été débloqué et est maintenant actif.

📋 Détails du compte :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date de déblocage : ${new Date().toLocaleDateString('fr-FR')}
- Statut : Actif

🚀 Vous pouvez maintenant :
- Vous connecter à votre compte
- Accéder à toutes les fonctionnalités
- Gérer votre élevage de pigeons
- Utiliser le tableau de bord

Se connecter maintenant : ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login

Merci de votre compréhension et bienvenue de retour !

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à une action administrative.
    `;

    return { html, text };
  }

  // Générer template pour compte supprimé
  generateAccountDeletedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte supprimé - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🗑️ Compte supprimé</h1>
        </div>
        <div class="content">
          <div class="info">
            <h3>ℹ️ Votre compte a été supprimé</h3>
            <p>Bonjour ${user.full_name || user.username},</p>
            <p>Nous vous informons que votre compte PigeonFarm a été définitivement supprimé de notre système.</p>
          </div>
          
          <h3>📋 Détails du compte supprimé :</h3>
          <ul>
            <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
            <li><strong>Email :</strong> ${user.email}</li>
            <li><strong>Date de suppression :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            <li><strong>Statut :</strong> Supprimé définitivement</li>
          </ul>

          <h3>📊 Données supprimées :</h3>
          <ul>
            <li>Profil utilisateur</li>
            <li>Données d'élevage (couples, œufs, pigeonneaux)</li>
            <li>Historique des ventes</li>
            <li>Enregistrements de santé</li>
            <li>Statistiques personnelles</li>
          </ul>

          <h3>🔄 Si vous souhaitez revenir :</h3>
          <p>Vous pouvez créer un nouveau compte à tout moment en vous rendant sur notre site :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/register" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Créer un nouveau compte</a>
          </div>
          
          <p>Merci d'avoir utilisé PigeonFarm.</p>
          
          <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement suite à une action administrative.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

ℹ️ VOTRE COMPTE A ÉTÉ SUPPRIMÉ

Nous vous informons que votre compte PigeonFarm a été définitivement supprimé de notre système.

📋 Détails du compte supprimé :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date de suppression : ${new Date().toLocaleDateString('fr-FR')}
- Statut : Supprimé définitivement

📊 Données supprimées :
- Profil utilisateur
- Données d'élevage (couples, œufs, pigeonneaux)
- Historique des ventes
- Enregistrements de santé
- Statistiques personnelles

🔄 Si vous souhaitez revenir :
Vous pouvez créer un nouveau compte à tout moment en vous rendant sur notre site :
${process.env.FRONTEND_URL || 'http://localhost:5174'}/register

Merci d'avoir utilisé PigeonFarm.

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à une action administrative.
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

  // ========== ALERTES SANTÉ ==========

  // Générer template pour alerte santé
  generateHealthAlertTemplate(alertText, userEmail) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Alerte Santé - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border: 2px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .alert-icon { font-size: 48px; margin-bottom: 15px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .urgent { background: #f8d7da; border: 2px solid #f5c6cb; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="alert-icon">🏥</div>
          <h1>Alerte Santé PigeonFarm</h1>
          <p>Action requise pour votre élevage</p>
        </div>
        <div class="content">
          <div class="alert-box urgent">
            <h2>⚠️ ALERTE IMPORTANTE</h2>
            <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">${alertText}</p>
          </div>
          
          <h3>📋 Détails de l'alerte :</h3>
          <ul>
            <li><strong>Type :</strong> Alerte Santé</li>
            <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
            <li><strong>Destinataire :</strong> ${userEmail}</li>
          </ul>

          <h3>🚨 Actions recommandées :</h3>
          <ul>
            <li>Vérifiez immédiatement l'état de vos pigeons</li>
            <li>Consultez votre tableau de bord pour plus de détails</li>
            <li>Enregistrez toute action entreprise dans le système</li>
            <li>Contactez un vétérinaire si nécessaire</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" class="button">Accéder au tableau de bord</a>
          </div>

          <h3>📞 Support d'urgence :</h3>
          <p>Si vous avez besoin d'aide immédiate :</p>
          <ul>
            <li><strong>Email :</strong> contactpigeonfarm@gmail.com</li>
            <li><strong>Téléphone :</strong> +223 83-78-40-98</li>
          </ul>
          
          <p><strong>Cette alerte a été générée automatiquement par le système PigeonFarm.</strong></p>
          
          <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement suite à une alerte santé détectée par le système.</p>
          <p>Pour désactiver ces alertes, modifiez vos préférences de notification dans votre profil.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
ALERTE SANTÉ PIGEONFARM 🏥

⚠️ ALERTE IMPORTANTE
${alertText}

📋 Détails de l'alerte :
- Type : Alerte Santé
- Date : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}
- Destinataire : ${userEmail}

🚨 Actions recommandées :
1. Vérifiez immédiatement l'état de vos pigeons
2. Consultez votre tableau de bord pour plus de détails
3. Enregistrez toute action entreprise dans le système
4. Contactez un vétérinaire si nécessaire

Accéder au tableau de bord : ${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard

📞 Support d'urgence :
- Email : contactpigeonfarm@gmail.com
- Téléphone : +223 83-78-40-98

Cette alerte a été générée automatiquement par le système PigeonFarm.

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à une alerte santé détectée par le système.
Pour désactiver ces alertes, modifiez vos préférences de notification dans votre profil.
    `;

    return { html, text };
  }

  // Envoyer alerte santé par email
  async sendHealthAlert(alertText, userEmail) {
    try {
      const templates = this.generateHealthAlertTemplate(alertText, userEmail);
      const subject = '🏥 Alerte Santé PigeonFarm - Action requise';
      
      await this.sendEmail(userEmail, subject, templates.text, templates.html);
      
      console.log(`📧 Alerte santé envoyée à ${userEmail}: ${alertText}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte santé:', error);
      return false;
    }
  }

  // ========== NOTIFICATIONS DE MOT DE PASSE ==========

  // Template pour changement de mot de passe
  generatePasswordChangedTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Mot de passe modifié - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔑 Mot de passe modifié</h1>
        </div>
        <div class="content">
          <div class="success">
            <h3>✅ Votre mot de passe a été modifié avec succès</h3>
            <p>Bonjour ${user.full_name || user.username},</p>
            <p>Nous vous confirmons que votre mot de passe a été modifié avec succès pour votre compte PigeonFarm.</p>
          </div>
          
          <h3>📋 Détails de la modification :</h3>
          <ul>
            <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
            <li><strong>Email :</strong> ${user.email}</li>
            <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
          </ul>

          <div class="warning">
            <h3>⚠️ Sécurité</h3>
            <p>Si vous n'avez pas effectué cette modification, veuillez :</p>
            <ul>
              <li>Contactez immédiatement notre support</li>
              <li>Changer votre mot de passe immédiatement</li>
              <li>Vérifier l'activité récente de votre compte</li>
            </ul>
          </div>

          <h3>📞 Support</h3>
          <p>Pour toute question ou assistance :</p>
          <ul>
            <li><strong>Email :</strong> contactpigeonfarm@gmail.com</li>
            <li><strong>Téléphone :</strong> +223 83-78-40-98</li>
          </ul>
          
          <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement suite à une modification de mot de passe.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

✅ VOTRE MOT DE PASSE A ÉTÉ MODIFIÉ AVEC SUCCÈS

Nous vous confirmons que votre mot de passe a été modifié avec succès pour votre compte PigeonFarm.

📋 Détails de la modification :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}

⚠️ SÉCURITÉ
Si vous n'avez pas effectué cette modification, veuillez :
- Contactez immédiatement notre support
- Changer votre mot de passe immédiatement
- Vérifier l'activité récente de votre compte

📞 Support :
- Email : contactpigeonfarm@gmail.com
- Téléphone : +223 83-78-40-98

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à une modification de mot de passe.
    `;

    return { html, text };
  }

  // Envoyer notification de changement de mot de passe
  async sendPasswordChangedNotification(user) {
    try {
      const templates = this.generatePasswordChangedTemplate(user);
      const subject = '🔑 Votre mot de passe PigeonFarm a été modifié';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Notification de changement de mot de passe envoyée à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de changement de mot de passe:', error);
      return false;
    }
  }

  // Template pour suppression de compte utilisateur
  generateAccountDeletedByUserTemplate(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte supprimé - PigeonFarm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6c757d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🗑️ Compte supprimé</h1>
        </div>
        <div class="content">
          <div class="info">
            <h3>ℹ️ Votre compte a été supprimé</h3>
            <p>Bonjour ${user.full_name || user.username},</p>
            <p>Nous vous informons que votre compte PigeonFarm a été définitivement supprimé.</p>
          </div>
          
          <h3>📋 Détails du compte supprimé :</h3>
          <ul>
            <li><strong>Nom d'utilisateur :</strong> ${user.username}</li>
            <li><strong>Email :</strong> ${user.email}</li>
            <li><strong>Date de suppression :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
          </ul>

          <h3>📊 Données supprimées :</h3>
          <ul>
            <li>Profil utilisateur</li>
            <li>Données d'élevage (couples, œufs, pigeonneaux)</li>
            <li>Historique des ventes</li>
            <li>Enregistrements de santé</li>
            <li>Statistiques personnelles</li>
          </ul>

          <h3>🔄 Si vous souhaitez revenir :</h3>
          <p>Vous pouvez créer un nouveau compte à tout moment en vous rendant sur notre site.</p>
          
          <p>Merci d'avoir utilisé PigeonFarm.</p>
          
          <p>Cordialement,<br><strong>L'équipe PigeonFarm</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement suite à la suppression de votre compte.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour ${user.full_name || user.username},

ℹ️ VOTRE COMPTE A ÉTÉ SUPPRIMÉ

Nous vous informons que votre compte PigeonFarm a été définitivement supprimé.

📋 Détails du compte supprimé :
- Nom d'utilisateur : ${user.username}
- Email : ${user.email}
- Date de suppression : ${new Date().toLocaleDateString('fr-FR')}
- Heure : ${new Date().toLocaleTimeString('fr-FR')}

📊 Données supprimées :
- Profil utilisateur
- Données d'élevage (couples, œufs, pigeonneaux)
- Historique des ventes
- Enregistrements de santé
- Statistiques personnelles

🔄 Si vous souhaitez revenir :
Vous pouvez créer un nouveau compte à tout moment en vous rendant sur notre site.

Merci d'avoir utilisé PigeonFarm.

Cordialement,
L'équipe PigeonFarm

---
Cet email a été envoyé automatiquement suite à la suppression de votre compte.
    `;

    return { html, text };
  }

  // Envoyer notification de suppression de compte par l'utilisateur
  async sendAccountDeletedByUserNotification(user) {
    try {
      const templates = this.generateAccountDeletedByUserTemplate(user);
      const subject = '🗑️ Votre compte PigeonFarm a été supprimé';
      
      await this.sendEmail(user.email, subject, templates.text, templates.html);
      
      console.log(`📧 Notification de suppression de compte envoyée à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de suppression de compte:', error);
      return false;
    }
  }
}

module.exports = EmailService;