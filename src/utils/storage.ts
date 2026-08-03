import { Donation, Expense, MandalSettings, FinancialSummary } from '../types';

const STORAGE_KEYS = {
  DONATIONS: 'gmm_donations_v1',
  EXPENSES: 'gmm_expenses_v1',
  SETTINGS: 'gmm_settings_v1',
};

export const DEFAULT_SETTINGS: MandalSettings = {
  mandal_name: 'Ganraj Mitra Mandal',
  logo: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=200',
  whatsapp_number: '',
  receipt_footer: 'Thank you for your devotion and generous contribution to Ganeshotsav. Ganpati Bappa Morya!',
  ganeshotsav_year: '2026',
};

const SAMPLE_DONATIONS: Donation[] = [
  {
    id: 'don-1',
    receipt_number: 'GMM-0001',
    donor_name: 'Ramesh Patil',
    phone: '9822012345',
    amount: 5001,
    payment_mode: 'Cash',
    date: '2026-08-01',
    notes: 'Aarti Vargani contribution',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'don-2',
    receipt_number: 'GMM-0002',
    donor_name: 'Suresh Deshmukh',
    phone: '9890123456',
    amount: 11000,
    payment_mode: 'Online',
    date: '2026-08-01',
    notes: 'Main Pandal Vargani via GPay',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'don-3',
    receipt_number: 'GMM-0003',
    donor_name: 'Priya Kulkarni',
    phone: '9765432109',
    amount: 2500,
    payment_mode: 'Cash',
    date: '2026-08-01',
    notes: 'Prasad sponsorship',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'don-4',
    receipt_number: 'GMM-0004',
    donor_name: 'Anil & Sunita Shinde',
    phone: '9423098765',
    amount: 21000,
    payment_mode: 'Online',
    date: '2026-07-31',
    notes: 'Maha Prasad Vargani',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'don-5',
    receipt_number: 'GMM-0005',
    donor_name: 'Vijay Joshi',
    phone: '9823112233',
    amount: 1001,
    payment_mode: 'Cash',
    date: '2026-07-31',
    notes: 'Devotee vargani',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  }
];

const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expense_number: 'EXP-0001',
    title: 'Ganesh Idol Stage Floral Decoration',
    category: 'Decoration',
    vendor_name: 'Shivaji Flower Decorators',
    vendor_phone: '9822998877',
    amount: 12500,
    payment_mode: 'Online',
    date: '2026-08-01',
    notes: 'Stage backdrop & Marigold garlands',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'exp-2',
    expense_number: 'EXP-0002',
    title: 'Sound System & Dhol Tasha Rental Advance',
    category: 'Sound',
    vendor_name: 'Omkar Audio & Lights',
    vendor_phone: '9422554433',
    amount: 8000,
    payment_mode: 'Cash',
    date: '2026-08-01',
    notes: 'Agreed total ₹15,000, advance paid cash',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'exp-3',
    expense_number: 'EXP-0003',
    title: 'Modak & Ladoo Prasad Distribution',
    category: 'Prasad',
    vendor_name: 'Chitale Sweets',
    vendor_phone: '9881223344',
    amount: 4200,
    payment_mode: 'Cash',
    date: '2026-07-31',
    notes: '100 kg Ladoo for Day 1 Aarti',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

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

  static getDonations(): Donation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      if (!data) {
        // Seed initial data if first time
        this.saveDonations(SAMPLE_DONATIONS);
        return SAMPLE_DONATIONS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_DONATIONS;
    }
  }

  static saveDonations(donations: Donation[]): void {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
  }

  static getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        this.saveExpenses(SAMPLE_EXPENSES);
        return SAMPLE_EXPENSES;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_EXPENSES;
    }
  }

  static saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  /**
   * Generates next guaranteed non-duplicate receipt number (e.g. GMM-0006)
   */
  static getNextReceiptNumber(): string {
    const donations = this.getDonations();
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
   * Generates next expense number (e.g. EXP-0004)
   */
  static getNextExpenseNumber(): string {
    const expenses = this.getExpenses();
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
   * Calculate exact real-time financial stats
   */
  static getFinancialSummary(): FinancialSummary {
    const donations = this.getDonations();
    const expenses = this.getExpenses();

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
   * Reset database back to sample state or empty state
   */
  static resetToSampleData(): void {
    this.saveDonations(SAMPLE_DONATIONS);
    this.saveExpenses(SAMPLE_EXPENSES);
    this.saveSettings(DEFAULT_SETTINGS);
  }

  static clearAllData(): void {
    this.saveDonations([]);
    this.saveExpenses([]);
    this.saveSettings(DEFAULT_SETTINGS);
  }

  /**
   * Generates a complete CSV text string containing all donations and expenses
   */
  static exportToCSV(): string {
    const donations = this.getDonations();
    const expenses = this.getExpenses();

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
