import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Donation,
  Expense,
  MandalSettings,
  Transaction,
  FinancialSummary,
} from './types';
import { StorageService } from './utils/storage';
import { DatabaseService } from './services/db';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { DonationModal } from './components/DonationModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ReceiptModal } from './components/ReceiptModal';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { BillImageModal } from './components/BillImageModal';
import { AppLockModal } from './components/AppLockModal';

export default function App() {
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<MandalSettings>(StorageService.getSettings());
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptDonation, setActiveReceiptDonation] = useState<Donation | null>(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [activeBillUrl, setActiveBillUrl] = useState<string | null>(null);

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Central load function
  const loadAllData = useCallback(async () => {
    try {
      const [fetchedDonations, fetchedExpenses, fetchedSettings] = await Promise.all([
        DatabaseService.getDonations(),
        DatabaseService.getExpenses(),
        DatabaseService.getSettings(),
      ]);

      setDonations(fetchedDonations);
      setExpenses(fetchedExpenses);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and Realtime Subscription
  useEffect(() => {
    loadAllData();
    document.documentElement.classList.remove('dark');

    // Subscribe to Supabase Realtime broadcast channels
    const unsubscribe = DatabaseService.subscribeToRealtime(
      () => {
        // Refetch donations on change
        DatabaseService.getDonations().then(setDonations);
      },
      () => {
        // Refetch expenses on change
        DatabaseService.getExpenses().then(setExpenses);
      },
      () => {
        // Refetch settings on change
        DatabaseService.getSettings().then(setSettings);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadAllData]);

  // Compute Real-time Financial Summary
  const summary: FinancialSummary = useMemo(() => {
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

    return {
      totalCollection,
      totalExpenses,
      currentBalance,
      cashCollection,
      onlineCollection,
      cashExpenses,
      onlineExpenses,
      cashBalance: cashCollection - cashExpenses,
      onlineBalance: onlineCollection - onlineExpenses,
    };
  }, [donations, expenses]);

  // Combined Transactions stream (newest first)
  const transactions: Transaction[] = useMemo(() => {
    const list: Transaction[] = [];

    donations.forEach((d) => {
      list.push({
        id: d.id,
        number: d.receipt_number,
        type: 'donation',
        titleOrName: d.donor_name,
        amount: d.amount,
        payment_mode: d.payment_mode,
        date: d.date,
        phone: d.phone,
        notes: d.notes,
        created_at: d.created_at,
        originalItem: d,
      });
    });

    expenses.forEach((e) => {
      list.push({
        id: e.id,
        number: e.expense_number,
        type: 'expense',
        titleOrName: e.title,
        category: e.category,
        amount: e.amount,
        payment_mode: e.payment_mode,
        date: e.date,
        phone: e.vendor_phone,
        vendor_name: e.vendor_name,
        notes: e.notes,
        created_at: e.created_at,
        originalItem: e,
      });
    });

    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [donations, expenses]);

  // Save Donation Handler
  const handleSaveDonation = async (savedDonation: Donation) => {
    try {
      await DatabaseService.saveDonation(savedDonation);
      setDonations((prev) => {
        const exists = prev.some((d) => d.id === savedDonation.id);
        return exists ? prev.map((d) => (d.id === savedDonation.id ? savedDonation : d)) : [savedDonation, ...prev];
      });
      setIsDonationModalOpen(false);
      setActiveReceiptDonation(savedDonation);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error('Failed to save donation:', err);
      alert('⚠️ Unable to save donation. Please ensure your internet connection is active.');
    }
  };

  // Save Expense Handler
  const handleSaveExpense = async (savedExpense: Expense) => {
    try {
      await DatabaseService.saveExpense(savedExpense);
      setExpenses((prev) => {
        const exists = prev.some((e) => e.id === savedExpense.id);
        return exists ? prev.map((e) => (e.id === savedExpense.id ? savedExpense : e)) : [savedExpense, ...prev];
      });
      setIsExpenseModalOpen(false);
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert('⚠️ Unable to save expense. Please ensure your internet connection is active.');
    }
  };

  // Delete Transaction with Safety Confirmation
  const handleDeleteTransaction = (tx: Transaction) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${tx.type === 'donation' ? 'Donation' : 'Expense'} Record?`,
      message: `Are you sure you want to delete ${tx.number} (${tx.titleOrName})? This action cannot be undone.`,
      confirmLabel: 'Delete Record',
      isDanger: true,
      onConfirm: async () => {
        try {
          if (tx.type === 'donation') {
            await DatabaseService.deleteDonation(tx.id);
            setDonations((prev) => prev.filter((d) => d.id !== tx.id));
          } else {
            await DatabaseService.deleteExpense(tx.id);
            setExpenses((prev) => prev.filter((e) => e.id !== tx.id));
          }
        } catch (err) {
          console.error('Failed to delete transaction:', err);
          alert('⚠️ Could not delete record. Please check your internet connection.');
        }
      },
    });
  };

  // Edit Transaction Trigger (Requires Password 1010)
  const handleEditTransaction = (tx: Transaction) => {
    setConfirmModal({
      isOpen: true,
      title: `Edit ${tx.type === 'donation' ? 'Donation' : 'Expense'} Record?`,
      message: `Are you sure you want to edit ${tx.number} (${tx.titleOrName})? Please enter password to proceed.`,
      confirmLabel: 'Edit Record',
      isDanger: false,
      onConfirm: () => {
        if (tx.type === 'donation') {
          setEditingDonation(tx.originalItem as Donation);
          setIsDonationModalOpen(true);
        } else {
          setEditingExpense(tx.originalItem as Expense);
          setIsExpenseModalOpen(true);
        }
      },
    });
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: MandalSettings) => {
    setSettings(newSettings);
    await DatabaseService.saveSettings(newSettings);
  };

  // Quick Export CSV
  const handleQuickBackup = () => {
    const csvContent = StorageService.exportToCSV(donations, expenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GMM_Backup_${settings.ganeshotsav_year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans transition-colors overflow-x-hidden max-w-full">
      {/* Top Navigation Header */}
      <Header
        settings={settings}
        summary={summary}
        onOpenSettings={() => setActiveTab('settings')}
        onQuickBackup={handleQuickBackup}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4 overflow-x-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-500">Connecting to Supabase Database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                summary={summary}
                recentTransactions={transactions}
                onOpenAddDonation={() => {
                  setEditingDonation(null);
                  setIsDonationModalOpen(true);
                }}
                onOpenAddExpense={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                onViewAllTransactions={() => setActiveTab('transactions')}
                onSelectTransaction={(tx) => {
                  if (tx.type === 'donation') {
                    setActiveReceiptDonation(tx.originalItem as Donation);
                    setIsReceiptModalOpen(true);
                  } else if ((tx.originalItem as Expense).bill_image) {
                    setActiveBillUrl((tx.originalItem as Expense).bill_image || null);
                    setIsBillModalOpen(true);
                  }
                }}
                expenses={expenses}
                donations={donations}
              />
            )}

            {activeTab === 'donations' && (
              <TransactionsView
                transactions={transactions.filter((t) => t.type === 'donation')}
                onOpenAddDonation={() => {
                  setEditingDonation(null);
                  setIsDonationModalOpen(true);
                }}
                onOpenAddExpense={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onViewReceipt={(tx) => {
                  setActiveReceiptDonation(tx.originalItem as Donation);
                  setIsReceiptModalOpen(true);
                }}
                onViewBillImage={(url) => {
                  setActiveBillUrl(url);
                  setIsBillModalOpen(true);
                }}
              />
            )}

            {activeTab === 'expenses' && (
              <TransactionsView
                transactions={transactions.filter((t) => t.type === 'expense')}
                onOpenAddDonation={() => {
                  setEditingDonation(null);
                  setIsDonationModalOpen(true);
                }}
                onOpenAddExpense={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onViewReceipt={(tx) => {
                  setActiveReceiptDonation(tx.originalItem as Donation);
                  setIsReceiptModalOpen(true);
                }}
                onViewBillImage={(url) => {
                  setActiveBillUrl(url);
                  setIsBillModalOpen(true);
                }}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                onOpenAddDonation={() => {
                  setEditingDonation(null);
                  setIsDonationModalOpen(true);
                }}
                onOpenAddExpense={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onViewReceipt={(tx) => {
                  setActiveReceiptDonation(tx.originalItem as Donation);
                  setIsReceiptModalOpen(true);
                }}
                onViewBillImage={(url) => {
                  setActiveBillUrl(url);
                  setIsBillModalOpen(true);
                }}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                summary={summary}
                donations={donations}
                expenses={expenses}
                settings={settings}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                donations={donations}
                expenses={expenses}
                onSaveSettings={handleSaveSettings}
                onReloadData={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Modals */}
      <DonationModal
        isOpen={isDonationModalOpen}
        editingDonation={editingDonation}
        existingDonations={donations}
        onClose={() => setIsDonationModalOpen(false)}
        onSave={handleSaveDonation}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        editingExpense={editingExpense}
        existingExpenses={expenses}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        donation={activeReceiptDonation}
        settings={settings}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <BillImageModal
        isOpen={isBillModalOpen}
        imageUrl={activeBillUrl}
        onClose={() => setIsBillModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDanger={confirmModal.isDanger}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
      />

      {/* Security App Passcode Lock (5050) */}
      <AppLockModal
        isUnlocked={isAppUnlocked}
        onUnlock={() => setIsAppUnlocked(true)}
        settings={settings}
      />
    </div>
  );
}
