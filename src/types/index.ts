export type PaymentMode = 'Cash' | 'Online';

export type ExpenseCategory =
  | 'Decoration'
  | 'Lighting'
  | 'Flowers'
  | 'Food'
  | 'Prasad'
  | 'Sound'
  | 'Electricity'
  | 'Printing'
  | 'Transportation'
  | 'Pandal'
  | 'Permission'
  | 'Misc'
  | 'Miscellaneous';

export interface Donation {
  id: string;
  receipt_number: string;
  donor_name: string;
  phone: string;
  amount: number;
  payment_mode: PaymentMode;
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  expense_number: string;
  title: string;
  category: ExpenseCategory;
  vendor_name?: string;
  vendor_phone?: string;
  amount: number;
  payment_mode: PaymentMode;
  bill_image?: string; // base64 or URL
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type TransactionType = 'donation' | 'expense';

export interface Transaction {
  id: string;
  number: string; // receipt_number or expense_number
  type: TransactionType;
  titleOrName: string;
  category?: ExpenseCategory;
  amount: number;
  payment_mode: PaymentMode;
  date: string;
  phone?: string;
  vendor_name?: string;
  notes?: string;
  created_at: string;
  originalItem: Donation | Expense;
}

export interface MandalSettings {
  mandal_name: string;
  logo: string;
  whatsapp_number: string;
  receipt_footer: string;
  ganeshotsav_year: string;
}

export interface FinancialSummary {
  totalCollection: number;
  totalExpenses: number;
  currentBalance: number;
  cashCollection: number;
  onlineCollection: number;
  cashExpenses: number;
  onlineExpenses: number;
  cashBalance: number;
  onlineBalance: number;
}
