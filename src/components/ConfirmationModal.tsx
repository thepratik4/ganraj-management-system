import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, KeyRound, Lock } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  isDanger = true,
  onClose,
  onConfirm,
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setPinError(false);
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pin.trim() === '1010') {
      setPinError(false);
      onConfirm();
      onClose();
    } else {
      setPinError(true);
      setPin('');
      pinInputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-3 rounded-2xl ${
              isDanger
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
            {title}
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          {message}
        </p>

        {/* Security Password Box */}
        <form onSubmit={handleConfirmAction} className="mb-5 space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Lock className={`w-3 h-3 ${isDanger ? 'text-rose-500' : 'text-amber-500'}`} />
            <span>{isDanger ? 'Enter Delete Password :' : 'Enter Edit Password :'}</span>
          </label>
          <div className="relative">
            <input
              ref={pinInputRef}
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (pinError) setPinError(false);
              }}
              placeholder="Enter PIN "
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-black text-center tracking-widest focus:outline-none transition-all ${
                pinError
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500'
              }`}
            />
          </div>
          {pinError && (
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 text-center animate-shake">
              ⚠️ Incorrect Password! Please contact pratik.
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmAction}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-xs transition-all active:scale-95 flex items-center gap-1.5 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
