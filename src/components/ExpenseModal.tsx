import React, { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle2, AlertCircle, Upload, Trash2, Loader2 } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMode } from '../types';
import { isValidMobileNumber, cleanPhoneNumber } from '../utils/currency';
import { StorageService } from '../utils/storage';
import { DatabaseService } from '../services/db';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editingExpense?: Expense | null;
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
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Decoration');
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billImage, setBillImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [expenseNumber, setExpenseNumber] = useState('');

  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [phoneError, setPhoneError] = useState('');

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
        setPaymentMode('Cash');
        setDate(new Date().toISOString().split('T')[0]);
        setBillImage('');
        setNotes('');
        setExpenseNumber(StorageService.getNextExpenseNumber());
      }
      setTitleError('');
      setAmountError('');
      setPhoneError('');
    }
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

    const newExpense: Expense = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                Expense No: {expenseNumber}
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
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expense Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stage Decoration & Floral Backdrops"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            {titleError && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {titleError}
              </p>
            )}
          </div>

          {/* Category & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

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
                  placeholder="2500"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              {amountError && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {amountError}
                </p>
              )}
            </div>
          </div>

          {/* Payment Mode & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      : 'text-slate-600 dark:text-slate-400'
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
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📲 Online
                </button>
              </div>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Vendor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Name (Optional)
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Shivaji Decorators"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Mobile (Optional)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                placeholder="9822998877"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {phoneError && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {phoneError}
                </p>
              )}
            </div>
          </div>

          {/* Bill Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bill / Receipt Image (Optional)
            </label>
            {billImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-40 bg-slate-900 flex items-center justify-center">
                <img src={billImage} alt="Bill Preview" className="max-h-40 object-contain" />
                <button
                  type="button"
                  onClick={() => setBillImage('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-all"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-rose-500 dark:hover:border-rose-400 bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Click to upload bill image
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG or WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
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
              placeholder="e.g. Paid advance, remaining balance due on Day 5"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Receipt...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
