import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Donation, Expense, MandalSettings, FinancialSummary } from '../types';
import { formatINR } from './currency';
import { drawReceiptCanvas } from './receiptCanvas';

/**
 * Generates a PDF document for a Donation Receipt using the official Ganraj Mitra Mandal template image
 */
export function generateReceiptPDF(
  donation: Donation,
  settings: MandalSettings
): jsPDF {
  // Render high-res canvas (1200 x 780 landscape card format)
  const canvas = drawReceiptCanvas(donation, settings, 1200, 780);
  const imgData = canvas.toDataURL('image/png');

  // Create landscape PDF matching 1200:780 aspect ratio (210mm x 136.5mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 136.5],
  });

  // Add template image to cover entire PDF page
  doc.addImage(imgData, 'PNG', 0, 0, 210, 136.5);

  return doc;
}


/**
 * Generates a complete Financial Report PDF statement
 */
export function generateFinancialReportPDF(
  donations: Donation[],
  expenses: Expense[],
  summary: FinancialSummary,
  settings: MandalSettings
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFillColor(136, 14, 79); // Maroon
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.mandal_name.toUpperCase(), 105, 14, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`FINANCIAL STATEMENT & STATEMENT OF ACCOUNTS (${settings.ganeshotsav_year})`, 105, 22, {
    align: 'center',
  });

  let y = 38;
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')}`, 14, y);

  // Financial Summary Cards Table
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [['TOTAL COLLECTION', 'TOTAL EXPENSES', 'NET BALANCE']],
    body: [
      [
        formatINR(summary.totalCollection),
        formatINR(summary.totalExpenses),
        formatINR(summary.currentBalance),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [136, 14, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
  });

  // Cash vs Online Breakdown
  const lastY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 60;

  autoTable(doc, {
    startY: lastY + 6,
    head: [['TYPE', 'CASH (₹)', 'ONLINE (₹)', 'TOTAL (₹)']],
    body: [
      ['Donations (Vargani)', formatINR(summary.cashCollection), formatINR(summary.onlineCollection), formatINR(summary.totalCollection)],
      ['Expenses', formatINR(summary.cashExpenses), formatINR(summary.onlineExpenses), formatINR(summary.totalExpenses)],
      ['Net Balance', formatINR(summary.cashBalance), formatINR(summary.onlineBalance), formatINR(summary.currentBalance)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [217, 119, 6] },
  });

  let currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Section: Donations List
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(136, 14, 79);
  doc.text('DONATIONS RECORD', 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Receipt No', 'Donor Name', 'Phone', 'Mode', 'Date', 'Amount (₹)']],
    body: donations.map((d) => [
      d.receipt_number,
      d.donor_name,
      d.phone || 'N/A',
      d.payment_mode,
      d.date,
      formatINR(d.amount),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
    bodyStyles: { fontSize: 9 },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Section: Expenses List
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(136, 14, 79);
  doc.text('EXPENSES RECORD', 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Expense No', 'Title', 'Category', 'Mode', 'Date', 'Amount (₹)']],
    body: expenses.map((e) => [
      e.expense_number,
      e.title,
      e.category,
      e.payment_mode,
      e.date,
      formatINR(e.amount),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
    bodyStyles: { fontSize: 9 },
  });

  return doc;
}
