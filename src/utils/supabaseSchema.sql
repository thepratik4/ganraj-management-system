-- Run this SQL in your Supabase SQL Editor to create the tables, storage bucket, and enable Realtime sync:

-- 1. Create Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL,
    donor_name TEXT NOT NULL,
    phone TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_mode TEXT NOT NULL DEFAULT 'Cash',
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    expense_number TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    vendor_name TEXT,
    vendor_phone TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_mode TEXT NOT NULL DEFAULT 'Cash',
    bill_image TEXT,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Mandal Settings Table
CREATE TABLE IF NOT EXISTS public.mandal_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    mandal_name TEXT NOT NULL,
    logo TEXT,
    whatsapp_number TEXT,
    receipt_footer TEXT,
    ganeshotsav_year TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Allow Anonymous Public Access (for open mandal access)
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on donations" ON public.donations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on donations" ON public.donations FOR DELETE USING (true);

CREATE POLICY "Allow public select on expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Allow public select on mandal_settings" ON public.mandal_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on mandal_settings" ON public.mandal_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on mandal_settings" ON public.mandal_settings FOR UPDATE USING (true);

-- 5. Enable Supabase Realtime Broadcasts for all 3 tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mandal_settings;

-- 6. Create Storage Bucket for Expense Bills & Enable Public Access
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expense-bills', 'expense-bills', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public select on expense-bills" ON storage.objects FOR SELECT USING (bucket_id = 'expense-bills');
CREATE POLICY "Allow public insert on expense-bills" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'expense-bills');
CREATE POLICY "Allow public update on expense-bills" ON storage.objects FOR UPDATE USING (bucket_id = 'expense-bills');
CREATE POLICY "Allow public delete on expense-bills" ON storage.objects FOR DELETE USING (bucket_id = 'expense-bills');
