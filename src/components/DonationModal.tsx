import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, CheckCircle2, AlertCircle, Banknote, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Donation, PaymentMode } from '../types';
import { isValidMobileNumber, cleanPhoneNumber } from '../utils/currency';
import { StorageService } from '../utils/storage';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (donation: Donation) => void;
  editingDonation?: Donation | null;
  existingDonations?: Donation[];
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDonation,
  existingDonations = [],
}) => {
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [networkError, setNetworkError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingDonation) {
        setDonorName(editingDonation.donor_name);
        setPhone(editingDonation.phone);
        setAmount(String(editingDonation.amount));
        setPaymentMode(editingDonation.payment_mode);
        setDate(editingDonation.date);
        setNotes(editingDonation.notes || '');
        setReceiptNumber(editingDonation.receipt_number);
      } else {
        setDonorName('');
        setPhone('');
        setAmount('');
        setPaymentMode('Cash');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setReceiptNumber(StorageService.getNextReceiptNumber(existingDonations));
      }
      setPhoneError('');
      setNameError('');
      setAmountError('');
      setNetworkError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingDonation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      setNetworkError('No internet connection. Please connect to the internet to save and generate receipt.');
      return;
    }
    setNetworkError('');

    let valid = true;

    if (!donorName.trim()) {
      setNameError('Please enter donor name');
      valid = false;
    } else {
      setNameError('');
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid amount');
      valid = false;
    } else {
      setAmountError('');
    }

    const cleanedPhone = cleanPhoneNumber(phone);
    if (phone.trim() && !isValidMobileNumber(cleanedPhone)) {
      setPhoneError('Mobile number must be exactly 10 digits');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!valid) return;

    const receiptDigits = receiptNumber.replace(/\D/g, '') || String(Date.now());
    const id = editingDonation ? editingDonation.id : `don-${parseInt(receiptDigits, 10)}`;

    const newDonation: Donation = {
      id,
      receipt_number: receiptNumber,
      donor_name: donorName.trim(),
      phone: cleanedPhone,
      amount: numericAmount,
      payment_mode: paymentMode,
      date,
      notes: notes.trim(),
      created_at: editingDonation
        ? editingDonation.created_at
        : new Date().toISOString(),
    };

    // Trigger celebratory confetti burst on successful donation save!
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B8960C', '#C9A84C', '#111111'],
      });
    } catch {
      // ignore
    }

    onSave(newDonation);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--bg-subtle)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-modal)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
            >
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-lg font-bold leading-tight"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
              >
                {editingDonation ? 'Edit Donation' : 'Add Donation'}
              </h3>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-gold)' }}>
                Receipt No: {receiptNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* NAME */}
          <div>
            <label style={labelStyle}>Name / Origin <span style={{ color: 'var(--color-expense)' }}>*</span></label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
            {nameError && (
              <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--color-expense)' }}>
                <AlertCircle className="w-3.5 h-3.5" />{nameError}
              </p>
            )}
          </div>

          {/* AMOUNT */}
          <div>
            <label style={labelStyle}>Amount <span style={{ color: 'var(--color-expense)' }}>*</span></label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-serif)' }}
              >
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: '36px', fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            {amountError && (
              <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--color-expense)' }}>
                <AlertCircle className="w-3.5 h-3.5" />{amountError}
              </p>
            )}
          </div>

          {/* DATE & PHONE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Mobile (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '40px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
              </div>
              {phoneError && (
                <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--color-expense)' }}>
                  <AlertCircle className="w-3 h-3" />{phoneError}
                </p>
              )}
            </div>
          </div>

          {/* PAYMENT MODE */}
          <div>
            <label style={labelStyle}>Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Cash', 'Online'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: paymentMode === mode ? 'var(--color-primary)' : 'var(--bg-subtle)',
                    color: paymentMode === mode ? '#fff' : 'var(--color-text-secondary)',
                    border: paymentMode === mode ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {mode === 'Cash' ? <Banknote className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label style={labelStyle}>Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Aarti sponsorship"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>

          {/* Network Error */}
          {networkError && (
            <div
              className="p-3 rounded-xl flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-expense-light)', border: '1px solid #e0b4b4', color: 'var(--color-expense)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{networkError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ flex: 2, backgroundColor: 'var(--color-primary)', color: '#fff' }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-gold-muted)' }} />
              {editingDonation ? 'Update Donation' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
