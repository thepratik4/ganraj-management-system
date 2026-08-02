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
  canvasHeight = 1800
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
  // Smooth Cream/Ivory backdrop gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGrad.addColorStop(0, '#FFFDF9');
  bgGrad.addColorStop(0.5, '#FBF5EB');
  bgGrad.addColorStop(1, '#F7EEE0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Outer Decorative Frame (Saffron & Gold Dual Border)
  const margin = 24 * scale;
  const frameWidth = canvasWidth - margin * 2;
  const frameHeight = canvasHeight - margin * 2;
  const frameRadius = 36 * scale;

  ctx.save();
  ctx.shadowColor = 'rgba(89, 2, 17, 0.12)';
  ctx.shadowBlur = 25 * scale;
  ctx.shadowOffsetY = 10 * scale;

  // Outer White Card Area
  ctx.beginPath();
  ctx.roundRect(margin, margin, frameWidth, frameHeight, frameRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Golden Frame Stroke
  ctx.lineWidth = 3.5 * scale;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();
  ctx.restore();

  // Subtle Ganesha Background Watermark (Center)
  drawBackgroundWatermark(ctx, canvasWidth / 2, canvasHeight / 2 + 100 * scale, scale);

  // -------------------------------------------------------------------------
  // 2. HEADER BANNER CARD (MAROON & SAFFRON FESTIVAL HEADER)
  // -------------------------------------------------------------------------
  const headerHeight = 380 * scale;

  ctx.save();
  // Clip top portion with rounded top corners matching the outer frame
  ctx.beginPath();
  ctx.roundRect(margin, margin, frameWidth, headerHeight, [frameRadius, frameRadius, 0, 0]);
  ctx.clip();

  // Deep Maroon / Crimson Gradient
  const headerGrad = ctx.createLinearGradient(margin, margin, frameWidth, headerHeight);
  headerGrad.addColorStop(0, '#4A000E');
  headerGrad.addColorStop(0.35, '#7E0B20');
  headerGrad.addColorStop(0.75, '#590211');
  headerGrad.addColorStop(1, '#330009');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(margin, margin, frameWidth, headerHeight);

  // Decorative Golden Sunburst Lines in Background
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
  ctx.lineWidth = 2 * scale;
  const centerX = canvasWidth / 2;
  const centerY = margin + 120 * scale;
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * 600 * scale, centerY + Math.sin(angle) * 600 * scale);
    ctx.stroke();
  }
  ctx.restore();

  // Saffron/Gold Accent Bottom Bar on Header
  const barGrad = ctx.createLinearGradient(margin, 0, frameWidth, 0);
  barGrad.addColorStop(0, '#D97706');
  barGrad.addColorStop(0.5, '#F59E0B');
  barGrad.addColorStop(1, '#EA580C');
  ctx.fillStyle = barGrad;
  ctx.fillRect(margin, margin + headerHeight - 12 * scale, frameWidth, 12 * scale);

  ctx.restore();

  // -------------------------------------------------------------------------
  // 3. HEADER CONTENT (GANESHA EMBLEM, MANDAL NAME, ADDRESS)
  // -------------------------------------------------------------------------
  // Top Invocation: ॥ श्री गणेशाय नमः ॥
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FBBF24'; // Warm Gold
  ctx.font = `bold ${22 * scale}px "Noto Sans Devanagari", "Arial", sans-serif`;
  ctx.fillText('॥ श्री गणेशाय नमः ॥', canvasWidth / 2, margin + 42 * scale);

  // Circular Gold Ganesha Emblem Icon Badge
  const badgeX = canvasWidth / 2;
  const badgeY = margin + 125 * scale;
  drawGaneshaBadge(ctx, badgeX, badgeY, 52 * scale, scale);

  // Mandal Title (Ganraj Mitra Mandal)
  ctx.save();
  ctx.textAlign = 'center';

  // Gold Glow Effect
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10 * scale;
  ctx.shadowOffsetY = 3 * scale;

  const mandalTitle = settings.mandal_name || 'Ganraj Mitra Mandal';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${44 * scale}px "Noto Sans Devanagari", "Arial Black", sans-serif`;
  ctx.fillText(mandalTitle, canvasWidth / 2, margin + 225 * scale);
  ctx.restore();

  // Subtitle / Temple Name
  ctx.fillStyle = '#FDE68A'; // Soft Gold Accent
  ctx.font = `bold ${24 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('अवधूतेश्वर महादेव मंदिर', canvasWidth / 2, margin + 270 * scale);

  // Address
  ctx.fillStyle = '#F3F4F6';
  ctx.font = `500 ${20 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('जगताप नगर, उंटवाडी, नाशिक', canvasWidth / 2, margin + 305 * scale);

  // Ganeshotsav Year Tag
  const yearStr = settings.ganeshotsav_year ? `GANESHOTSAV ${settings.ganeshotsav_year}` : 'GANESHOTSAV 2026';
  ctx.fillStyle = '#FBBF24';
  ctx.font = `bold ${18 * scale}px sans-serif`;
  ctx.fillText(`• ${yearStr} •`, canvasWidth / 2, margin + 342 * scale);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 4. LARGE TITLE BADGE ("DONATION RECEIPT / देणगी पावती")
  // -------------------------------------------------------------------------
  const titleY = margin + headerHeight + 36 * scale;
  drawTitlePill(ctx, canvasWidth / 2, titleY, scale);

  // -------------------------------------------------------------------------
  // 5. PAYMENT SUCCESS CARD (RAZORPAY / PHONEPE STYLE AMOUNT DISPLAY)
  // -------------------------------------------------------------------------
  const cardX = margin + 36 * scale;
  const cardW = frameWidth - 72 * scale;
  const amountCardY = titleY + 50 * scale;
  const amountCardH = 220 * scale;

  ctx.save();
  // Card Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 18 * scale;
  ctx.shadowOffsetY = 6 * scale;

  // Card Background (Light Saffron / Ivory Tint)
  ctx.beginPath();
  ctx.roundRect(cardX, amountCardY, cardW, amountCardH, 24 * scale);
  const amountBg = ctx.createLinearGradient(cardX, amountCardY, cardX, amountCardY + amountCardH);
  amountBg.addColorStop(0, '#FFFBEB');
  amountBg.addColorStop(1, '#FEF3C7');
  ctx.fillStyle = amountBg;
  ctx.fill();

  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#FCD34D';
  ctx.stroke();
  ctx.restore();

  // Success Badge Header inside Card
  ctx.save();
  ctx.textAlign = 'center';

  // Green Check Circle
  const checkX = canvasWidth / 2 - 110 * scale;
  const checkY = amountCardY + 45 * scale;
  ctx.beginPath();
  ctx.arc(checkX, checkY, 16 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#059669'; // Emerald Green
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${18 * scale}px sans-serif`;
  ctx.fillText('✓', checkX, checkY + 6 * scale);

  // Payment Status Label
  ctx.fillStyle = '#065F46';
  ctx.font = `bold ${20 * scale}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('DONATION RECEIVED', checkX + 26 * scale, checkY + 7 * scale);

  // Huge Amount Text Display (Dynamic Font Size scaling for large numbers)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#78350F'; // Deep Amber / Maroon
  const formattedAmount = `₹ ${donation.amount.toLocaleString('en-IN')}/-`;
  let amountFontSize = 62 * scale;
  if (formattedAmount.length > 15) {
    amountFontSize = 38 * scale;
  } else if (formattedAmount.length > 12) {
    amountFontSize = 46 * scale;
  } else if (formattedAmount.length > 9) {
    amountFontSize = 52 * scale;
  }
  ctx.font = `900 ${amountFontSize}px "Arial Black", sans-serif`;
  ctx.fillText(formattedAmount, canvasWidth / 2, amountCardY + 130 * scale);

  // Amount in Words
  const englishWords = numberToWordsIN(donation.amount);
  const marathiWords = numberToWordsMarathi(donation.amount);

  ctx.fillStyle = '#92400E';
  ctx.font = `bold ${20 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText(`${marathiWords} (${englishWords})`, canvasWidth / 2, amountCardY + 178 * scale);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 6. DONOR & TRANSACTION DETAILS TABLE / GRID
  // -------------------------------------------------------------------------
  const detailsY = amountCardY + amountCardH + 30 * scale;
  const detailsH = 590 * scale;

  ctx.save();
  // Details Container Card
  ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetY = 4 * scale;

  ctx.beginPath();
  ctx.roundRect(cardX, detailsY, cardW, detailsH, 24 * scale);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.lineWidth = 1.5 * scale;
  ctx.strokeStyle = '#E5E7EB';
  ctx.stroke();
  ctx.restore();

  // Detail Rows
  const rowStartX = cardX + 32 * scale;
  const rowValueX = cardX + cardW - 32 * scale;
  let currentY = detailsY + 55 * scale;
  const rowGap = 72 * scale;

  const detailsList = [
    { label: 'Receipt Number', value: donation.receipt_number || 'GMM-0001', isBold: true },
    { label: 'Date & Time', value: donation.date, isBold: false },
    { label: 'Donor Name', value: donation.donor_name, isBold: true, highlight: true },
    { label: 'Mobile Number', value: donation.phone ? `+91 ${donation.phone}` : 'N/A', isBold: false },
    { label: 'Payment Mode', value: donation.payment_mode || 'Cash', isMode: true },
  ];

  if (donation.notes && donation.notes.trim()) {
    detailsList.push({ label: 'Notes / Purpose', value: donation.notes, isBold: false });
  }

  detailsList.forEach((item, idx) => {
    // Divider line between rows
    if (idx > 0) {
      ctx.beginPath();
      ctx.moveTo(rowStartX, currentY - 32 * scale);
      ctx.lineTo(rowValueX, currentY - 32 * scale);
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#6B7280';
    ctx.font = `600 ${22 * scale}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(item.label, rowStartX, currentY);

    // Value
    ctx.textAlign = 'right';
    if (item.highlight) {
      ctx.fillStyle = '#111827';
      ctx.font = `900 ${26 * scale}px "Noto Sans Devanagari", sans-serif`;
    } else if (item.isBold) {
      ctx.fillStyle = '#1F2937';
      ctx.font = `bold ${24 * scale}px "Courier New", monospace, sans-serif`;
    } else if (item.isMode) {
      ctx.fillStyle = '#D97706'; // Saffron
      ctx.font = `bold ${22 * scale}px sans-serif`;
    } else {
      ctx.fillStyle = '#374151';
      ctx.font = `600 ${22 * scale}px sans-serif`;
    }

    ctx.fillText(item.value, rowValueX, currentY);

    currentY += rowGap;
  });

  // -------------------------------------------------------------------------
  // 7. BLESSINGS & THANK YOU FOOTER CARD
  // -------------------------------------------------------------------------
  const footerCardY = detailsY + detailsH + 28 * scale;
  const footerCardH = 260 * scale;

  ctx.save();
  // Maroon & Gold Footer Container
  ctx.beginPath();
  ctx.roundRect(cardX, footerCardY, cardW, footerCardH, 24 * scale);
  const footerBg = ctx.createLinearGradient(cardX, footerCardY, cardX + cardW, footerCardY + footerCardH);
  footerBg.addColorStop(0, '#590211');
  footerBg.addColorStop(1, '#800020');
  ctx.fillStyle = footerBg;
  ctx.fill();

  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  // Thank You Message
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.font = `bold ${22 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('देणगी दिल्याबद्दल धन्यवाद • Thank you for your contribution.', canvasWidth / 2, footerCardY + 48 * scale);

  // Large Devotional Blessing Header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${32 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('🙏 गणपती बाप्पा मोरया 🙏', canvasWidth / 2, footerCardY + 98 * scale);

  // Divider inside footer
  ctx.beginPath();
  ctx.moveTo(cardX + 40 * scale, footerCardY + 130 * scale);
  ctx.lineTo(cardX + cardW - 40 * scale, footerCardY + 130 * scale);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Bottom Signature & Official Seal Stamp Row
  const sealX = cardX + 80 * scale;
  const sealY = footerCardY + 195 * scale;
  drawMandalSeal(ctx, sealX, sealY, scale);

  // Authorized Signature Line on Right
  const sigX = cardX + cardW - 120 * scale;
  const sigY = footerCardY + 185 * scale;

  // Signature Stylized Script
  ctx.font = `italic bold ${24 * scale}px "Brush Script MT", cursive, sans-serif`;
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('Ganraj Mandal Auth', sigX, sigY - 12 * scale);

  ctx.beginPath();
  ctx.moveTo(sigX - 80 * scale, sigY);
  ctx.lineTo(sigX + 80 * scale, sigY);
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.font = `500 ${16 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillStyle = '#E5E7EB';
  ctx.fillText('पैसे घेणाऱ्याची सही / Authorized Sig', sigX, sigY + 22 * scale);

  ctx.restore();

  // -------------------------------------------------------------------------
  // 8. VERY BOTTOM LEGAL / VERIFICATION TEXT
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9CA3AF';
  ctx.font = `500 ${16 * scale}px sans-serif`;
  ctx.fillText(
    'This is an official computer-generated digital donation receipt.',
    canvasWidth / 2,
    canvasHeight - margin - 14 * scale
  );
  ctx.restore();

  return canvas;
}

/**
 * Draws a soft decorative watermarked Ganesha emblem in the background
 */
function drawBackgroundWatermark(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = '#800020';

  ctx.beginPath();
  ctx.arc(x, y, 260 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Inner Mandala Ring
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 6 * scale;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws an ornate Gold Circular Ganesha Badge for the Header
 */
function drawGaneshaBadge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, scale: number) {
  ctx.save();

  // Outer Gold Glow
  ctx.shadowColor = '#FBBF24';
  ctx.shadowBlur = 15 * scale;

  // Badge Circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const badgeGrad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  badgeGrad.addColorStop(0, '#FFF59D');
  badgeGrad.addColorStop(0.5, '#F59E0B');
  badgeGrad.addColorStop(1, '#B45309');
  ctx.fillStyle = badgeGrad;
  ctx.fill();

  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // Ganesha Symbol in Badge Center
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4A000E';
  ctx.font = `900 ${r * 1.1}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('ॐ', x, y + r * 0.38);

  ctx.restore();
}

/**
 * Draws the "DONATION RECEIPT / देणगी पावती" Title Pill Badge
 */
function drawTitlePill(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const pillW = 420 * scale;
  const pillH = 58 * scale;
  const pillX = x - pillW / 2;
  const pillY = y - pillH / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetY = 4 * scale;

  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);

  const pillGrad = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0);
  pillGrad.addColorStop(0, '#590211');
  pillGrad.addColorStop(0.5, '#800020');
  pillGrad.addColorStop(1, '#590211');
  ctx.fillStyle = pillGrad;
  ctx.fill();

  ctx.lineWidth = 2.5 * scale;
  ctx.strokeStyle = '#FBBF24';
  ctx.stroke();

  // Title Text
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${22 * scale}px "Noto Sans Devanagari", sans-serif`;
  ctx.fillText('DONATION RECEIPT • देणगी पावती', x, y + 7 * scale);

  ctx.restore();
}

/**
 * Draws the Mandal Official Stamp Seal
 */
function drawMandalSeal(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.85;

  ctx.beginPath();
  ctx.arc(x, y, 32 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 27 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText('GANRAJ', x, y - 6 * scale);
  ctx.fillText('MANDAL', x, y + 6 * scale);
  ctx.fillText('SEAL', x, y + 16 * scale);

  ctx.restore();
}
