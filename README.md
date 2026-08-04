# Ganraj Mitra Mandal - Vargani & Expense Management System

A modern, mobile-first web application designed for **Ganraj Mitra Mandal** to manage Ganeshotsav donations (vargani), generate high-resolution digital receipts, track festival expenses, and sync records seamlessly with Supabase.

## Features

- 🪔 **Digital Donation Receipt Generator**: Generates high-res PNG receipts and landscape PDF receipts with WhatsApp image sharing.
- 💰 **Vargani (Donation) Management**: Collect, view, filter, search, and export donor records.
- 📊 **Expense Tracker & Financial Statements**: Record festival expenses with bill image uploads and automatic balance calculation.
- ☁️ **Supabase Cloud Sync**: Real-time data sync with local offline fallback.

## Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

