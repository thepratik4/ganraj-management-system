import React from 'react';
import {
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  Banknote,
  QrCode,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { FinancialSummary, Donation, Expense, MandalSettings } from '../types';
import { formatINR } from '../utils/currency';
import { generateFinancialReportPDF } from '../utils/pdfGenerator';
import { StorageService } from '../utils/storage';

interface ReportsViewProps {
  summary: FinancialSummary;
  donations: Donation[];
  expenses: Expense[];
  settings: MandalSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  donations,
  expenses,
  settings,
}) => {
  const isPositive = summary.currentBalance >= 0;

  // Category breakdown calculation (unchanged)
  const categorySummary: Record<string, { total: number; cash: number; online: number; count: number }> = {};
  expenses.forEach((e) => {
    if (!categorySummary[e.category]) {
      categorySummary[e.category] = { total: 0, cash: 0, online: 0, count: 0 };
    }
    categorySummary[e.category].total += e.amount;
    categorySummary[e.category].count += 1;
    if (e.payment_mode === 'Cash') {
      categorySummary[e.category].cash += e.amount;
    } else {
      categorySummary[e.category].online += e.amount;
    }
  });

  // Chart data: category bars
  const barData = Object.entries(categorySummary)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([name, d]) => ({ name: name.slice(0, 8), value: d.total }));

  // Allocation (sorted by total, descending)
  const allocationEntries = Object.entries(categorySummary)
    .sort((a, b) => b[1].total - a[1].total);
  const maxAlloc = allocationEntries[0]?.[1].total || 1;

  // Download handlers (unchanged)
  const handleDownloadPDF = () => {
    const pdf = generateFinancialReportPDF(donations, expenses, summary, settings);
    pdf.save(`Financial_Report_${settings.mandal_name.replace(/\s+/g, '_')}_${settings.ganeshotsav_year}.pdf`);
  };

  const handleExportCSV = () => {
    const csvContent = StorageService.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GMM_Ganeshotsav_Backup_${settings.ganeshotsav_year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const pdf = generateFinancialReportPDF(donations, expenses, summary, settings);
    pdf.autoPrint();
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  const collectPct = summary.totalCollection > 0
    ? Math.round((summary.totalCollection / (summary.totalCollection + summary.totalExpenses || 1)) * 100)
    : 0;
  const expensePct = summary.totalExpenses > 0
    ? Math.round((summary.totalExpenses / (summary.totalCollection || 1)) * 100)
    : 0;

  return (
    <div className="space-y-4 pb-24 animate-fadeup">

      {/* ── Page Heading ──────────────────────────────── */}
      <div>
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
        >
          Financial Reports
        </h2>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Comprehensive insights into festival collections and expenditures for the current season.
        </p>
      </div>

      {/* ── Top Metric Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Collection */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
            >
              TARGET {collectPct}%
            </span>
          </div>
          <p className="section-label mb-1">Total Collection</p>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
          >
            {formatINR(summary.totalCollection)}
          </p>
        </div>

        {/* Expenses */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-expense-light)', color: 'var(--color-expense)' }}
            >
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
              style={{ backgroundColor: 'var(--color-expense-light)', color: 'var(--color-expense)' }}
            >
              <ArrowUpRight className="w-3 h-3" />
              {expensePct}%
            </span>
          </div>
          <p className="section-label mb-1">Expenditure</p>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-expense)' }}
          >
            {formatINR(summary.totalExpenses)}
          </p>
        </div>
      </div>

      {/* ── Net Balance ───────────────────────────────── */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{
          backgroundColor: isPositive ? '#EDFAF1' : 'var(--color-expense-light)',
          border: `1px solid ${isPositive ? '#A8E6C1' : '#e0b4b4'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: isPositive ? '#27ae60' : 'var(--color-expense)',
              color: '#fff',
            }}
          >
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="section-label">Net Financial Balance</p>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: 'var(--font-serif)',
                color: isPositive ? '#1a7a3f' : 'var(--color-expense)',
              }}
            >
              {formatINR(summary.currentBalance)}
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="section-label mb-0.5 flex items-center gap-1">
            <Banknote className="w-3 h-3" /> Cash Bal
          </p>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{formatINR(summary.cashBalance)}</p>
          <p className="section-label mt-1 mb-0.5 flex items-center gap-1">
            <QrCode className="w-3 h-3" /> Online Bal
          </p>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{formatINR(summary.onlineBalance)}</p>
        </div>
      </div>

      {/* ── Chart: Category Breakdown ─────────────────── */}
      {barData.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--color-text)' }}>Expense Breakdown</p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Collection vs. Expenses · by category
          </p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary)', display: 'inline-block' }} />
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Expense</span>
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-muted)"
                  fontSize={10}
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
                <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={36}>
                  {barData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'var(--color-primary)' : index % 2 === 0 ? 'var(--color-gold-muted)' : '#555'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Allocation Table ──────────────────────────── */}
      {allocationEntries.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Allocation</p>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>VIEW ALL</span>
          </div>

          <div className="space-y-0">
            {allocationEntries.map(([category, data]) => {
              const pct = Math.round((data.total / summary.totalExpenses) * 100) || 0;
              const barWidth = Math.round((data.total / maxAlloc) * 100);
              return (
                <div key={category} className="allocation-row">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <span style={{ fontSize: '16px' }}>
                      {category === 'Decoration' ? '🏛️' :
                       category === 'Food' ? '🍱' :
                       category === 'Sound' ? '🔊' :
                       category === 'Prasad' ? '🙏' :
                       category === 'Lighting' ? '💡' :
                       category === 'Flowers' ? '🌸' :
                       category === 'Pandal' ? '⛺' :
                       category === 'Permission' ? '📋' : '📌'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{category}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                        {formatINR(data.total)}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${barWidth}%` }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Detail Table ─────────────────────── */}
      {Object.keys(categorySummary).length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Category-wise Breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wide text-[10px]">Category</th>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wide text-[10px]">Count</th>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wide text-[10px]">
                    <span className="inline-flex items-center gap-1">
                      <Banknote className="w-3 h-3" /> Cash
                    </span>
                  </th>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wide text-[10px]">
                    <span className="inline-flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> Online
                    </span>
                  </th>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wide text-[10px] text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categorySummary).map(([category, data]) => (
                  <tr
                    key={category}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-3 px-4 font-semibold" style={{ color: 'var(--color-text)' }}>{category}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>{data.count}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>{formatINR(data.cash)}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>{formatINR(data.online)}</td>
                    <td className="py-3 px-4 font-bold text-right" style={{ color: 'var(--color-expense)' }}>{formatINR(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Download Button ───────────────────────────── */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <button
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Download className="w-5 h-5" />
          Download Full Report
        </button>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>Available in PDF and Excel formats.</p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleExportCSV}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
