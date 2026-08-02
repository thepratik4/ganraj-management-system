import React from 'react';
import { X, Download } from 'lucide-react';

interface BillImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BillImageModal: React.FC<BillImageModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-4 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
            Expense Bill Image
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
          <img
            src={imageUrl}
            alt="Uploaded Bill"
            className="max-h-[70vh] w-auto object-contain"
          />
        </div>

        <div className="mt-3 flex justify-end">
          <a
            href={imageUrl}
            download="Expense_Bill.png"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Bill</span>
          </a>
        </div>
      </div>
    </div>
  );
};
