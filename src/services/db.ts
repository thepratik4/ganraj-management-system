import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Donation, Expense, MandalSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../utils/storage';

export class DatabaseService {
  /**
   * Fetch all Donations from Supabase (or fallback to LocalStorage)
   */
  static async getDonations(): Promise<Donation[]> {
    if (!isSupabaseConfigured || !supabase) {
      return StorageService.getDonations();
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching donations from Supabase:', error);
        return StorageService.getDonations();
      }

      if (data && data.length > 0) {
        const formatted: Donation[] = data.map((item) => ({
          id: item.id,
          receipt_number: item.receipt_number,
          donor_name: item.donor_name,
          phone: item.phone || '',
          amount: Number(item.amount),
          payment_mode: item.payment_mode,
          date: item.date,
          notes: item.notes || '',
          created_at: item.created_at || new Date().toISOString(),
        }));
        // Cache to LocalStorage
        StorageService.saveDonations(formatted);
        return formatted;
      }

      // If database is empty on Supabase, seed from local storage to prevent data loss
      const local = StorageService.getDonations();
      if (local && local.length > 0) {
        await this.syncLocalDonationsToSupabase(local);
        return local;
      }

      return [];
    } catch (err) {
      console.error('Supabase getDonations failed:', err);
      return StorageService.getDonations();
    }
  }

  /**
   * Save / Upsert a Donation record
   */
  static async saveDonation(donation: Donation): Promise<Donation> {
    // Save locally
    const currentLocal = StorageService.getDonations();
    const existingIndex = currentLocal.findIndex((d) => d.id === donation.id);
    let updatedLocal: Donation[];
    if (existingIndex >= 0) {
      updatedLocal = [...currentLocal];
      updatedLocal[existingIndex] = donation;
    } else {
      updatedLocal = [donation, ...currentLocal];
    }
    StorageService.saveDonations(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          id: donation.id,
          receipt_number: donation.receipt_number,
          donor_name: donation.donor_name,
          phone: donation.phone || null,
          amount: donation.amount,
          payment_mode: donation.payment_mode,
          date: donation.date,
          notes: donation.notes || null,
          created_at: donation.created_at,
        };

        const { error } = await supabase.from('donations').upsert(payload, { onConflict: 'id' });
        if (error) {
          console.error('Failed to upsert donation to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase saveDonation error:', err);
      }
    }

    return donation;
  }

  /**
   * Delete a Donation record
   */
  static async deleteDonation(id: string): Promise<void> {
    const currentLocal = StorageService.getDonations();
    const updatedLocal = currentLocal.filter((d) => d.id !== id);
    StorageService.saveDonations(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('donations').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete donation from Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase deleteDonation error:', err);
      }
    }
  }

  /**
   * Fetch all Expenses from Supabase
   */
  static async getExpenses(): Promise<Expense[]> {
    if (!isSupabaseConfigured || !supabase) {
      return StorageService.getExpenses();
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses from Supabase:', error);
        return StorageService.getExpenses();
      }

      if (data && data.length > 0) {
        const formatted: Expense[] = data.map((item) => ({
          id: item.id,
          expense_number: item.expense_number,
          title: item.title,
          category: item.category,
          vendor_name: item.vendor_name || '',
          vendor_phone: item.vendor_phone || '',
          amount: Number(item.amount),
          payment_mode: item.payment_mode,
          bill_image: item.bill_image || '',
          date: item.date,
          notes: item.notes || '',
          created_at: item.created_at || new Date().toISOString(),
        }));
        StorageService.saveExpenses(formatted);
        return formatted;
      }

      const local = StorageService.getExpenses();
      if (local && local.length > 0) {
        await this.syncLocalExpensesToSupabase(local);
        return local;
      }

      return [];
    } catch (err) {
      console.error('Supabase getExpenses failed:', err);
      return StorageService.getExpenses();
    }
  }

  /**
   * Save / Upsert an Expense record
   */
  static async saveExpense(expense: Expense): Promise<Expense> {
    const currentLocal = StorageService.getExpenses();
    const existingIndex = currentLocal.findIndex((e) => e.id === expense.id);
    let updatedLocal: Expense[];
    if (existingIndex >= 0) {
      updatedLocal = [...currentLocal];
      updatedLocal[existingIndex] = expense;
    } else {
      updatedLocal = [expense, ...currentLocal];
    }
    StorageService.saveExpenses(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          id: expense.id,
          expense_number: expense.expense_number,
          title: expense.title,
          category: expense.category,
          vendor_name: expense.vendor_name || null,
          vendor_phone: expense.vendor_phone || null,
          amount: expense.amount,
          payment_mode: expense.payment_mode,
          bill_image: expense.bill_image || null,
          date: expense.date,
          notes: expense.notes || null,
          created_at: expense.created_at,
        };

        const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
        if (error) {
          console.error('Failed to upsert expense to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase saveExpense error:', err);
      }
    }

    return expense;
  }

  /**
   * Delete an Expense record
   */
  static async deleteExpense(id: string): Promise<void> {
    const currentLocal = StorageService.getExpenses();
    const updatedLocal = currentLocal.filter((e) => e.id !== id);
    StorageService.saveExpenses(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete expense from Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase deleteExpense error:', err);
      }
    }
  }

  /**
   * Fetch Mandal Settings
   */
  static async getSettings(): Promise<MandalSettings> {
    if (!isSupabaseConfigured || !supabase) {
      return StorageService.getSettings();
    }

    try {
      const { data, error } = await supabase
        .from('mandal_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error || !data) {
        return StorageService.getSettings();
      }

      const settings: MandalSettings = {
        mandal_name: data.mandal_name || DEFAULT_SETTINGS.mandal_name,
        logo: data.logo || DEFAULT_SETTINGS.logo,
        whatsapp_number: data.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
        receipt_footer: data.receipt_footer || DEFAULT_SETTINGS.receipt_footer,
        ganeshotsav_year: data.ganeshotsav_year || DEFAULT_SETTINGS.ganeshotsav_year,
      };

      StorageService.saveSettings(settings);
      return settings;
    } catch {
      return StorageService.getSettings();
    }
  }

  /**
   * Save Mandal Settings
   */
  static async saveSettings(settings: MandalSettings): Promise<void> {
    StorageService.saveSettings(settings);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mandal_settings').upsert(
          {
            id: 'default',
            mandal_name: settings.mandal_name,
            logo: settings.logo,
            whatsapp_number: settings.whatsapp_number,
            receipt_footer: settings.receipt_footer,
            ganeshotsav_year: settings.ganeshotsav_year,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (err) {
        console.error('Failed to save settings to Supabase:', err);
      }
    }
  }

  /**
   * Subscribe to Realtime Postgres Changes across donations, expenses, and settings
   */
  static subscribeToRealtime(
    onDonationChange: () => void,
    onExpenseChange: () => void,
    onSettingsChange: () => void
  ) {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    const channel = supabase
      .channel('ganraj_mandal_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => {
          onDonationChange();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          onExpenseChange();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mandal_settings' },
        () => {
          onSettingsChange();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Connected to Supabase Realtime Stream');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Helper to seed local sample items to Supabase if newly created
   */
  private static async syncLocalDonationsToSupabase(donations: Donation[]) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const payload = donations.map((d) => ({
        id: d.id,
        receipt_number: d.receipt_number,
        donor_name: d.donor_name,
        phone: d.phone || null,
        amount: d.amount,
        payment_mode: d.payment_mode,
        date: d.date,
        notes: d.notes || null,
        created_at: d.created_at,
      }));
      await supabase.from('donations').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed syncing local donations to Supabase:', err);
    }
  }

  private static async syncLocalExpensesToSupabase(expenses: Expense[]) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const payload = expenses.map((e) => ({
        id: e.id,
        expense_number: e.expense_number,
        title: e.title,
        category: e.category,
        vendor_name: e.vendor_name || null,
        vendor_phone: e.vendor_phone || null,
        amount: e.amount,
        payment_mode: e.payment_mode,
        bill_image: e.bill_image || null,
        date: e.date,
        notes: e.notes || null,
        created_at: e.created_at,
      }));
      await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed syncing local expenses to Supabase:', err);
    }
  }

  /**
   * Upload an Expense Bill photo to Supabase Storage Bucket ('expense-bills')
   * Returns public CDN URL on success, or fallback Base64 data URL
   */
  static async uploadBillImage(file: File): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error } = await supabase.storage
        .from('expense-bills')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Supabase Storage Upload Error:', error);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from('expense-bills')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Upload bill failed:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  }
}
