import { Donation, Expense, MandalSettings, FinancialSummary } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'gmm_settings_v1',
};

export const DEFAULT_SETTINGS: MandalSettings = {
  mandal_name: 'Ganraj Mitra Mandal',
  logo: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=200',
  whatsapp_number: '',
  receipt_footer: 'Thank you for your devotion and generous contribution to Ganeshotsav. Ganpati Bappa Morya!',
  ganeshotsav_year: '2026',
};

export class StorageService {
  static getSettings(): MandalSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: MandalSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Generates next guaranteed non-duplicate receipt number based on current donations
   */
  static getNextReceiptNumber(donations: Donation[] = []): string {
    let maxNum = 0;
    donations.forEach((d) => {
      const match = d.receipt_number?.match(/GMM-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `GMM-${String(nextNum).padStart(4, '0')}`;
  }

  /**
   * Generates next expense number based on current expenses
   */
  static getNextExpenseNumber(expenses: Expense[] = []): string {
    let maxNum = 0;
    expenses.forEach((e) => {
      const match = e.expense_number?.match(/EXP-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `EXP-${String(nextNum).padStart(4, '0')}`;
  }

  /**
   * Calculate exact real-time financial stats from live data
   */
  static getFinancialSummary(donations: Donation[] = [], expenses: Expense[] = []): FinancialSummary {
    let cashCollection = 0;
    let onlineCollection = 0;

    donations.forEach((d) => {
      if (d.payment_mode === 'Cash') {
        cashCollection += d.amount;
      } else {
        onlineCollection += d.amount;
      }
    });

    let cashExpenses = 0;
    let onlineExpenses = 0;

    expenses.forEach((e) => {
      if (e.payment_mode === 'Cash') {
        cashExpenses += e.amount;
      } else {
        onlineExpenses += e.amount;
      }
    });

    const totalCollection = cashCollection + onlineCollection;
    const totalExpenses = cashExpenses + onlineExpenses;
    const currentBalance = totalCollection - totalExpenses;

    const cashBalance = cashCollection - cashExpenses;
    const onlineBalance = onlineCollection - onlineExpenses;

    return {
      totalCollection,
      totalExpenses,
      currentBalance,
      cashCollection,
      onlineCollection,
      cashExpenses,
      onlineExpenses,
      cashBalance,
      onlineBalance,
    };
  }

  /**
   * Generates a complete CSV text string containing live donations and expenses
   */
  static exportToCSV(donations: Donation[] = [], expenses: Expense[] = []): string {
    let csv = 'GANRAJ MITRA MANDAL - FINANCIAL REPORT & BACKUP\n\n';

    csv += 'DONATIONS (VARGANI)\n';
    csv += 'Receipt No,Donor Name,Phone,Amount (INR),Payment Mode,Date,Notes\n';
    donations.forEach((d) => {
      csv += `"${d.receipt_number}","${d.donor_name.replace(/"/g, '""')}","${d.phone}",${d.amount},"${d.payment_mode}","${d.date}","${(d.notes || '').replace(/"/g, '""')}"\n`;
    });

    csv += '\nEXPENSES\n';
    csv += 'Expense No,Title,Category,Vendor Name,Vendor Phone,Amount (INR),Payment Mode,Date,Notes\n';
    expenses.forEach((e) => {
      csv += `"${e.expense_number}","${e.title.replace(/"/g, '""')}","${e.category}","${(e.vendor_name || '').replace(/"/g, '""')}","${e.vendor_phone || ''}",${e.amount},"${e.payment_mode}","${e.date}","${(e.notes || '').replace(/"/g, '""')}"\n`;
    });

    return csv;
  }
}
