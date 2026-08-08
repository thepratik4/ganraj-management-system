import React, { useState } from 'react';
import {
  Search,
  HeartHandshake,
  Receipt,
  PlusCircle,
  MinusCircle,
  Trash2,
  Edit2,
  Eye,
  FileImage,
  Banknote,
  QrCode,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Transaction, PaymentMode } from '../types';
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

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const txDate = new Date(dateStr);
  const diffDays = Math.floor((today.getTime() - txDate.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return txDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
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
  const [showFilters, setShowFilters] = useState(false);

  // Filter & Search Logic (unchanged)
  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterMode !== 'all' && tx.payment_mode !== filterMode) return false;
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

  // Group by date
  const grouped: Record<string, { txs: Transaction[]; dayTotal: number }> = {};
  filtered.forEach((tx) => {
    const label = formatDateLabel(tx.date);
    if (!grouped[label]) grouped[label] = { txs: [], dayTotal: 0 };
    grouped[label].txs.push(tx);
    grouped[label].dayTotal += tx.type === 'donation' ? tx.amount : -tx.amount;
  });

  return (
    <div className="space-y-4 pb-24 animate-fadeup">
      {/* ── Header ────────────────────────────────────── */}
      <div>
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
        >
          Transactions
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {filtered.length} of {transactions.length} records
        </p>
      </div>

      {/* ── Search Bar ────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{
            color: showFilters ? 'var(--color-gold)' : 'var(--color-text-secondary)',
            backgroundColor: showFilters ? 'var(--color-gold-light)' : 'transparent',
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter
        </button>
      </div>

      {/* ── Filter Chips (collapsible) ─────────────── */}
      {showFilters && (
        <div
          className="rounded-2xl p-3.5 space-y-3 animate-fadeup"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="section-label mr-1">Type:</span>
            {(['all', 'donation', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: filterType === t ? 'var(--color-primary)' : 'var(--bg-subtle)',
                  color: filterType === t ? '#fff' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: filterType === t ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                {t === 'all' ? 'All' : t === 'donation' ? 'Donations' : 'Expenses'}
              </button>
            ))}
          </div>
          {/* Mode filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="section-label mr-1">Mode:</span>
            {(['all', 'Cash', 'Online'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m as 'all' | PaymentMode)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: filterMode === m ? 'var(--color-primary)' : 'var(--bg-subtle)',
                  color: filterMode === m ? '#fff' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: filterMode === m ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                <span className="inline-flex items-center gap-1">
                  {m === 'Cash' && <Banknote className="w-3 h-3" />}
                  {m === 'Online' && <QrCode className="w-3 h-3" />}
                  {m === 'all' ? 'All Modes' : m}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Buttons ───────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={onOpenAddDonation}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <PlusCircle className="w-4 h-4" />
          Donation
        </button>
        <button
          onClick={onOpenAddExpense}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--color-text)', border: '1.5px solid var(--color-gold-muted)' }}
        >
          <MinusCircle className="w-4 h-4" style={{ color: 'var(--color-expense)' }} />
          Expense
        </button>
      </div>

      {/* ── Transaction Groups ────────────────────────── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)' }}
        >
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No matching transactions found.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, { txs, dayTotal }]) => (
          <div key={dateLabel} className="space-y-2">
            {/* Date group header */}
            <div className="flex items-center justify-between px-1">
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--color-text)' }}
              >
                {dateLabel}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: dayTotal >= 0 ? 'var(--color-gold)' : 'var(--color-expense)' }}
              >
                {dayTotal >= 0 ? '+' : ''}{formatINR(dayTotal)}
              </span>
            </div>

            {/* Transaction cards */}
            {txs.map((tx) => {
              const isDonation = tx.type === 'donation';
              return (
                <div
                  key={tx.id}
                  className="rounded-2xl p-3.5 flex items-center gap-3 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
                >
                  {/* Avatar */}
                  <div
                    className="tx-avatar shrink-0"
                    style={{
                      backgroundColor: isDonation ? 'var(--color-gold-light)' : 'var(--color-expense-light)',
                      color: isDonation ? 'var(--color-gold)' : 'var(--color-expense)',
                    }}
                  >
                    {isDonation ? <HeartHandshake className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {tx.titleOrName}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          backgroundColor: isDonation ? 'var(--color-gold-light)' : 'var(--color-expense-light)',
                          color: isDonation ? 'var(--color-gold)' : 'var(--color-expense)',
                        }}
                      >
                        {tx.number}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {tx.payment_mode === 'Cash' ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <QrCode className="w-3 h-3" />
                      )}
                      <span>{tx.payment_mode}</span>
                      {tx.category && (
                        <><span>·</span><span style={{ color: 'var(--color-gold)' }}>{tx.category}</span></>
                      )}
                    </p>
                    {tx.notes && (
                      <p className="text-[11px] italic mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {tx.notes}
                      </p>
                    )}
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className="text-base font-bold"
                      style={{ color: isDonation ? 'var(--color-gold)' : 'var(--color-expense)' }}
                    >
                      {isDonation ? '+' : '-'}{formatINR(tx.amount)}
                    </span>

                    {/* Action row */}
                    <div className="flex items-center gap-1">
                      {isDonation && (
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="p-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
                          title="View Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isDonation && (tx.originalItem as any).bill_image && (
                        <button
                          onClick={() => onViewBillImage((tx.originalItem as any).bill_image)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                          title="View Bill"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: 'var(--color-expense)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-expense-light)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};
