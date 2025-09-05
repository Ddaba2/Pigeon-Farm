import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: string[];
  columnHeaders: string[];
  filename: string;
  logo?: string;
}

export class PDFExporter {
  private doc: jsPDF;
  private primaryColor = [41, 128, 185]; // Bleu professionnel
  private secondaryColor = [52, 152, 219]; // Bleu clair
  private accentColor = [52, 152, 219]; // Bleu pour les accents
  private textColor = [52, 73, 94]; // Gris foncé pour le texte
  private lightColor = [236, 240, 241]; // Gris très clair

  constructor() {
    this.doc = new jsPDF();
  }

  // Méthodes utilitaires pour les couleurs
  private setTextColorRGB(r: number, g: number, b: number) {
    this.doc.setTextColor(r, g, b);
  }

  private setFillColorRGB(r: number, g: number, b: number) {
    this.doc.setFillColor(r, g, b);
  }

  // Ajouter le logo sans le cercle bleu
  private async addLogo() {
    try {
      const logoUrl = '/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png';
      const img = new Image();
      img.src = logoUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          const pageWidth = this.doc.internal.pageSize.width;
          const logoSize = 35;
          const logoX = (pageWidth - logoSize) / 2; // ✅ centré
          const logoY = 15;

          // Logo centré (sans cercle bleu)
          this.doc.addImage(img, 'PNG', logoX, logoY, logoSize, logoSize);

          // Texte centré sous le logo
          this.doc.setFontSize(20);
          this.setTextColorRGB(...this.primaryColor);
          this.doc.setFont(undefined, 'bold');
          this.doc.text('PigeonFarm', pageWidth / 2, logoY + logoSize + 10, { align: 'center' });

          this.doc.setFontSize(10);
          this.setTextColorRGB(...this.textColor);
          this.doc.setFont(undefined, 'normal');
          this.doc.text(
            'Gestion d\'élevage professionnelle',
            pageWidth / 2,
            logoY + logoSize + 16,
            { align: 'center' }
          );

          resolve(true);
        };

        img.onerror = () => {
          // Fallback élégant centré
          const pageWidth = this.doc.internal.pageSize.width;
          this.doc.setFontSize(20);
          this.setTextColorRGB(...this.primaryColor);
          this.doc.setFont(undefined, 'bold');
          this.doc.text('PigeonFarm', pageWidth / 2, 30, { align: 'center' });
          this.doc.setFontSize(10);
          this.setTextColorRGB(...this.textColor);
          this.doc.setFont(undefined, 'normal');
          this.doc.text('Gestion d\'élevage professionnelle', pageWidth / 2, 37, { align: 'center' });
          resolve(true);
        };
      });
    } catch (error) {
      const pageWidth = this.doc.internal.pageSize.width;
      this.doc.setFontSize(20);
      this.setTextColorRGB(...this.primaryColor);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('PigeonFarm', pageWidth / 2, 30, { align: 'center' });
      this.doc.setFontSize(10);
      this.setTextColorRGB(...this.textColor);
      this.doc.setFont(undefined, 'normal');
      this.doc.text('Gestion d\'élevage professionnelle', pageWidth / 2, 37, { align: 'center' });
    }
  }

  // En-tête professionnel
  private async addHeader(title: string, subtitle?: string) {
    await this.addLogo();
  
    const pageWidth = this.doc.internal.pageSize.width;
    const currentY = 80; // ✅ on descend un peu plus bas
  
    // Barre de séparation élégante
    this.setFillColorRGB(...this.primaryColor);
    this.doc.rect(20, currentY, pageWidth - 40, 2, 'F');
  
    // Titre principal
    this.doc.setFontSize(18);
    this.setTextColorRGB(...this.primaryColor);
    this.doc.setFont(undefined, 'bold');
    this.doc.text(title, pageWidth / 2, currentY + 15, { align: 'center' });
  
    // Sous-titre optionnel
    if (subtitle) {
      this.doc.setFontSize(12);
      this.setTextColorRGB(...this.textColor);
      this.doc.setFont(undefined, 'normal');
      this.doc.text(subtitle, pageWidth / 2, currentY + 25, { align: 'center' });
    }
  
    // Infos génération
    this.doc.setFontSize(9);
    this.doc.setTextColor(150, 150, 150);
    const dateText = `Généré le ${new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} à ${new Date().toLocaleTimeString('fr-FR')}`;
  
    this.doc.text(dateText, pageWidth / 2, currentY + 35, { align: 'center' });
  
    return currentY + 45;
  }

  // Pied de page professionnel
  private addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;
    const footerY = pageHeight - 25;

    // Barre de pied de page
    this.setFillColorRGB(...this.primaryColor);
    this.doc.rect(0, footerY - 15, pageWidth, 2, 'F');

    // Informations de contact
    this.doc.setFontSize(8);
    this.setTextColorRGB(...this.textColor);
    this.doc.text('PigeonFarm - Système de gestion d\'élevage professionnel', 20, footerY - 5);
    
    this.doc.setFontSize(7);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('Email: contactpigeonfarm@gmail.com • Tél: +223 83 78 40 97 • Site: www.pigeonfarm.com', 20, footerY);

    // Numéro de page
    const pageInfo = this.doc.internal.getCurrentPageInfo();
    if (pageInfo) {
      this.doc.text(`Page ${pageInfo.pageNumber}`, pageWidth - 20, footerY, { align: 'right' });
    }
  }

  // Tableau avec design professionnel (sans colonne ID)
  async exportTable(options: PDFExportOptions) {
    this.doc = new jsPDF();
    const startY = await this.addHeader(options.title, options.subtitle);

    // Préparer les données (exclure la colonne ID si elle existe)
    const tableData = options.data.map(item => 
      options.columns
        .filter(col => col.toLowerCase() !== 'id') // Exclure la colonne ID
        .map(col => {
          const value = item[col];
          // Formater les nombres et datesh
          if (typeof value === 'number') {
            return value.toLocaleString('fr-FR');
          }
          if (value instanceof Date) {
            return value.toLocaleDateString('fr-FR');
          }
          return value || '-';
        })
    );

    // Filtrer également les en-têtes de colonnes
    const filteredHeaders = options.columnHeaders.filter((_, index) => 
      options.columns[index].toLowerCase() !== 'id'
    );

    // Tableau professionnel
    autoTable(this.doc, {
      startY: startY,
      head: [filteredHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.primaryColor as [number, number, number],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: this.textColor as [number, number, number]
      },
      alternateRowStyles: {
        fillColor: this.lightColor as [number, number, number]
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      margin: { top: 10 },
      tableWidth: 'auto'
    });

    this.addFooter();
    this.doc.save(`${options.filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Statistiques avec tableau des ventes au lieu du graphique
async exportStatistics(stats: any, sales: any[]) {
  this.doc = new jsPDF();
  const startY = await this.addHeader('Rapport Statistiques Détaillé', 'Tableau de bord de performance');
  const pageWidth = this.doc.internal.pageSize.width;

  let yPosition = startY;

  // Cartes de statistiques
  const statsCards = [
    { label: 'Couples', value: stats.couples?.total || 0, symbol: 'C' },
    { label: 'Oeufs', value: stats.eggs?.total || 0, symbol: 'O' },
    { label: 'Pigeonneaux', value: stats.pigeonneaux?.total || 0, symbol: 'P' },
    { label: 'Ventes', value: stats.sales?.total || 0, symbol: 'V' },
    { label: 'Revenus', value: `${(stats.sales?.totalRevenue || 0).toLocaleString('fr-FR')} XOF`, symbol: 'R' },
    { label: 'Santé', value: stats.health?.total || 0, symbol: 'S' }
  ];

  // Disposition en grille 3x2
  const cardWidth = 55;
  const cardHeight = 30;
  const spacing = 10;

  statsCards.forEach((card, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = 20 + col * (cardWidth + spacing);
    const y = yPosition + row * (cardHeight + spacing);

    // Carte avec ombre légère
    this.doc.setFillColor(250, 250, 250);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(x, y, cardWidth, cardHeight, 'F');

    // Symbole
    this.doc.setFontSize(14);
    this.setTextColorRGB(this.secondaryColor[0], this.secondaryColor[1], this.secondaryColor[2]);
    this.doc.setFont(undefined, 'bold');
    this.doc.text(card.symbol, x + 5, y + 10);

    // Valeur
    this.doc.setFontSize(11);
    this.setTextColorRGB(...this.primaryColor);
    this.doc.text(card.value.toString(), x + 20, y + 10);

    // Label
    this.doc.setFontSize(8);
    this.setTextColorRGB(...this.textColor);
    this.doc.setFont(undefined, 'normal');
    this.doc.text(card.label, x + 5, y + 20);
  });

  yPosition += 80;

  // Tableau des ventes 
  if (sales && sales.length > 0) {
    this.doc.setFontSize(14);
    this.setTextColorRGB(...this.primaryColor);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Détail des Ventes Récentes', 20, yPosition);
    yPosition += 10;

         // Préparer les données pour le tableau
     const salesData = sales.slice(0, 10).map(sale => [
       sale.date ? new Date(sale.date).toLocaleDateString('fr-FR') : 'N/A',
       sale.targetType || 'Non spécifié',
       sale.buyer_name || 'Non spécifié',
       sale.paymentMethod || 'Non spécifié',
       sale.quantity || 0,
       `${(sale.unitPrice || 0).toLocaleString('fr-FR')} XOF`,
       `${(sale.totalAmount || 0).toLocaleString('fr-FR')} XOF`
     ]);

     // Tableau des ventes
     autoTable(this.doc, {
       startY: yPosition,
       head: [['Date', 'Cible', 'Acheteur', 'Mode de paiement', 'Quantité', 'Prix unitaire', 'Total']],
       body: salesData,
      theme: 'grid',
      headStyles: {
        fillColor: this.accentColor as [number, number, number],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: this.textColor as [number, number, number]
      },
      alternateRowStyles: {
        fillColor: this.lightColor as [number, number, number]
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      margin: { top: 10 },
      tableWidth: 'auto'
    });
  } else {
    // Message si pas de données de vente
    this.doc.setFontSize(12);
    this.setTextColorRGB(150, 150, 150);
    this.doc.setFont(undefined, 'italic');
    this.doc.text('Aucune donnée de vente disponible', 20, yPosition + 20);
  }

  this.addFooter();
  this.doc.save(`rapport-statistiques-${new Date().toISOString().split('T')[0]}.pdf`);
}

  // Export santé avec design médical professionnel (sans colonne ID)
  async exportHealthRecords(healthRecords: any[]) {
    this.doc = new jsPDF();
    const startY = await this.addHeader('Rapport Médical Complet', 'Suivi de santé des pigeons');

    if (healthRecords.length > 0) {
      const healthData = healthRecords.map(record => [
        new Date(record.created_at).toLocaleDateString('fr-FR'),
        record.type,
        record.targetType,
        record.product,
        record.observations || 'Aucune'
      ]);

      autoTable(this.doc, {
        startY: startY,
        head: [['Date', 'Type', 'Cible', 'Traitement', 'Observations']], // ID supprimé
        body: healthData,
        theme: 'grid',
        headStyles: {
          fillColor: this.primaryColor as [number, number, number],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
    } else {
      this.doc.setFontSize(12);
      this.doc.setTextColor(150, 150, 150);
      this.doc.setFont(undefined, 'italic');
      this.doc.text('Aucun enregistrement médical disponible', 20, startY + 20);
    }

    this.addFooter();
    this.doc.save(`rapport-sante-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}

export default new PDFExporter();