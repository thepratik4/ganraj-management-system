import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Donation, Expense, MandalSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../utils/storage';

export class DatabaseService {
  /**
   * Helper to check if client has active internet connectivity
   */
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Fetch all active Donations directly from Supabase
   */
  static async getDonations(): Promise<Donation[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching donations from Supabase:', error);
        return [];
      }

      return data
        .filter((item) => item.is_active !== false)
        .map((item) => ({
          id: item.id,
          receipt_number: item.receipt_number,
          donor_name: item.donor_name,
          phone: item.phone || '',
          amount: Number(item.amount),
          payment_mode: item.payment_mode,
          date: item.date,
          notes: item.notes || '',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || item.created_at || new Date().toISOString(),
          is_active: item.is_active ?? true,
        }));
    } catch (err) {
      console.error('Supabase getDonations failed:', err);
      return [];
    }
  }

  /**
   * Save / Upsert a Donation directly to Supabase
   * Throws error if no internet or failed so UI can notify user!
   */
  static async saveDonation(donation: Donation): Promise<Donation> {
    if (!this.isOnline()) {
      throw new Error('OFFLINE_NO_INTERNET');
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('SUPABASE_NOT_CONFIGURED');
    }

    const updatedItem: Donation = {
      ...donation,
      is_active: donation.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    const payload: Record<string, any> = {
      id: updatedItem.id,
      receipt_number: updatedItem.receipt_number,
      donor_name: updatedItem.donor_name,
      phone: updatedItem.phone || null,
      amount: updatedItem.amount,
      payment_mode: updatedItem.payment_mode,
      date: updatedItem.date,
      notes: updatedItem.notes || null,
      is_active: updatedItem.is_active,
      created_at: updatedItem.created_at,
      updated_at: updatedItem.updated_at,
    };

    const { error } = await supabase.from('donations').upsert(payload, { onConflict: 'id' });
    if (error) {
      if (error.code === '42703') {
        delete payload.updated_at;
        delete payload.is_active;
        const retry = await supabase.from('donations').upsert(payload, { onConflict: 'id' });
        if (retry.error) throw retry.error;
      } else {
        console.error('Failed to upsert donation to Supabase:', error);
        throw error;
      }
    }

    return updatedItem;
  }

  /**
   * Soft Delete a Donation record in Supabase
   */
  static async deleteDonation(id: string): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('OFFLINE_NO_INTERNET');
    }

    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('donations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      if (error.code === '42703') {
        await supabase.from('donations').delete().eq('id', id);
      } else {
        console.error('Failed to soft delete donation from Supabase:', error);
        throw error;
      }
    }
  }

  /**
   * Fetch all active Expenses directly from Supabase
   */
  static async getExpenses(): Promise<Expense[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching expenses from Supabase:', error);
        return [];
      }

      return data
        .filter((item) => item.is_active !== false)
        .map((item) => ({
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
          updated_at: item.updated_at || item.created_at || new Date().toISOString(),
          is_active: item.is_active ?? true,
        }));
    } catch (err) {
      console.error('Supabase getExpenses failed:', err);
      return [];
    }
  }

  /**
   * Save / Upsert an Expense directly to Supabase
   */
  static async saveExpense(expense: Expense): Promise<Expense> {
    if (!this.isOnline()) {
      throw new Error('OFFLINE_NO_INTERNET');
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('SUPABASE_NOT_CONFIGURED');
    }

    const updatedItem: Expense = {
      ...expense,
      is_active: expense.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    const payload: Record<string, any> = {
      id: updatedItem.id,
      expense_number: updatedItem.expense_number,
      title: updatedItem.title,
      category: updatedItem.category,
      vendor_name: updatedItem.vendor_name || null,
      vendor_phone: updatedItem.vendor_phone || null,
      amount: updatedItem.amount,
      payment_mode: updatedItem.payment_mode,
      bill_image: updatedItem.bill_image || null,
      date: updatedItem.date,
      notes: updatedItem.notes || null,
      is_active: updatedItem.is_active,
      created_at: updatedItem.created_at,
      updated_at: updatedItem.updated_at,
    };

    const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
    if (error) {
      if (error.code === '42703') {
        delete payload.updated_at;
        delete payload.is_active;
        const retry = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
        if (retry.error) throw retry.error;
      } else {
        console.error('Failed to upsert expense to Supabase:', error);
        throw error;
      }
    }

    return updatedItem;
  }

  /**
   * Soft Delete an Expense record in Supabase
   */
  static async deleteExpense(id: string): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('OFFLINE_NO_INTERNET');
    }

    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('expenses')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      if (error.code === '42703') {
        await supabase.from('expenses').delete().eq('id', id);
      } else {
        console.error('Failed to delete expense from Supabase:', error);
        throw error;
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
   * Upload an Expense Bill photo to Supabase Storage Bucket ('expense-bills')
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
