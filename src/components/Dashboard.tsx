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
  Calendar,
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

  // Chart Data Preparation: Collection vs Expenses
  const barData = [
    { name: 'Collection', Cash: summary.cashCollection, Online: summary.onlineCollection, Total: summary.totalCollection },
    { name: 'Expenses', Cash: summary.cashExpenses, Online: summary.onlineExpenses, Total: summary.totalExpenses },
  ];

  // Category Expense Distribution for Pie Chart
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const CATEGORY_COLORS = [
    '#E65100', // Saffron
    '#880E4F', // Maroon
    '#D4AF37', // Gold
    '#0284C7', // Sky Blue
    '#16A34A', // Emerald
    '#9333EA', // Purple
    '#E11D48', // Rose
    '#CA8A04', // Amber
  ];

  return (
    <div className="space-[#fcf8f2] space-y-5 pb-20">
      {/* Quick Action Banner with Callout Buttons */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-15 text-white pointer-events-none text-9xl">
          🪔
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-900/40 text-amber-100 text-xs font-semibold mb-2 border border-amber-300/30">
              <span>Ganpati Bappa Morya 🙏</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Ganeshotsav Vargani & Finances
            </h2>
            <p className="text-amber-100/90 text-xs sm:text-sm mt-0.5">
              Record donations and track festival expenses seamlessly
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAddDonation}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-amber-900 font-extrabold px-4 py-2.5 rounded-2xl shadow-md hover:bg-amber-50 active:scale-95 transition-all text-sm"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Add Donation</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-950/80 hover:bg-amber-950 text-white font-bold px-4 py-2.5 rounded-2xl border border-amber-400/30 shadow-md active:scale-95 transition-all text-sm"
            >
              <MinusCircle className="w-5 h-5 text-rose-400" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Current Balance Card (MOVED TO TOP / FIRST WITH DISTINCT COLOR) */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border-2 shadow-md relative overflow-hidden transition-all ${
            isPositiveBalance
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-400/70'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white border-rose-400/70'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block truncate">
              Current Net Balance
            </span>
            <div
              className={`p-2 rounded-xl shrink-0 shadow-xs ${
                isPositiveBalance
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 min-w-0">
            <span
              className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight block truncate ${
                isPositiveBalance
                  ? 'text-emerald-300 drop-shadow-xs'
                  : 'text-rose-300 drop-shadow-xs'
              }`}
            >
              {formatINR(summary.currentBalance)}
            </span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-amber-200/80 block text-[10px] font-bold uppercase">CASH BAL</span>
              <span className="font-extrabold text-white block truncate text-sm">
                {formatINR(summary.cashBalance)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-amber-200/80 block text-[10px] font-bold uppercase">ONLINE BAL</span>
              <span className="font-extrabold text-white block truncate text-sm">
                {formatINR(summary.onlineBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Collection Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Total Collection
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block truncate tracking-tight">
              {formatINR(summary.totalCollection)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px]">CASH</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                {formatINR(summary.cashCollection)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px]">ONLINE</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                {formatINR(summary.onlineCollection)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 block truncate tracking-tight">
              {formatINR(summary.totalExpenses)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px]">CASH</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                {formatINR(summary.cashExpenses)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px]">ONLINE</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                {formatINR(summary.onlineExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Collection vs Expenses Comparison Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-600" />
              Cash vs Online Breakdown
            </h3>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  formatter={(value) => formatINR(Number(value))}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="Cash" fill="#16A34A" radius={[4, 4, 0, 0]} name="Cash (₹)" />
                <Bar dataKey="Online" fill="#0284C7" radius={[4, 4, 0, 0]} name="Online (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-rose-500" />
              Expense Category Breakdown
            </h3>
          </div>
          {pieData.length > 0 ? (
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatINR(Number(value))}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#fff',
                      borderRadius: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 mb-2 opacity-50" />
              No expense categories recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Last 10 Transactions Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Displaying the last 10 transactions
            </p>
          </div>

          <button
            onClick={onViewAllTransactions}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transactions recorded yet. Click "Add Donation" or "Add Expense" to begin.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.slice(0, 10).map((tx) => {
              const isDonation = tx.type === 'donation';
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isDonation
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDonation
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                      }`}
                    >
                      {isDonation ? (
                        <HeartHandshake className="w-5 h-5" />
                      ) : (
                        <Receipt className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[180px] sm:max-w-none">
                          {tx.titleOrName}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isDonation
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
                          }`}
                        >
                          {tx.number}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3" />
                          {tx.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 shrink-0">
                          {tx.payment_mode === 'Cash' ? (
                            <Banknote className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <QrCode className="w-3 h-3 text-sky-600" />
                          )}
                          {tx.payment_mode}
                        </span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-amber-700 dark:text-amber-300 truncate max-w-[120px]">
                              {tx.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 min-w-0 max-w-[40%] sm:max-w-none">
                    <span
                      className={`text-sm sm:text-base font-black block truncate ${
                        isDonation ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isDonation ? '+' : '-'} {formatINR(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
