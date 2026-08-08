import React from 'react';
import {
  PlusCircle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
  Receipt,
  HeartHandshake,
  QrCode,
  Banknote,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { FinancialSummary, Transaction, Donation, Expense } from '../types';
import { formatINR } from '../utils/currency';

interface DashboardProps {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  onOpenAddDonation: () => void;
  onOpenAddExpense: () => void;
  onViewAllTransactions: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  expenses: Expense[];
  donations: Donation[];
}

// Format relative date label
function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const txDate = new Date(dateStr);
  const diffDays = Math.floor((today.getTime() - txDate.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return txDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  recentTransactions,
  onOpenAddDonation,
  onOpenAddExpense,
  onViewAllTransactions,
  onSelectTransaction,
  expenses,
}) => {
  const isPositiveBalance = summary.currentBalance >= 0;
  const totalPayments = summary.totalCollection;

  // Chart Data: Collection vs Expenses bar chart
  const barData = [
    { name: 'Collection', Cash: summary.cashCollection, Online: summary.onlineCollection },
    { name: 'Expenses', Cash: summary.cashExpenses, Online: summary.onlineExpenses },
  ];

  // Expense category breakdown for pie
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Mini sparkline data for collection card
  const collectionSparkData = recentTransactions
    .filter(t => t.type === 'donation')
    .slice(0, 6)
    .reverse()
    .map((t, i) => ({ i, v: t.amount }));

  const expenseSparkData = recentTransactions
    .filter(t => t.type === 'expense')
    .slice(0, 6)
    .reverse()
    .map((t, i) => ({ i, v: t.amount }));

  // Payment method percentages
  const onlinePct = totalPayments > 0 ? Math.round((summary.onlineCollection / totalPayments) * 100) : 0;
  const cashPct = totalPayments > 0 ? Math.round((summary.cashCollection / totalPayments) * 100) : 0;

  const CHART_COLORS = {
    collection: '#B8960C',
    expense: '#C0392B',
    cash: '#C9A84C',
    online: '#111111',
  };

  const PIE_COLORS = ['#B8960C', '#111111', '#C0392B', '#C9A84C', '#888888', '#444444', '#D4B44A', '#666'];

  return (
    <div className="space-y-4 pb-24 animate-fadeup">

      {/* ── Balance Hero ──────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 pt-6 text-center relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        {/* subtle decorative circle */}
        <div
          className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-5 pointer-events-none"
          style={{ backgroundColor: 'var(--color-gold)' }}
        />

        <p className="section-label mb-1">Total Net Balance</p>
        <p
          className="balance-display text-5xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-serif)',
            color: isPositiveBalance ? 'var(--color-primary)' : 'var(--color-expense)',
          }}
        >
          {formatINR(summary.currentBalance)}
        </p>

        {/* Gold summary chip */}
        <div
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
        >
          <TrendingUp className="w-3 h-3" />
          <span>Collection {formatINR(summary.totalCollection)} · Expenses {formatINR(summary.totalExpenses)}</span>
        </div>

        {/* Cash / Online split */}
        <div className="flex justify-center gap-6 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="text-center">
            <p className="section-label mb-0.5">Cash Balance</p>
            <p className="text-base font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
              {formatINR(summary.cashBalance)}
            </p>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
          <div className="text-center">
            <p className="section-label mb-0.5">Online Balance</p>
            <p className="text-base font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
              {formatINR(summary.onlineBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenAddDonation}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-sans)' }}
        >
          <PlusCircle className="w-4 h-4" />
          Add Donation
        </button>
        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--color-text)',
            border: '1.5px solid var(--color-gold-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <MinusCircle className="w-4 h-4" style={{ color: 'var(--color-expense)' }} />
          Add Expense
        </button>
      </div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Collection Card */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Total Collection</p>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}
          >
            {formatINR(summary.totalCollection)}
          </p>

          {/* Mini sparkline */}
          {collectionSparkData.length > 1 && (
            <div className="h-10 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collectionSparkData}>
                  <Line type="monotone" dataKey="v" stroke="var(--color-gold-muted)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div>
              <p className="section-label mb-0.5">CASH</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{formatINR(summary.cashCollection)}</p>
            </div>
            <div className="text-right">
              <p className="section-label mb-0.5">ONLINE</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{formatINR(summary.onlineCollection)}</p>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Total Expenses</p>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-expense-light)', color: 'var(--color-expense)' }}
            >
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-expense)' }}
          >
            {formatINR(summary.totalExpenses)}
          </p>

          {/* Mini sparkline */}
          {expenseSparkData.length > 1 && (
            <div className="h-10 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseSparkData}>
                  <Line type="monotone" dataKey="v" stroke="var(--color-expense)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div>
              <p className="section-label mb-0.5">CASH</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{formatINR(summary.cashExpenses)}</p>
            </div>
            <div className="text-right">
              <p className="section-label mb-0.5">ONLINE</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{formatINR(summary.onlineExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Methods ───────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>Payment Methods</p>

        {/* Online row */}
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Online ({onlinePct}%)
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {formatINR(summary.onlineCollection)}
          </span>
        </div>

        {/* Cash row */}
        <div className="flex items-center justify-between pt-2.5">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Cash ({cashPct}%)
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {formatINR(summary.cashCollection)}
          </span>
        </div>
      </div>

      {/* ── Charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Collection vs Expenses Bar Chart */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>Cash vs Online</p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>Collection & Expense breakdown</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="var(--font-sans)"
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="var(--font-sans)"
                />
                <Tooltip
                  formatter={(value) => formatINR(Number(value))}
                  contentStyle={{
                    backgroundColor: 'var(--color-primary)',
                    borderColor: '#333',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="Cash" fill={CHART_COLORS.cash} radius={[4, 4, 0, 0]} name="Cash (₹)" maxBarSize={40} />
                <Bar dataKey="Online" fill={CHART_COLORS.online} radius={[4, 4, 0, 0]} name="Online (₹)" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CHART_COLORS.cash }} />
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Cash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CHART_COLORS.online }} />
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Online</span>
            </div>
          </div>
        </div>

        {/* Expense Category Pie Chart */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>Expense Categories</p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>Allocation by category</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-36 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatINR(Number(value))}
                      contentStyle={{
                        backgroundColor: 'var(--color-primary)',
                        borderColor: '#333',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-sans)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Compact legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
              <Receipt className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No expense categories yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ───────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Recent Activity</h3>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-sans)' }}
          >
            VIEW ALL
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No transactions recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.slice(0, 10).map((tx) => {
              const isDonation = tx.type === 'donation';
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="flex items-center gap-3 py-2.5 cursor-pointer rounded-xl px-2 transition-all"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {tx.titleOrName}
                    </p>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{formatDateLabel(tx.date)}</span>
                      <span>·</span>
                      <span>{tx.payment_mode}</span>
                      {tx.category && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--color-gold)' }}>{tx.category}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Amount */}
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{ color: isDonation ? 'var(--color-gold)' : 'var(--color-expense)' }}
                  >
                    {isDonation ? '+' : '-'}{formatINR(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
