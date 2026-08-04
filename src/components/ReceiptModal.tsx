import React, { useMemo, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Donation, MandalSettings } from '../types';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import { drawReceiptCanvas } from '../utils/receiptCanvas';

interface ReceiptModalProps {
  donation: Donation | null;
  settings: MandalSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  donation,
  settings,
  isOpen,
  onClose,
}) => {
  const [isSharing, setIsSharing] = useState(false);

  // High-res preview image generated on Canvas
  const receiptImgUrl = useMemo(() => {
    if (!donation) return '';
    const canvas = drawReceiptCanvas(donation, settings, 1200, 780);
    return canvas.toDataURL('image/png');
  }, [donation, settings]);

  if (!isOpen || !donation) return null;

  // Download High-Resolution PNG Image (Primary format)
  const handleDownloadImage = () => {
    const canvas = drawReceiptCanvas(donation, settings, 1200, 780);
    const link = document.createElement('a');
    link.download = `Receipt_${donation.receipt_number}_${donation.donor_name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Web Share API Image sharing directly (Android / WhatsApp / iOS)
  const handleShareImage = async () => {
    setIsSharing(true);
    try {
      const canvas = drawReceiptCanvas(donation, settings, 1200, 780);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        const fileName = `Receipt_${donation.receipt_number}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `Receipt #${donation.receipt_number} - ${settings.mandal_name || 'Ganraj Mitra Mandal'}`,
              text: `Official Receipt #${donation.receipt_number} from ${settings.mandal_name || 'Ganraj Mitra Mandal'}.\nDonor: ${donation.donor_name}\nAmount: ₹${donation.amount.toLocaleString('en-IN')}\n\nGanpati Bappa Morya! 🙏`,
              files: [file],
            });
            setIsSharing(false);
            return;
          } catch (err) {
            console.log('Native Web Share dismissed or failed:', err);
          }
        }

        // Fallback for browsers without direct file sharing
        handleDownloadImage();
        handleWhatsAppShare();
        setIsSharing(false);
      }, 'image/png');
    } catch {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const donorName = donation.donor_name;
    const amountStr = donation.amount.toLocaleString('en-IN');
    const mandalName = settings.mandal_name || 'Ganraj Mitra Mandal';

    const message = `Hello ${donorName},\nThank you for contributing ₹${amountStr} to ${mandalName}.\nPlease find your official donation receipt attached.\nReceipt No: ${donation.receipt_number}\nDate: ${donation.date}\n\nGanpati Bappa Morya 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNum = donation.phone ? donation.phone.replace(/\D/g, '') : '';

    if (phoneNum.length === 10) {
      window.open(`https://wa.me/91${phoneNum}?text=${encodedMessage}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
  };

  // Optional PDF generation
  const handleDownloadPDF = () => {
    const pdf = generateReceiptPDF(donation, settings);
    pdf.save(`Donation_Receipt_${donation.receipt_number}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${donation.receipt_number}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; }
            img { max-width: 100%; height: auto; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <img src="${receiptImgUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 border border-slate-200 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪔</span>
            <div>
              <span className="font-extrabold text-sm text-amber-900 block leading-tight">
                Digital Donation Receipt
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Receipt #{donation.receipt_number} • Ganraj Mitra Mandal
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Receipt High-Res Image Preview */}
        <div className="mt-4 my-2 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg bg-amber-950 relative group">
          <img
            src={receiptImgUrl}
            alt="Official Ganraj Mitra Mandal Donation Receipt"
            className="w-full h-auto block object-contain"
          />
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>High-Res PNG Template</span>
          </div>
        </div>

        {/* Primary Action Buttons (Image Sharing & PNG Download) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Share PNG Image via Web Share API */}
          <button
            onClick={handleShareImage}
            disabled={isSharing}
            className="flex items-center justify-center p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all gap-2 shadow-md active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            <span>{isSharing ? 'Preparing Image...' : 'Share Receipt Image (WhatsApp)'}</span>
          </button>

          {/* Download PNG Image */}
          <button
            onClick={handleDownloadImage}
            className="flex items-center justify-center p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm transition-all gap-2 shadow-md active:scale-95"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Download Receipt PNG</span>
          </button>
        </div>

        {/* Secondary Options (Optional PDF Download & Print) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Need a document file?
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Image</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Download PDF (Optional)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

