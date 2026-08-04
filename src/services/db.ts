import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Donation, Expense, MandalSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../utils/storage';

export class DatabaseService {
  /**
   * Fetch all Donations from Supabase with Smart Merge & Conflict Resolution
   */
  static async getDonations(): Promise<Donation[]> {
    const deletedIds = new Set(StorageService.getDeletedIds());
    const rawLocal = StorageService.getDonations();
    const local = rawLocal.filter((d) => !deletedIds.has(d.id));

    if (!isSupabaseConfigured || !supabase) {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching donations from Supabase, falling back to local cache:', error);
        return local;
      }

      const cloudMap = new Map<string, Donation>();
      if (data && data.length > 0) {
        for (const item of data) {
          // If deleted locally while offline, delete from cloud as well
          if (deletedIds.has(item.id)) {
            supabase.from('donations').delete().eq('id', item.id).then(() => {
              StorageService.removeDeletedId(item.id);
            });
            continue;
          }

          cloudMap.set(item.id, {
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
          });
        }
      }

      // Merge local entries into cloud map (smart resolution)
      const unSyncedLocal: Donation[] = [];
      local.forEach((localItem) => {
        if (!cloudMap.has(localItem.id)) {
          // Local item doesn't exist on cloud -> retain local & queue push to cloud
          cloudMap.set(localItem.id, localItem);
          unSyncedLocal.push(localItem);
        } else {
          // Item exists on both -> compare timestamps (local offline edit vs cloud)
          const cloudItem = cloudMap.get(localItem.id)!;
          const localTime = new Date(localItem.updated_at || localItem.created_at).getTime();
          const cloudTime = new Date(cloudItem.updated_at || cloudItem.created_at).getTime();

          if (localTime > cloudTime) {
            // Local offline edit is newer -> keep local & queue push to cloud
            cloudMap.set(localItem.id, localItem);
            unSyncedLocal.push(localItem);
          }
        }
      });

      // Auto-sync any un-synced local items back to Supabase in the background
      if (unSyncedLocal.length > 0) {
        this.syncLocalDonationsToSupabase(unSyncedLocal);
      }

      // Sort descending by created_at / date
      const merged = Array.from(cloudMap.values()).sort((a, b) => 
        new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
      );

      // Cache merged result to LocalStorage
      StorageService.saveDonations(merged);
      return merged;
    } catch (err) {
      console.error('Supabase getDonations failed, returning local cache:', err);
      return local;
    }
  }

  /**
   * Save / Upsert a Donation record
   */
  static async saveDonation(donation: Donation): Promise<Donation> {
    const updatedItem: Donation = {
      ...donation,
      updated_at: new Date().toISOString(),
    };

    // 1. Save locally first for instant UI response and offline safety
    const currentLocal = StorageService.getDonations();
    const existingIndex = currentLocal.findIndex((d) => d.id === updatedItem.id);
    let updatedLocal: Donation[];
    if (existingIndex >= 0) {
      updatedLocal = [...currentLocal];
      updatedLocal[existingIndex] = updatedItem;
    } else {
      updatedLocal = [updatedItem, ...currentLocal];
    }
    StorageService.saveDonations(updatedLocal);

    // 2. Sync to Supabase Cloud
    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {
          id: updatedItem.id,
          receipt_number: updatedItem.receipt_number,
          donor_name: updatedItem.donor_name,
          phone: updatedItem.phone || null,
          amount: updatedItem.amount,
          payment_mode: updatedItem.payment_mode,
          date: updatedItem.date,
          notes: updatedItem.notes || null,
          created_at: updatedItem.created_at,
          updated_at: updatedItem.updated_at,
        };

        const { error } = await supabase.from('donations').upsert(payload, { onConflict: 'id' });
        if (error) {
          if (error.code === '42703') {
            delete payload.updated_at;
            await supabase.from('donations').upsert(payload, { onConflict: 'id' });
          } else {
            console.error('Failed to upsert donation to Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Supabase saveDonation error:', err);
      }
    }

    return updatedItem;
  }

  /**
   * Delete a Donation record
   */
  static async deleteDonation(id: string): Promise<void> {
    StorageService.addDeletedId(id);
    const currentLocal = StorageService.getDonations();
    const updatedLocal = currentLocal.filter((d) => d.id !== id);
    StorageService.saveDonations(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('donations').delete().eq('id', id);
        if (!error) {
          StorageService.removeDeletedId(id);
        } else {
          console.error('Failed to delete donation from Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase deleteDonation error:', err);
      }
    }
  }

  /**
   * Fetch all Expenses from Supabase with Smart Merge & Conflict Resolution
   */
  static async getExpenses(): Promise<Expense[]> {
    const deletedIds = new Set(StorageService.getDeletedIds());
    const rawLocal = StorageService.getExpenses();
    const local = rawLocal.filter((e) => !deletedIds.has(e.id));

    if (!isSupabaseConfigured || !supabase) {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses from Supabase, returning local cache:', error);
        return local;
      }

      const cloudMap = new Map<string, Expense>();
      if (data && data.length > 0) {
        for (const item of data) {
          if (deletedIds.has(item.id)) {
            supabase.from('expenses').delete().eq('id', item.id).then(() => {
              StorageService.removeDeletedId(item.id);
            });
            continue;
          }

          cloudMap.set(item.id, {
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
          });
        }
      }

      const unSyncedLocal: Expense[] = [];
      local.forEach((localItem) => {
        if (!cloudMap.has(localItem.id)) {
          cloudMap.set(localItem.id, localItem);
          unSyncedLocal.push(localItem);
        } else {
          const cloudItem = cloudMap.get(localItem.id)!;
          const localTime = new Date(localItem.updated_at || localItem.created_at).getTime();
          const cloudTime = new Date(cloudItem.updated_at || cloudItem.created_at).getTime();

          if (localTime > cloudTime) {
            cloudMap.set(localItem.id, localItem);
            unSyncedLocal.push(localItem);
          }
        }
      });

      if (unSyncedLocal.length > 0) {
        this.syncLocalExpensesToSupabase(unSyncedLocal);
      }

      const merged = Array.from(cloudMap.values()).sort((a, b) => 
        new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
      );

      StorageService.saveExpenses(merged);
      return merged;
    } catch (err) {
      console.error('Supabase getExpenses failed, returning local cache:', err);
      return local;
    }
  }

  /**
   * Save / Upsert an Expense record
   */
  static async saveExpense(expense: Expense): Promise<Expense> {
    const updatedItem: Expense = {
      ...expense,
      updated_at: new Date().toISOString(),
    };

    const currentLocal = StorageService.getExpenses();
    const existingIndex = currentLocal.findIndex((e) => e.id === updatedItem.id);
    let updatedLocal: Expense[];
    if (existingIndex >= 0) {
      updatedLocal = [...currentLocal];
      updatedLocal[existingIndex] = updatedItem;
    } else {
      updatedLocal = [updatedItem, ...currentLocal];
    }
    StorageService.saveExpenses(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
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
          created_at: updatedItem.created_at,
          updated_at: updatedItem.updated_at,
        };

        const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
        if (error) {
          if (error.code === '42703') {
            delete payload.updated_at;
            await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
          } else {
            console.error('Failed to upsert expense to Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Supabase saveExpense error:', err);
      }
    }

    return updatedItem;
  }

  /**
   * Delete an Expense record
   */
  static async deleteExpense(id: string): Promise<void> {
    StorageService.addDeletedId(id);
    const currentLocal = StorageService.getExpenses();
    const updatedLocal = currentLocal.filter((e) => e.id !== id);
    StorageService.saveExpenses(updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) {
          StorageService.removeDeletedId(id);
        } else {
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
