import express from 'express';
import pool from '../config/database.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Middleware pour les headers CORS spécifiques à Edge
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  
  // Headers spécifiques pour Edge
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Route de test PDF simple
router.get('/test-pdf', async (req, res) => {
  try {
    console.log('🧪 Test PDF simple...');
    
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    
    doc.pipe(res);
    
    doc.fontSize(24).text('Test PDF', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(16).text('Ceci est un test de génération PDF', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(12).text(`Généré le: ${new Date().toLocaleString()}`);
    
    doc.end();
    console.log('✅ Test PDF généré avec succès');
  } catch (err) {
    console.error('❌ Erreur test PDF:', err);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Erreur test PDF',
      details: err.message 
    });
  }
});

// Route de test pour diagnostiquer les problèmes
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Test route appelée');
    console.log('👤 Utilisateur:', req.user);
    console.log('📋 Headers:', req.headers);
    
    res.json({ 
      message: 'Route de test fonctionnelle',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erreur route test:', err);
    res.status(500).json({ 
      error: 'Erreur route test',
      details: err.message 
    });
  }
});

// Nouvelle route d'export PDF pour les statistiques
router.get('/statistics/pdf', async (req, res) => {
  try {
    console.log('📊 Début génération PDF statistiques');
    console.log('👤 Utilisateur:', req.user);
    
    // Récupérer les statistiques globales
    console.log('🔍 Récupération des statistiques...');
    
    const userId = req.user.id;
    // Couples
    const [[{ totalCouples }]] = await pool.query('SELECT COUNT(*) as totalCouples FROM couples WHERE userId = ?', [userId]);
    const [[{ activeCouples }]] = await pool.query("SELECT COUNT(*) as activeCouples FROM couples WHERE status = 'active' AND userId = ?", [userId]);
    const [[{ totalPigeonneaux }]] = await pool.query('SELECT COUNT(*) as totalPigeonneaux FROM pigeonneaux WHERE userId = ?', [userId]);
    const [[{ alivePigeonneaux }]] = await pool.query("SELECT COUNT(*) as alivePigeonneaux FROM pigeonneaux WHERE status = 'alive' AND userId = ?", [userId]);
    const [[{ soldPigeonneaux }]] = await pool.query("SELECT COUNT(*) as soldPigeonneaux FROM pigeonneaux WHERE status = 'sold' AND userId = ?", [userId]);
    const [[{ totalEggs }]] = await pool.query('SELECT COUNT(*) as totalEggs FROM eggs WHERE userId = ?', [userId]);
    const [[{ successfulEggs }]] = await pool.query('SELECT SUM(success1) + SUM(success2) as successfulEggs FROM eggs WHERE userId = ?', [userId]);
    const [[{ totalEggsLaid }]] = await pool.query('SELECT SUM(1 + IF(egg2Date IS NOT NULL, 1, 0)) as totalEggsLaid FROM eggs WHERE userId = ?', [userId]);
    const hatchingRate = totalEggsLaid > 0 ? ((successfulEggs / totalEggsLaid) * 100).toFixed(1) : '0';
    const [[{ totalHealthRecords }]] = await pool.query('SELECT COUNT(*) as totalHealthRecords FROM healthRecords WHERE userId = ?', [userId]);
    const [[{ pigeonneauxRevenue }]] = await pool.query("SELECT IFNULL(SUM(salePrice),0) as pigeonneauxRevenue FROM pigeonneaux WHERE status = 'sold' AND userId = ?", [userId]);
    const [[{ manualSalesRevenue }]] = await pool.query("SELECT IFNULL(SUM(amount),0) as manualSalesRevenue FROM sales WHERE userId = ?", [userId]);
    const totalRevenue = Number(pigeonneauxRevenue) + Number(manualSalesRevenue);
    
    console.log('✅ Couples totaux:', totalCouples);
    console.log('✅ Couples actifs:', activeCouples);
    console.log('✅ Pigeonneaux totaux:', totalPigeonneaux);
    console.log('✅ Pigeonneaux vivants:', alivePigeonneaux);
    console.log('✅ Pigeonneaux vendus:', soldPigeonneaux);
    console.log('✅ Œufs totaux:', totalEggs);
    console.log('✅ Œufs réussis:', successfulEggs);
    console.log('✅ Œufs pondus:', totalEggsLaid);
    console.log('✅ Taux d\'éclosion:', hatchingRate);
    console.log('✅ Interventions sanitaires:', totalHealthRecords);
    console.log('✅ Revenus totaux:', totalRevenue);
    
    console.log('📄 Création du document PDF...');
    // Préparer le PDF
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4',
      info: {
        Title: 'PigeonFarm - Statistiques',
        Author: 'PigeonFarm System',
        Subject: 'Rapport statistiques',
        Keywords: 'pigeons, statistiques, rapport',
        CreationDate: new Date()
      }
    });
    
    // Headers pour Edge
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="statistiques_pigeonfarm.pdf"');
    
    console.log('🔗 Connexion du PDF au stream de réponse...');
    doc.pipe(res);
    
    // En-tête professionnel
    console.log('✍️ Création de l\'en-tête...');
    
    // Ligne de titre
    doc.moveTo(0, 80)
       .lineTo(doc.page.width, 80)
       .strokeColor('#2c3e50')
       .lineWidth(3)
       .stroke();
    
    // Titre principal
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('PIGEONFARM', { align: 'center', y: 30 });
    
    // Sous-titre
    doc.fontSize(16)
       .font('Helvetica')
       .fill('#7f8c8d')
       .text('Rapport Statistiques Générales', { align: 'center', y: 65 });
    
    // Date de génération
    doc.fontSize(10)
       .fill('#95a5a6')
       .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
             { align: 'center', y: 100 });
    
    // Tableau des statistiques
    console.log('📊 Ajout des statistiques...');
    const stats = [
      { label: 'Couples Actifs', value: `${activeCouples}/${totalCouples}`, category: 'Population' },
      { label: 'Pigeonneaux Vivants', value: alivePigeonneaux, category: 'Population' },
      { label: 'Pigeonneaux Vendus', value: soldPigeonneaux, category: 'Commercial' },
      { label: 'Œufs Pondus', value: totalEggs, category: 'Production' },
      { label: "Taux d'Éclosion", value: `${hatchingRate}%`, category: 'Performance' },
      { label: "Chiffre d'Affaires", value: `${totalRevenue.toLocaleString()} XOF`, category: 'Commercial' },
      { label: 'Interventions Sanitaires', value: totalHealthRecords, category: 'Santé' },
      { label: 'Pigeonneaux Nés', value: totalPigeonneaux, category: 'Production' }
    ];
    
    // En-tête du tableau
    let yPos = 130;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('Indicateur', 50, yPos)
       .text('Valeur', 300, yPos)
       .text('Catégorie', 450, yPos);
    
    // Ligne de séparation
    yPos += 20;
    doc.moveTo(50, yPos)
       .lineTo(550, yPos)
       .strokeColor('#bdc3c7')
       .lineWidth(1)
       .stroke();
    
    yPos += 10;
    
    // Lignes du tableau
    stats.forEach((stat, index) => {
      // Fond alterné
      const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.rect(50, yPos - 5, 500, 25)
         .fill(bgColor);
      
      // Contenu
      doc.fontSize(11)
         .font('Helvetica')
         .fill('#2c3e50')
         .text(stat.label, 55, yPos, { width: 240 });
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fill('#34495e')
         .text(stat.value.toString(), 305, yPos, { width: 140 });
      
      doc.fontSize(10)
         .font('Helvetica')
         .fill('#7f8c8d')
         .text(stat.category, 455, yPos, { width: 90 });
      
      yPos += 30;
      
      // Vérifier si on doit passer à la page suivante
      if (yPos > doc.page.height - 100) {
        doc.addPage();
        yPos = 50;
      }
    });
    
    // Résumé par catégorie
    yPos += 20;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('Résumé par Catégorie', 50, yPos);
    
    yPos += 25;
    
    const categories = {};
    stats.forEach(stat => {
      if (!categories[stat.category]) {
        categories[stat.category] = [];
      }
      categories[stat.category].push(stat);
    });
    
    Object.entries(categories).forEach(([category, categoryStats]) => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fill('#34495e')
         .text(category, 50, yPos);
      
      yPos += 20;
      
      categoryStats.forEach(stat => {
        doc.fontSize(10)
           .font('Helvetica')
           .fill('#7f8c8d')
           .text(`• ${stat.label}: ${stat.value}`, 70, yPos);
        yPos += 15;
      });
      
      yPos += 10;
      
      if (yPos > doc.page.height - 100) {
        doc.addPage();
        yPos = 50;
      }
    });
    
    // Pied de page
    const footerY = doc.page.height - 50;
    doc.moveTo(50, footerY)
       .lineTo(doc.page.width - 50, footerY)
       .strokeColor('#bdc3c7')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(9)
       .fill('#95a5a6')
       .text('PigeonFarm - Système de gestion avicole', { align: 'center', y: footerY + 10 });
    
    doc.fontSize(8)
       .text('Document généré automatiquement', { align: 'center', y: footerY + 25 });
    
    console.log('✅ Finalisation du PDF...');
    doc.end();
    console.log('✅ PDF généré avec succès');
  } catch (err) {
    console.error('❌ Erreur export PDF:', err);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du PDF',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export PDF Suivi Sanitaire
router.get('/health/pdf', async (req, res) => {
  try {
    console.log('🏥 Début génération PDF suivi sanitaire');
    console.log('👤 Utilisateur:', req.user);
    
    const userId = req.user.id;
    console.log('🔍 Récupération des données sanitaires...');
    const [healthRecords] = await pool.query('SELECT * FROM healthRecords WHERE userId = ? ORDER BY date DESC', [userId]);
    console.log('✅ Enregistrements sanitaires récupérés:', healthRecords.length);
    
    console.log('📄 Création du document PDF...');
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4',
      info: {
        Title: 'PigeonFarm - Suivi Sanitaire',
        Author: 'PigeonFarm System',
        Subject: 'Rapport suivi sanitaire',
        Keywords: 'pigeons, santé, suivi, rapport',
        CreationDate: new Date()
      }
    });
    
    // Headers pour Edge
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="suivi_sanitaire_pigeonfarm.pdf"');
    
    console.log('🔗 Connexion du PDF au stream de réponse...');
    doc.pipe(res);
    
    // En-tête professionnel
    console.log('✍️ Création de l\'en-tête...');
    
    // Ligne de titre
    doc.moveTo(0, 80)
       .lineTo(doc.page.width, 80)
       .strokeColor('#2c3e50')
       .lineWidth(3)
       .stroke();
    
    // Titre principal
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('PIGEONFARM', { align: 'center', y: 30 });
    
    // Sous-titre
    doc.fontSize(16)
       .font('Helvetica')
       .fill('#7f8c8d')
       .text('Rapport Suivi Sanitaire', { align: 'center', y: 65 });
    
    // Date de génération
    doc.fontSize(10)
       .fill('#95a5a6')
       .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
             { align: 'center', y: 100 });
    
    // Résumé en haut
    console.log('📋 Ajout du résumé...');
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text(`Nombre total d'interventions: ${healthRecords.length}`, 50, 130);
    
    // Statistiques par type
    const typeStats = {};
    healthRecords.forEach(record => {
      typeStats[record.type] = (typeStats[record.type] || 0) + 1;
    });
    
    let yPos = 160;
    Object.entries(typeStats).forEach(([type, count]) => {
      const typeLabel = type === 'vaccination' ? 'Vaccinations' : 
                       type === 'treatment' ? 'Traitements' : 'Prophylaxies';
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fill('#34495e')
         .text(`${typeLabel}: ${count}`, 50, yPos);
      yPos += 20;
    });
    
    // Tableau des interventions
    console.log('📊 Création du tableau...');
    if (healthRecords.length > 0) {
      yPos += 20;
      
      // En-tête du tableau
      const tableHeaders = ['Type', 'Cible', 'Produit', 'Date', 'Prochaine échéance'];
      const colWidths = [80, 100, 120, 80, 100];
      const startX = 50;
      
      // Fond de l'en-tête
      doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b), 30)
         .fill('#34495e');
      
      // Texte des en-têtes
      let xPos = startX;
      tableHeaders.forEach((header, index) => {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fill('#ffffff')
           .text(header, xPos + 5, yPos + 10, { width: colWidths[index] - 10 });
        xPos += colWidths[index];
      });
      
      yPos += 35;
      
      // Lignes du tableau
      healthRecords.forEach((record, index) => {
        // Vérifier si on doit passer à la page suivante
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        }
        
        // Fond alterné des lignes
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b), 25)
           .fill(bgColor);
        
        // Bordure de la ligne
        doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b), 25)
           .strokeColor('#bdc3c7')
           .lineWidth(0.5)
           .stroke();
        
        // Contenu des cellules
        xPos = startX;
        
        // Type
        const typeLabel = record.type === 'vaccination' ? 'Vaccination' : 
                         record.type === 'treatment' ? 'Traitement' : 'Prophylaxie';
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fill('#2c3e50')
           .text(typeLabel, xPos + 5, yPos + 8, { width: colWidths[0] - 10 });
        xPos += colWidths[0];
        
        // Cible
        const targetLabel = record.targetType === 'all' ? 'Tous' : 
                           record.targetType === 'couple' ? `Couple #${record.targetId}` : 
                           `Pigeonneau #${record.targetId}`;
        doc.fontSize(9)
           .fill('#34495e')
           .text(targetLabel, xPos + 5, yPos + 8, { width: colWidths[1] - 10 });
        xPos += colWidths[1];
        
        // Produit
        doc.fontSize(9)
           .fill('#34495e')
           .text(record.product || 'Non spécifié', xPos + 5, yPos + 8, { width: colWidths[2] - 10 });
        xPos += colWidths[2];
        
        // Date
        const dateLabel = record.date ? String(record.date).slice(0, 10) : 'Non spécifiée';
        doc.fontSize(9)
           .fill('#34495e')
           .text(dateLabel, xPos + 5, yPos + 8, { width: colWidths[3] - 10 });
        xPos += colWidths[3];
        
        // Prochaine échéance
        const nextDueLabel = record.nextDue ? String(record.nextDue).slice(0, 10) : 'Non définie';
        doc.fontSize(9)
           .fill('#34495e')
           .text(nextDueLabel, xPos + 5, yPos + 8, { width: colWidths[4] - 10 });
        
        yPos += 30;
      });
      
      // Observations en bas du tableau
      if (yPos > doc.page.height - 150) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fill('#2c3e50')
         .text('Observations détaillées:', 50, yPos);
      
      yPos += 25;
      
      healthRecords.forEach((record, index) => {
        if (record.observations) {
          if (yPos > doc.page.height - 100) {
            doc.addPage();
            yPos = 50;
          }
          
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fill('#34495e')
             .text(`Intervention #${record.id}:`, 50, yPos);
          
          yPos += 15;
          
          doc.fontSize(9)
             .fill('#7f8c8d')
             .text(record.observations, 70, yPos, { width: doc.page.width - 140 });
          
          yPos += 20;
        }
      });
    } else {
      doc.fontSize(14)
         .fill('#7f8c8d')
         .text('Aucune intervention sanitaire enregistrée.', 50, yPos);
    }
    
    // Pied de page
    const footerY = doc.page.height - 50;
    doc.moveTo(50, footerY)
       .lineTo(doc.page.width - 50, footerY)
       .strokeColor('#bdc3c7')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(9)
       .fill('#95a5a6')
       .text('PigeonFarm - Système de gestion avicole', { align: 'center', y: footerY + 10 });
    
    doc.fontSize(8)
       .text('Document généré automatiquement', { align: 'center', y: footerY + 25 });
    
    console.log('✅ Finalisation du PDF...');
    doc.end();
    console.log('✅ PDF suivi sanitaire généré avec succès');
  } catch (err) {
    console.error('❌ Erreur export PDF Suivi Sanitaire:', err);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du PDF',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 