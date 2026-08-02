import React, { useState } from 'react';
import {
  Search,
  Filter,
  HeartHandshake,
  Receipt,
  PlusCircle,
  MinusCircle,
  Trash2,
  Edit2,
  Eye,
  FileImage,
  Calendar,
  Banknote,
  QrCode,
  X,
  Plus,
} from 'lucide-react';
import { Transaction, PaymentMode, ExpenseCategory } from '../types';
import { formatINR } from '../utils/currency';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddDonation: () => void;
  onOpenAddExpense: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onViewReceipt: (tx: Transaction) => void;
  onViewBillImage: (imageUrl: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddDonation,
  onOpenAddExpense,
  onEditTransaction,
  onDeleteTransaction,
  onViewReceipt,
  onViewBillImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'donation' | 'expense'>('all');
  const [filterMode, setFilterMode] = useState<'all' | PaymentMode>('all');

  // Filter & Search Logic
  const filtered = transactions.filter((tx) => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false;

    // Mode filter
    if (filterMode !== 'all' && tx.payment_mode !== filterMode) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.titleOrName.toLowerCase().includes(q);
      const matchNumber = tx.number.toLowerCase().includes(q);
      const matchPhone = tx.phone ? tx.phone.includes(q) : false;
      const matchCategory = tx.category ? tx.category.toLowerCase().includes(q) : false;
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;

      return matchName || matchNumber || matchPhone || matchCategory || matchNotes;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            Transactions History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} of {transactions.length} records found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddDonation}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Donation</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all"
          >
            <MinusCircle className="w-4 h-4" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Phone, Receipt/Expense #, or Category..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('donation')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === 'donation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => setFilterMode('Cash')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterMode === 'Cash'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => setFilterMode('Online')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterMode === 'Online'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              📲 Online
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List Stream */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
          No matching transactions found. Try adjusting your search query or filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => {
            const isDonation = tx.type === 'donation';
            return (
              <div
                key={tx.id}
                className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDonation
                    ? 'bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDonation
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isDonation ? (
                      <HeartHandshake className="w-5 h-5" />
                    ) : (
                      <Receipt className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base break-words">
                        {tx.titleOrName}
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md shrink-0 ${
                          isDonation
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                        }`}
                      >
                        {tx.number}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-medium shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {tx.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium shrink-0">
                        {tx.payment_mode === 'Cash' ? (
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <QrCode className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        {tx.payment_mode}
                      </span>
                      {tx.phone && (
                        <>
                          <span>•</span>
                          <span className="font-medium shrink-0">📞 +91 {tx.phone}</span>
                        </>
                      )}
                      {tx.category && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">
                            {tx.category}
                          </span>
                        </>
                      )}
                    </div>

                    {tx.notes && (
                      <p className="text-xs text-slate-400 italic mt-1 break-words">
                        Note: {tx.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 gap-2 shrink-0 min-w-0">
                  <span
                    className={`text-base sm:text-lg font-black truncate max-w-[160px] sm:max-w-none ${
                      isDonation ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isDonation ? '+' : '-'} {formatINR(tx.amount)}
                  </span>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Donation Receipt Button */}
                    {isDonation && (
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-200 text-xs font-bold transition-all flex items-center gap-1"
                        title="View & Share Receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Receipt</span>
                      </button>
                    )}

                    {/* Expense Bill Image Button */}
                    {!isDonation && (tx.originalItem as any).bill_image && (
                      <button
                        onClick={() => onViewBillImage((tx.originalItem as any).bill_image)}
                        className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-200 text-xs font-bold transition-all flex items-center gap-1"
                        title="View Bill Image"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Bill</span>
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteTransaction(tx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
