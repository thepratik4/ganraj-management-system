import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Database,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  CloudOff,
} from 'lucide-react';
import { MandalSettings, Donation, Expense } from '../types';
import { StorageService } from '../utils/storage';
import { isSupabaseConfigured } from '../lib/supabase';

interface SettingsViewProps {
  settings: MandalSettings;
  donations: Donation[];
  expenses: Expense[];
  onSaveSettings: (newSettings: MandalSettings) => void;
  onReloadData: () => void;
}

const LOGO_PRESETS = [
  {
    name: 'Ganesha Artwork 1',
    url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Ganesha Artwork 2',
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=200',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  donations,
  expenses,
  onSaveSettings,
}) => {
  const [mandalName, setMandalName] = useState(settings.mandal_name);
  const [logo, setLogo] = useState(settings.logo);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [receiptFooter, setReceiptFooter] = useState(settings.receipt_footer);
  const [year, setYear] = useState(settings.ganeshotsav_year || '2026');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MandalSettings = {
      mandal_name: mandalName.trim() || 'Ganraj Mitra Mandal',
      logo: logo.trim(),
      whatsapp_number: whatsappNumber.replace(/\D/g, ''),
      receipt_footer: receiptFooter.trim(),
      ganeshotsav_year: year.trim() || '2026',
    };
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const data = { settings, donations, expenses, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GMM_Database_Backup_${year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportCSV = () => {
    const csvContent = StorageService.exportToCSV(donations, expenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GMM_Vargani_Backup_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--bg-subtle)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    fontFamily: 'var(--font-sans)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-card)',
    padding: '20px',
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto animate-fadeup">

      {/* ── Page Heading ──────────────────────────────── */}
      <div>
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
        >
          Settings
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Manage mandal details, branding and data exports
        </p>
      </div>

      {/* ── Settings Form Card ────────────────────────── */}
      <div style={cardStyle}>
        <div className="flex items-center gap-3 mb-5" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
          >
            <SettingsIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Mandal & Receipt Settings</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Name, branding, footer & WhatsApp
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mandal Name */}
          <div>
            <label style={labelStyle}>Mandal Name</label>
            <input
              type="text"
              value={mandalName}
              onChange={(e) => setMandalName(e.target.value)}
              placeholder="Ganraj Mitra Mandal"
              style={{ ...inputStyle, fontWeight: 600 }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>

          {/* Year & WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Ganeshotsav Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="9876543210"
                  style={{ ...inputStyle, paddingLeft: '40px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
              </div>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label style={labelStyle}>Mandal Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Presets:</span>
              {LOGO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLogo(preset.url)}
                  className="text-[10px] font-bold hover:underline"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Footer */}
          <div>
            <label style={labelStyle}>Receipt Footer Note</label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="Thank you for your generous contribution. Ganpati Bappa Morya!"
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-gold-muted)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>

          {/* Save Actions */}
          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <p className="text-xs font-bold flex items-center gap-1" style={{ color: '#1a7a3f' }}>
                <CheckCircle2 className="w-4 h-4" />
                Settings saved!
              </p>
            ) : <span />}
            <button
              type="submit"
              className="flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* ── Supabase Status Card ──────────────────────── */}
      <div style={cardStyle}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: isSupabaseConfigured ? '#EDFAF1' : 'var(--color-gold-light)',
              color: isSupabaseConfigured ? '#1a7a3f' : 'var(--color-gold)',
            }}
          >
            {isSupabaseConfigured ? <Zap className="w-4.5 h-4.5" /> : <CloudOff className="w-4.5 h-4.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                Supabase Cloud Sync
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: isSupabaseConfigured ? '#EDFAF1' : 'var(--color-gold-light)',
                  border: `1px solid ${isSupabaseConfigured ? '#A8E6C1' : '#D4B44A'}`,
                  color: isSupabaseConfigured ? '#1a7a3f' : 'var(--color-gold)',
                }}
              >
                {isSupabaseConfigured ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {isSupabaseConfigured
                ? 'Realtime cloud database active — all devices synced'
                : 'Configure VITE_SUPABASE_URL in .env.local'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Backup & Export Card ──────────────────────── */}
      <div style={cardStyle}>
        <div className="flex items-center gap-3 mb-4" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)' }}
          >
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Database Backup & Export</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Download CSV or full JSON backup</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-gold-muted)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <FileSpreadsheet className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
            <div className="text-left">
              <span className="block text-sm font-bold">Export CSV / Excel</span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Full donation & expense report</span>
            </div>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-gold-muted)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <Database className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            <div className="text-left">
              <span className="block text-sm font-bold">Backup JSON</span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Complete system backup file</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
