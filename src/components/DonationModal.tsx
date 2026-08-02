import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Donation, PaymentMode } from '../types';
import { isValidMobileNumber, cleanPhoneNumber } from '../utils/currency';
import { StorageService } from '../utils/storage';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (donation: Donation) => void;
  editingDonation?: Donation | null;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDonation,
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
        setReceiptNumber(StorageService.getNextReceiptNumber());
      }
      setPhoneError('');
      setNameError('');
      setAmountError('');
    }
  }, [isOpen, editingDonation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    const newDonation: Donation = {
      id: editingDonation ? editingDonation.id : `don-${Date.now()}`,
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
        colors: ['#E65100', '#880E4F', '#D4AF37'],
      });
    } catch {
      // ignore
    }

    onSave(newDonation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {editingDonation ? 'Edit Donation (Vargani)' : 'Add Donation (Vargani)'}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                Receipt No: {receiptNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Donor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Ramesh Patil / Sharma Family"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {nameError && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {nameError}
              </p>
            )}
          </div>

          {/* Amount & Payment Mode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5001"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              {amountError && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {amountError}
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMode('Cash')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'Cash'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('Online')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'Online'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📲 Online
                </button>
              </div>
            </div>
          </div>

          {/* Phone Number & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              {phoneError && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {phoneError}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Aarti sponsorship, Aarti Vargani"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingDonation ? 'Update Donation' : 'Save & Generate Receipt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
