import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: string[];
  filename: string;
  logo?: string;
}

export class PDFExporter {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // Ajouter le logo de l'application
  private async addLogo() {
    try {
      // Charger le logo depuis le dossier public
      const logoUrl = '/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png';
      
      // Créer un élément image pour obtenir les dimensions
      const img = new Image();
      img.src = logoUrl;
      
      await new Promise((resolve) => {
        img.onload = () => {
          // Centrer le logo horizontalement
          const pageWidth = this.doc.internal.pageSize.width;
          const maxHeight = 50;
          const aspectRatio = img.width / img.height;
          const logoWidth = maxHeight * aspectRatio;
          const logoHeight = maxHeight;
          const logoX = (pageWidth - logoWidth) / 2;
          
          // Ajouter le logo centré
          this.doc.addImage(img, 'PNG', logoX, 20, logoWidth, logoHeight);
          
          // Ajouter le texte centré sous le logo
          this.doc.setFontSize(28);
          this.doc.setTextColor(34, 139, 34); // Vert
          this.doc.text('PigeonFarm', pageWidth / 2, 85, { align: 'center' });
          
          this.doc.setFontSize(14);
          this.doc.setTextColor(100, 100, 100);
          this.doc.text('Gestion d\'élevage de pigeons', pageWidth / 2, 95, { align: 'center' });
          
          resolve(true);
        };
        img.onerror = () => {
          // Fallback si le logo ne charge pas
          const pageWidth = this.doc.internal.pageSize.width;
          this.doc.setFontSize(28);
          this.doc.setTextColor(34, 139, 34);
          this.doc.text('PigeonFarm', pageWidth / 2, 50, { align: 'center' });
          this.doc.setFontSize(14);
          this.doc.setTextColor(100, 100, 100);
          this.doc.text('Gestion d\'élevage de pigeons', pageWidth / 2, 60, { align: 'center' });
          resolve(true);
        };
      });
    } catch (error) {
      // Fallback en cas d'erreur
      const pageWidth = this.doc.internal.pageSize.width;
      this.doc.setFontSize(28);
      this.doc.setTextColor(34, 139, 34);
      this.doc.text('PigeonFarm', pageWidth / 2, 50, { align: 'center' });
      this.doc.setFontSize(14);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Gestion d\'élevage de pigeons', pageWidth / 2, 60, { align: 'center' });
    }
  }

  // Ajouter l'en-tête avec titre et date
  private async addHeader(title: string, subtitle?: string) {
    await this.addLogo();
    
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Ligne de séparation
    this.doc.setDrawColor(34, 139, 34);
    this.doc.setLineWidth(1);
    this.doc.line(20, 100, pageWidth - 20, 100);
    
    // Titre principal centré
    this.doc.setFontSize(22);
    this.doc.setTextColor(34, 139, 34);
    this.doc.text(title, pageWidth / 2, 120, { align: 'center' });
    
    // Date de génération centrée
    this.doc.setFontSize(12);
    this.doc.setTextColor(150, 150, 150);
    const dateText = `Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    this.doc.text(dateText, pageWidth / 2, 135, { align: 'center' });
  }

  // Exporter un tableau de données
  async exportTable(options: PDFExportOptions) {
    this.doc = new jsPDF();
    
    await this.addHeader(options.title, options.subtitle);
    
    // Préparer les données pour le tableau
    const tableData = options.data.map(item => 
      options.columns.map(col => item[col] || '')
    );
    
    // Ajouter le tableau
    autoTable(this.doc, {
      startY: 170,
      head: [options.columns],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' }
      }
    });
    
    // Ajouter le pied de page
    this.addFooter();
    
    // Sauvegarder le PDF
    this.doc.save(`${options.filename}.pdf`);
  }

  // Ajouter le pied de page
  private addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    const footerY = pageHeight - 20;
    
    // Ligne de séparation
    this.doc.setDrawColor(34, 139, 34);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, footerY - 5, 190, footerY - 5);
    
    // Texte du pied de page
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('PigeonFarm - Système de gestion d\'élevage de pigeons', 20, footerY);
    this.doc.text(`Page ${this.doc.internal.getCurrentPageInfo().pageNumber}`, 190, footerY, { align: 'right' });
  }

  // Exporter les statistiques
  async exportStatistics(stats: any, sales: any[]) {
    this.doc = new jsPDF();
    
    await this.addHeader('Rapport Statistiques PigeonFarm');
    
    let yPosition = 150;
    
    // Statistiques générales avec design amélioré
    this.doc.setFontSize(16);
    this.doc.setTextColor(34, 139, 34);
    this.doc.text('Statistiques Generales', 20, yPosition);
    
    // Bordure autour des statistiques
    this.doc.setDrawColor(34, 139, 34);
    this.doc.setLineWidth(0.5);
    this.doc.rect(15, yPosition - 15, 180, 50);
    
    yPosition += 20;
    
    // Créer des boîtes pour les statistiques
    const statsData = [
      { label: 'Couples', value: stats.couples?.total || 0 },
      { label: 'Oeufs', value: stats.eggs?.total || 0 },
      { label: 'Pigeonneaux', value: stats.pigeonneaux?.total || 0 },
      { label: 'Enregistrements de sante', value: stats.health?.total || 0 },
      { label: 'Ventes', value: stats.sales?.total || 0 },
      { label: 'Revenus totaux', value: `${(stats.sales?.totalRevenue || 0).toLocaleString('fr-FR')} XOF` }
    ];
    
    // Afficher les statistiques en 2 colonnes
    let col = 0;
    for (let i = 0; i < statsData.length; i++) {
      const x = col === 0 ? 20 : 110;
      const stat = statsData[i];
      
      this.doc.setFontSize(11);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`${stat.label}: ${stat.value}`, x, yPosition);
      
      if (col === 1) {
        yPosition += 12;
        col = 0;
      } else {
        col = 1;
      }
    }
    
    yPosition += 15;
    
    // Tableau des ventes récentes
    if (sales.length > 0) {
      this.doc.setFontSize(16);
      this.doc.setTextColor(34, 139, 34);
      this.doc.text('Ventes Recentes (5 dernieres)', 20, yPosition);
      
      // Bordure autour du titre des ventes
      this.doc.setDrawColor(34, 139, 34);
      this.doc.setLineWidth(0.5);
      this.doc.rect(15, yPosition - 15, 180, 20);
      
      yPosition += 20;
      
      const salesData = sales.slice(0, 5).map(sale => [
        new Date(sale.date).toLocaleDateString('fr-FR'),
        sale.targetType,
        sale.buyerName,
        sale.quantity.toString(),
        `${sale.unitPrice.toLocaleString('fr-FR')} XOF`,
        `${sale.totalAmount.toLocaleString('fr-FR')} XOF`,
        sale.paymentMethod
      ]);
      
             autoTable(this.doc, {
         startY: yPosition,
         head: [['Date', 'Type', 'Acheteur', 'Quantite', 'Prix unitaire', 'Total', 'Paiement']],
         body: salesData,
         theme: 'grid',
         headStyles: {
           fillColor: [34, 139, 34],
           textColor: [255, 255, 255],
           fontStyle: 'bold'
         },
         styles: {
           fontSize: 8,
           cellPadding: 2
         }
       });
    }
    
    // Ajouter le pied de page
    this.addFooter();
    
    this.doc.save('statistiques-pigeonfarm.pdf');
  }

  // Exporter les données de santé
  async exportHealthRecords(healthRecords: any[]) {
    this.doc = new jsPDF();
    
    await this.addHeader('Rapport Sante PigeonFarm');
    
    if (healthRecords.length > 0) {
      // Ajouter un résumé des enregistrements
      this.doc.setFontSize(16);
      this.doc.setTextColor(34, 139, 34);
      this.doc.text('Enregistrements de Sante', 20, 150);
      
      // Bordure autour du titre santé
      this.doc.setDrawColor(34, 139, 34);
      this.doc.setLineWidth(0.5);
      this.doc.rect(15, 135, 180, 20);
      
      // Compter les types d'enregistrements
      const typeCounts = healthRecords.reduce((acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {} as any);
      
      this.doc.setFontSize(11);
      this.doc.setTextColor(0, 0, 0);
      let yPos = 170;
      Object.entries(typeCounts).forEach(([type, count]) => {
        this.doc.text(`${type}: ${count}`, 20, yPos);
        yPos += 12;
      });
      
      yPos += 15;
      
      const healthData = healthRecords.map(record => [
        new Date(record.created_at).toLocaleDateString('fr-FR'),
        record.type,
        record.targetType,
        record.targetId,
        record.product,
        record.dosage || '-',
        record.observations || '-'
      ]);
      
             autoTable(this.doc, {
         startY: yPos,
         head: [['Date', 'Type', 'Cible', 'ID Cible', 'Produit', 'Dosage', 'Observations']],
         body: healthData,
         theme: 'grid',
         headStyles: {
           fillColor: [34, 139, 34],
           textColor: [255, 255, 255],
           fontStyle: 'bold'
         },
         styles: {
           fontSize: 8,
           cellPadding: 2
         }
       });
    } else {
      this.doc.setFontSize(14);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Aucun enregistrement de sante disponible', 20, 150);
    }
    
    // Ajouter le pied de page
    this.addFooter();
    
    this.doc.save('sante-pigeonfarm.pdf');
  }
}

export default new PDFExporter();
