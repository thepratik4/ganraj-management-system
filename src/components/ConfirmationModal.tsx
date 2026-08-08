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
    if (pin.trim() === '2020') {
      setPinError(false);
      onConfirm();
      onClose();
    } else {
      setPinError(true);
      setPin('');
      pinInputRef.current?.focus();
    }
  };

  const accentColor = isDanger ? 'var(--color-expense)' : 'var(--color-gold)';
  const accentBg = isDanger ? 'var(--color-expense-light)' : 'var(--color-gold-light)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-5 relative"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: accentBg, color: accentColor }}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3
            className="text-base font-bold leading-snug pr-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
          >
            {title}
          </h3>
        </div>

        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>

        {/* PIN Entry */}
        <form onSubmit={handleConfirmAction} className="mb-4 space-y-2">
          <label
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Lock className="w-3 h-3" style={{ color: accentColor }} />
            {isDanger ? 'Enter Delete Password' : 'Enter Edit Password'}
          </label>
          <input
            ref={pinInputRef}
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (pinError) setPinError(false);
            }}
            placeholder="Enter PIN"
            className="w-full text-sm font-bold text-center tracking-widest"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: `1.5px solid ${pinError ? 'var(--color-expense)' : 'var(--color-border)'}`,
              backgroundColor: pinError ? 'var(--color-expense-light)' : 'var(--bg-subtle)',
              color: pinError ? 'var(--color-expense)' : 'var(--color-text)',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {pinError && (
            <p className="text-[11px] font-bold text-center animate-shake" style={{ color: 'var(--color-expense)' }}>
              ⚠️ Incorrect Password! Contact pratik.
            </p>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmAction}
            className="flex-1 py-2.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: isDanger ? 'var(--color-expense)' : 'var(--color-primary)' }}
          >
            <KeyRound className="w-3.5 h-3.5" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
