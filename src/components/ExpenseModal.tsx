import React, { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle2, AlertCircle, Upload, Trash2, Loader2, Camera, Banknote, QrCode } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMode } from '../types';
import { isValidMobileNumber, cleanPhoneNumber } from '../utils/currency';
import { StorageService } from '../utils/storage';
import { DatabaseService } from '../services/db';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editingExpense?: Expense | null;
  existingExpenses?: Expense[];
}

const CATEGORIES: ExpenseCategory[] = [
  'Decoration',
  'Lighting',
  'Flowers',
  'Food',
  'Prasad',
  'Sound',
  'Pandal',
  'Permission',
  'Misc',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  existingExpenses = [],
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Decoration');
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Online');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billImage, setBillImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [expenseNumber, setExpenseNumber] = useState('');

  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [networkError, setNetworkError] = useState('');

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.currentTarget;
    setTimeout(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setIsUploading(false);
      if (editingExpense) {
        setTitle(editingExpense.title);
        setCategory(editingExpense.category);
        setVendorName(editingExpense.vendor_name || '');
        setVendorPhone(editingExpense.vendor_phone || '');
        setAmount(String(editingExpense.amount));
        setPaymentMode(editingExpense.payment_mode);
        setDate(editingExpense.date);
        setBillImage(editingExpense.bill_image || '');
        setNotes(editingExpense.notes || '');
        setExpenseNumber(editingExpense.expense_number);
      } else {
        setTitle('');
        setCategory('Decoration');
        setVendorName('');
        setVendorPhone('');
        setAmount('');
        setPaymentMode('Online');
        setDate(new Date().toISOString().split('T')[0]);
        setBillImage('');
        setNotes('');
        setExpenseNumber(StorageService.getNextExpenseNumber(existingExpenses));
      }
      setTitleError('');
      setAmountError('');
      setPhoneError('');
      setNetworkError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingExpense]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      setNetworkError('No internet connection. Please connect to the internet to save expense.');
      return;
    }
    setNetworkError('');

    let valid = true;

    if (!title.trim()) {
      setTitleError('Please enter expense title');
      valid = false;
    } else {
      setTitleError('');
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid amount');
      valid = false;
    } else {
      setAmountError('');
    }

    const cleanedVendorPhone = cleanPhoneNumber(vendorPhone);
    if (vendorPhone.trim() && !isValidMobileNumber(cleanedVendorPhone)) {
      setPhoneError('Vendor mobile must be 10 digits');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!valid) return;

    setIsUploading(true);
    let finalBillUrl = billImage;

    if (selectedFile) {
      try {
        finalBillUrl = await DatabaseService.uploadBillImage(selectedFile);
      } catch (err) {
        console.error('Failed uploading bill to Supabase storage:', err);
      }
    }

    const expenseDigits = expenseNumber.replace(/\D/g, '') || String(Date.now());
    const id = editingExpense ? editingExpense.id : `exp-${parseInt(expenseDigits, 10)}`;

    const newExpense: Expense = {
      id,
      expense_number: expenseNumber,
      title: title.trim(),
      category,
      vendor_name: vendorName.trim(),
      vendor_phone: cleanedVendorPhone,
      amount: numericAmount,
      payment_mode: paymentMode,
      bill_image: finalBillUrl,
      date,
      notes: notes.trim(),
      created_at: editingExpense
        ? editingExpense.created_at
        : new Date().toISOString(),
    };

    setIsUploading(false);
    onSave(newExpense);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl relative overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[90vh]"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-expense-light)', color: 'var(--color-expense)' }}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-lg font-bold leading-tight"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
              >
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-expense)' }}>
                Expense No: {expenseNumber}
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
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 flex-1 overflow-y-auto pb-10 sm:pb-6">
          {/* TITLE */}
          <div>
            <label style={labelStyle}>Expense Title <span style={{ color: 'var(--color-expense)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stage Decoration & Floral Backdrops"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; handleInputFocus(e); }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            {titleError && (
              <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--color-expense)' }}>
                <AlertCircle className="w-3.5 h-3.5" />{titleError}
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
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; handleInputFocus(e); }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            {amountError && (
              <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--color-expense)' }}>
                <AlertCircle className="w-3.5 h-3.5" />{amountError}
              </p>
            )}
          </div>

          {/* DATE & CATEGORY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; handleInputFocus(e); }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => handleInputFocus(e)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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

          {/* VENDOR DETAILS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Vendor Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Shivaji Decorators"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; handleInputFocus(e); }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Vendor Mobile</label>
              <input
                type="tel"
                maxLength={10}
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                placeholder="9822998877"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; handleInputFocus(e); }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
              {phoneError && (
                <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--color-expense)' }}>
                  <AlertCircle className="w-3 h-3" />{phoneError}
                </p>
              )}
            </div>
          </div>

          {/* BILL IMAGE UPLOAD */}
          <div>
            <label style={labelStyle}>Attachment (Optional)</label>
            {billImage ? (
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--color-border)', maxHeight: '140px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <img src={billImage} alt="Bill Preview" className="max-h-36 object-contain" />
                <button
                  type="button"
                  onClick={() => setBillImage('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full transition-all"
                  style={{ backgroundColor: 'var(--color-expense)', color: '#fff' }}
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center py-6 rounded-2xl cursor-pointer transition-colors"
                style={{
                  border: '1.5px dashed var(--color-border)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-gold-muted)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <Camera className="w-7 h-7 mb-2" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Tap to upload receipt</span>
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>PNG, JPG or WEBP · Max 10MB</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* NOTES */}
          <div>
            <label style={labelStyle}>Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid advance, remaining due on Day 5"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; handleInputFocus(e); }}
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
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="py-3 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ flex: 2, backgroundColor: 'var(--color-primary)', color: '#fff' }}
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-gold-muted)' }} />
                {editingExpense ? 'Update Expense' : 'Confirm Entry'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
