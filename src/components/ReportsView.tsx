import React from 'react';
import {
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
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

  // Category breakdown calculation
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

  const pieData = Object.entries(categorySummary).map(([name, data]) => ({
    name,
    value: data.total,
  }));

  const CATEGORY_COLORS = [
    '#E65100',
    '#880E4F',
    '#D4AF37',
    '#0284C7',
    '#16A34A',
    '#9333EA',
    '#E11D48',
    '#CA8A04',
  ];

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

  return (
    <div className="space-y-5 pb-20">
      {/* Top Banner & Export Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold mb-1">
            <span>Statement of Accounts</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            Financial Reports & Exports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {settings.mandal_name} • Ganeshotsav {settings.ganeshotsav_year}
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs shadow-xs active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel/CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold px-3.5 py-2.5 rounded-xl text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Total Collection */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total Collection</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(summary.totalCollection)}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-slate-500">Cash: <strong className="text-slate-800 dark:text-slate-200">{formatINR(summary.cashCollection)}</strong></span>
            <span className="text-slate-500">Online: <strong className="text-slate-800 dark:text-slate-200">{formatINR(summary.onlineCollection)}</strong></span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatINR(summary.totalExpenses)}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-slate-500">Cash: <strong className="text-slate-800 dark:text-slate-200">{formatINR(summary.cashExpenses)}</strong></span>
            <span className="text-slate-500">Online: <strong className="text-slate-800 dark:text-slate-200">{formatINR(summary.onlineExpenses)}</strong></span>
          </div>
        </div>

        {/* Net Balance */}
        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            isPositive
              ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-500/10 border-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold uppercase">
            <span>Net Financial Balance</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <p
            className={`text-2xl font-black mt-1 ${
              isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
            }`}
          >
            {formatINR(summary.currentBalance)}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-slate-500">Cash Bal: <strong className="text-slate-800 dark:text-slate-200">{formatINR(summary.cashBalance)}</strong></span>
            <span className="text-slate-500">Online Bal: <strong className="text-slate-800 dark:text-slate-200">{formatINR(summary.onlineBalance)}</strong></span>
          </div>
        </div>
      </div>

      {/* Category Expenses Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-rose-500" />
          Category-wise Expense Breakdown
        </h3>

        {Object.keys(categorySummary).length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Txn Count</th>
                  <th className="py-2.5 px-3">Cash (₹)</th>
                  <th className="py-2.5 px-3">Online (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Expense (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(categorySummary).map(([category, data]) => (
                  <tr key={category} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                      {data.count}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {formatINR(data.cash)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {formatINR(data.online)}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-rose-600 dark:text-rose-400 text-right">
                      {formatINR(data.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
