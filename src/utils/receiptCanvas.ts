import { Donation, MandalSettings } from '../types';
import { numberToWordsIN, numberToWordsMarathi } from './currency';

/**
 * Generates a high-resolution PNG canvas for a modern, digital donation receipt.
 * Styled after premium Indian digital transaction receipts (Razorpay/PhonePe) with
 * traditional Saffron, Maroon, Gold, and Ivory festival aesthetics for Ganraj Mitra Mandal.
 */
export function drawReceiptCanvas(
  donation: Donation,
  settings: MandalSettings,
  canvasWidth = 1200,
  canvasHeight = 780
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const scale = canvasWidth / 1200;

  // -------------------------------------------------------------------------
  // 1. BASE CANVAS & DECORATIVE BACKGROUND
  // -------------------------------------------------------------------------
  // Cream / Ivory subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGrad.addColorStop(0, '#FFFDF9');
  bgGrad.addColorStop(0.5, '#FBF6EE');
  bgGrad.addColorStop(1, '#F6ECE0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Outer Margin & Frame
  const margin = 16 * scale;
  const frameWidth = canvasWidth - margin * 2;
  const frameHeight = canvasHeight - margin * 2 - 16 * scale; // Leave room for footer credit
  const frameRadius = 24 * scale;

  ctx.save();
  ctx.shadowColor = 'rgba(89, 2, 17, 0.12)';
  ctx.shadowBlur = 20 * scale;
  ctx.shadowOffsetY = 6 * scale;

  // Outer White Card Base
  ctx.beginPath();
  ctx.roundRect(margin, margin, frameWidth, frameHeight, frameRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Ornate Gold Border Stroke
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();
  ctx.restore();

  // Subtle Ganesha Watermark Emblem in Center
  drawBackgroundWatermark(ctx, canvasWidth / 2, canvasHeight / 2, scale);

  // -------------------------------------------------------------------------
  // 2. COMPACT HEADER BANNER (CRIMSON, MAROON & SAFFRON GRADIENT)
  // -------------------------------------------------------------------------
  const headerHeight = 145 * scale;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin, frameWidth, headerHeight, [frameRadius, frameRadius, 0, 0]);
  ctx.clip();

  // Deep Maroon to Saffron Accent Header
  const headerGrad = ctx.createLinearGradient(margin, margin, frameWidth, headerHeight);
  headerGrad.addColorStop(0, '#4A000E');
  headerGrad.addColorStop(0.4, '#7E0B20');
  headerGrad.addColorStop(0.85, '#590211');
  headerGrad.addColorStop(1, '#3A000A');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(margin, margin, frameWidth, headerHeight);

  // Subtle Sunburst Rays Background Lines
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.07)';
  ctx.lineWidth = 1.5 * scale;
  const sunX = margin + 80 * scale;
  const sunY = margin + 70 * scale;
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(angle) * 500 * scale, sunY + Math.sin(angle) * 500 * scale);
    ctx.stroke();
  }

  // Golden Bottom Accent Line on Header
  const barGrad = ctx.createLinearGradient(margin, 0, frameWidth, 0);
  barGrad.addColorStop(0, '#D97706');
  barGrad.addColorStop(0.5, '#F59E0B');
  barGrad.addColorStop(1, '#EA580C');
  ctx.fillStyle = barGrad;
  ctx.fillRect(margin, margin + headerHeight - 6 * scale, frameWidth, 6 * scale);

  ctx.restore();

  // -------------------------------------------------------------------------
  // 3. HEADER CONTENT (INVOCATION, BADGE, MANDAL NAME & RECEIPT PILL)
  // -------------------------------------------------------------------------
  // Top Invocation
  ctx.save();
  ctx.fillStyle = '#FBBF24'; // Warm Gold
  ctx.font = `bold ${16 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('॥ श्री गणेशाय नमः ॥', margin + 140 * scale, margin + 28 * scale);

  // Ganesha Gold Emblem (Left)
  drawGaneshaBadge(ctx, margin + 70 * scale, margin + 72 * scale, 38 * scale, scale);

  // Mandal Title & Subtitle
  const mandalTitle = settings.mandal_name || 'Ganraj Mitra Mandal';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 6 * scale;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${32 * scale}px "Noto Sans Devanagari", "Arial Black", sans-serif`;
  ctx.fillText(mandalTitle, margin + 140 * scale, margin + 66 * scale);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FDE68A'; // Soft Gold Subtitle
  ctx.font = `bold ${17 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('अवधूतेश्वर महादेव मंदिर • जगताप नगर, उंटवाडी, नाशिक', margin + 140 * scale, margin + 94 * scale);

  // Year Badge Tag
  const yearStr = settings.ganeshotsav_year ? `GANESHOTSAV ${settings.ganeshotsav_year}` : 'GANESHOTSAV 2026';
  ctx.fillStyle = '#F59E0B';
  ctx.font = `bold ${13 * scale}px sans-serif`;
  ctx.fillText(`• ${yearStr} •`, margin + 140 * scale, margin + 118 * scale);
  ctx.restore();

  // Receipt Pill Badge on Right Side of Header
  drawTitlePill(ctx, canvasWidth - margin - 210 * scale, margin + 72 * scale, scale);

  // -------------------------------------------------------------------------
  // 4. MAIN CONTENT AREA (2-COLUMN GRID: AMOUNT CARD & DONOR DETAILS)
  // -------------------------------------------------------------------------
  const bodyY = margin + headerHeight + 16 * scale;
  const bodyH = 395 * scale;

  // LEFT COLUMN: PAYMENT SUCCESS & AMOUNT DISPLAY CARD
  const leftW = 460 * scale;
  const leftX = margin + 16 * scale;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = 10 * scale;
  ctx.shadowOffsetY = 3 * scale;

  // Amount Card Background (Light Saffron Ivory Tint)
  ctx.beginPath();
  ctx.roundRect(leftX, bodyY, leftW, bodyH, 20 * scale);
  const amountBg = ctx.createLinearGradient(leftX, bodyY, leftX, bodyY + bodyH);
  amountBg.addColorStop(0, '#FFFBEB');
  amountBg.addColorStop(1, '#FEF3C7');
  ctx.fillStyle = amountBg;
  ctx.fill();

  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#FCD34D';
  ctx.stroke();
  ctx.restore();

  // Inside Amount Card
  ctx.save();
  ctx.textAlign = 'center';

  // Green Check Circle & Payment Received Badge
  const checkCenterX = leftX + leftW / 2;
  const checkY = bodyY + 42 * scale;

  ctx.beginPath();
  ctx.arc(checkCenterX - 85 * scale, checkY, 13 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#059669'; // Emerald Green
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${14 * scale}px sans-serif`;
  ctx.fillText('✓', checkCenterX - 85 * scale, checkY + 4.5 * scale);

  ctx.fillStyle = '#065F46';
  ctx.font = `bold ${17 * scale}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('DONATION RECEIVED', checkCenterX - 64 * scale, checkY + 5 * scale);

  // Large Amount Text Display
  ctx.textAlign = 'center';
  ctx.fillStyle = '#78350F';
  const formattedAmount = `₹ ${donation.amount.toLocaleString('en-IN')}/-`;
  let amountFontSize = 48 * scale;
  if (formattedAmount.length > 15) {
    amountFontSize = 32 * scale;
  } else if (formattedAmount.length > 12) {
    amountFontSize = 38 * scale;
  } else if (formattedAmount.length > 9) {
    amountFontSize = 42 * scale;
  }
  ctx.font = `900 ${amountFontSize}px "Arial Black", sans-serif`;
  ctx.fillText(formattedAmount, checkCenterX, bodyY + 125 * scale);

  // Divider Line inside Amount Card
  ctx.beginPath();
  ctx.moveTo(leftX + 30 * scale, bodyY + 160 * scale);
  ctx.lineTo(leftX + leftW - 30 * scale, bodyY + 160 * scale);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Amount in Words (Marathi & English)
  const englishWords = numberToWordsIN(donation.amount);
  const marathiWords = numberToWordsMarathi(donation.amount);

  ctx.fillStyle = '#92400E';
  ctx.font = `bold ${17 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText(marathiWords, checkCenterX, bodyY + 200 * scale);

  ctx.fillStyle = '#B45309';
  ctx.font = `600 ${15 * scale}px sans-serif`;
  ctx.fillText(`(${englishWords})`, checkCenterX, bodyY + 232 * scale);

  // Payment Mode Badge Box
  const modeBoxW = 260 * scale;
  const modeBoxH = 46 * scale;
  const modeBoxX = checkCenterX - modeBoxW / 2;
  const modeBoxY = bodyY + 275 * scale;

  ctx.beginPath();
  ctx.roundRect(modeBoxX, modeBoxY, modeBoxW, modeBoxH, 23 * scale);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.fillStyle = '#6B7280';
  ctx.font = `600 ${14 * scale}px sans-serif`;
  ctx.fillText('Payment Mode:', checkCenterX - 45 * scale, modeBoxY + 28 * scale);

  ctx.fillStyle = '#D97706';
  ctx.font = `bold ${16 * scale}px sans-serif`;
  ctx.fillText(donation.payment_mode || 'Cash', checkCenterX + 55 * scale, modeBoxY + 28 * scale);

  ctx.restore();

  // RIGHT COLUMN: DONOR & TRANSACTION DETAILS TABLE
  const rightX = leftX + leftW + 16 * scale;
  const rightW = frameWidth - leftW - 48 * scale;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
  ctx.shadowBlur = 10 * scale;
  ctx.shadowOffsetY = 3 * scale;

  ctx.beginPath();
  ctx.roundRect(rightX, bodyY, rightW, bodyH, 20 * scale);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.lineWidth = 1.5 * scale;
  ctx.strokeStyle = '#E5E7EB';
  ctx.stroke();
  ctx.restore();

  // Detail Items Rows
  const detailsList = [
    { label: 'Receipt Number', value: donation.receipt_number || 'GMM-0001', isMonospace: true },
    { label: 'Date & Time', value: donation.date, isStandard: true },
    { label: 'Donor Name', value: donation.donor_name, isDonor: true },
    { label: 'Mobile Number', value: donation.phone ? `+91 ${donation.phone}` : 'N/A', isStandard: true },
  ];

  if (donation.notes && donation.notes.trim()) {
    detailsList.push({ label: 'Notes / Purpose', value: donation.notes, isStandard: true });
  }

  const rowStartX = rightX + 24 * scale;
  const rowValueX = rightX + rightW - 24 * scale;
  const rowCount = detailsList.length;
  const rowGap = (bodyH - 40 * scale) / rowCount;
  let currentY = bodyY + 42 * scale;

  detailsList.forEach((item, idx) => {
    if (idx > 0) {
      ctx.beginPath();
      ctx.moveTo(rowStartX, currentY - 26 * scale);
      ctx.lineTo(rowValueX, currentY - 26 * scale);
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#6B7280';
    ctx.font = `600 ${17 * scale}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(item.label, rowStartX, currentY);

    // Value
    ctx.textAlign = 'right';
    if (item.isDonor) {
      ctx.fillStyle = '#111827';
      ctx.font = `900 ${22 * scale}px "Noto Sans Devanagari", sans-serif`;
    } else if (item.isMonospace) {
      ctx.fillStyle = '#1F2937';
      ctx.font = `bold ${20 * scale}px "Courier New", monospace, sans-serif`;
    } else {
      ctx.fillStyle = '#374151';
      ctx.font = `600 ${18 * scale}px sans-serif`;
    }

    ctx.fillText(item.value, rowValueX, currentY);
    currentY += rowGap;
  });

  // -------------------------------------------------------------------------
  // 5. BLESSINGS & FOOTER CARD (MAROON & GOLD BOTTOM STRIP)
  // -------------------------------------------------------------------------
  const footerY = bodyY + bodyH + 14 * scale;
  const footerH = 122 * scale;
  const footerW = frameWidth;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, footerY, footerW, footerH, [0, 0, frameRadius, frameRadius]);
  const footerBg = ctx.createLinearGradient(margin, footerY, margin + footerW, footerY + footerH);
  footerBg.addColorStop(0, '#590211');
  footerBg.addColorStop(0.5, '#7E0B20');
  footerBg.addColorStop(1, '#4A000E');
  ctx.fillStyle = footerBg;
  ctx.fill();

  // Inner Gold Divider Accent Line
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  // Official Seal Icon (Left)
  drawMandalSeal(ctx, margin + 70 * scale, footerY + 61 * scale, scale);

  // Center Blessings Message
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${23 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('🙏 गणपती बाप्पा मोरया 🙏', canvasWidth / 2, footerY + 45 * scale);

  ctx.fillStyle = '#FDE68A';
  ctx.font = `600 ${16 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('देणगी दिल्याबद्दल धन्यवाद • Thank you for your contribution.', canvasWidth / 2, footerY + 82 * scale);

  // Signature Line (Right)
  const sigX = margin + footerW - 110 * scale;
  const sigY = footerY + 58 * scale;

  ctx.font = `italic bold ${19 * scale}px "Brush Script MT", cursive, sans-serif`;
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('Ganraj Mandal Auth', sigX, sigY - 8 * scale);

  ctx.beginPath();
  ctx.moveTo(sigX - 70 * scale, sigY);
  ctx.lineTo(sigX + 70 * scale, sigY);
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.font = `500 ${13 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillStyle = '#E5E7EB';
  ctx.fillText('पैसे घेणाऱ्याची सही / Authorized Sig', sigX, sigY + 18 * scale);

  ctx.restore();

  // -------------------------------------------------------------------------
  // 6. LEGAL NOTICE AT BOTTOM
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9CA3AF';
  ctx.font = `500 ${12 * scale}px sans-serif`;
  ctx.fillText(
    'This is an official computer-generated digital donation receipt.',
    canvasWidth / 2,
    canvasHeight - 4 * scale
  );
  ctx.restore();

  return canvas;
}

/**
 * Draws a subtle Ganesha background watermark
 */
function drawBackgroundWatermark(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#800020';

  ctx.beginPath();
  ctx.arc(x, y, 180 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 5 * scale;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws an ornate Gold Circular Ganesha Badge for the Header
 */
function drawGaneshaBadge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, scale: number) {
  ctx.save();
  ctx.shadowColor = '#FBBF24';
  ctx.shadowBlur = 12 * scale;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const badgeGrad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  badgeGrad.addColorStop(0, '#FFF59D');
  badgeGrad.addColorStop(0.5, '#F59E0B');
  badgeGrad.addColorStop(1, '#B45309');
  ctx.fillStyle = badgeGrad;
  ctx.fill();

  ctx.lineWidth = 2.5 * scale;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4A000E';
  ctx.font = `900 ${r * 1.15}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('ॐ', x, y + r * 0.38);

  ctx.restore();
}

/**
 * Draws the Title Pill Badge in Header Right
 */
function drawTitlePill(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const pillW = 380 * scale;
  const pillH = 48 * scale;
  const pillX = x - pillW / 2;
  const pillY = y - pillH / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 8 * scale;

  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);

  const pillGrad = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0);
  pillGrad.addColorStop(0, '#590211');
  pillGrad.addColorStop(0.5, '#800020');
  pillGrad.addColorStop(1, '#590211');
  ctx.fillStyle = pillGrad;
  ctx.fill();

  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#FBBF24';
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${18 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('DONATION RECEIPT • देणगी पावती', x, y + 6 * scale);

  ctx.restore();
}

/**
 * Draws the Mandal Official Stamp Seal
 */
function drawMandalSeal(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.85;

  ctx.beginPath();
  ctx.arc(x, y, 28 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 23 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.font = `bold ${9 * scale}px sans-serif`;
  ctx.fillText('GANRAJ', x, y - 5 * scale);
  ctx.fillText('MANDAL', x, y + 5 * scale);
  ctx.fillText('SEAL', x, y + 14 * scale);

  ctx.restore();
}

