import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// ─── JSON Export ──────────────────────────────────────────────────────────────

export async function downloadJSON(data: object, filename: string) {
  const json = JSON.stringify(data, null, 2);

  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    const { uri } = await Filesystem.getUri({ directory: Directory.Cache, path: filename });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Partager les données JSON' });
  } else {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

interface PDFSection {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export async function downloadPDF(reportTitle: string, sections: PDFSection[], subtitle?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const MARGIN  = 14;
  const COL_W   = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  // Header
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, PAGE_W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pigeon Farm', MARGIN, 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(reportTitle, MARGIN, 20);
  if (subtitle) {
    doc.setFontSize(9);
    doc.text(subtitle, MARGIN, 26);
  }
  y = 36;

  doc.setTextColor(31, 41, 55);

  for (const section of sections) {
    if (y > 260) { doc.addPage(); y = MARGIN; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text(section.title, MARGIN, y);
    y += 6;

    doc.setFillColor(240, 253, 244);
    doc.rect(MARGIN, y, COL_W, 7, 'F');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const colW = COL_W / section.headers.length;
    section.headers.forEach((h, i) => doc.text(h, MARGIN + i * colW + 2, y + 5));
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    section.rows.forEach((row, ri) => {
      if (y > 272) { doc.addPage(); y = MARGIN; }
      if (ri % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(MARGIN, y, COL_W, 6, 'F');
      }
      row.forEach((cell, i) => {
        doc.text(String(cell ?? ''), MARGIN + i * colW + 2, y + 4.5);
      });
      y += 6;
    });
    y += 6;
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} — Page ${p}/${pages}`, MARGIN, 290);
  }

  const filename = `${reportTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`;

  if (Capacitor.isNativePlatform()) {
    const base64 = doc.output('datauristring').split(',')[1];
    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });
    const { uri } = await Filesystem.getUri({ directory: Directory.Cache, path: filename });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Partager le rapport PDF' });
  } else {
    doc.save(filename);
  }
}
