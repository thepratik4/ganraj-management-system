import React from 'react';
import { Database, Zap, CloudOff, User } from 'lucide-react';
import { MandalSettings, FinancialSummary } from '../types';
import { formatINR } from '../utils/currency';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  settings: MandalSettings;
  summary: FinancialSummary;
  onOpenSettings: () => void;
  onQuickBackup: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  summary,
  onOpenSettings,
  onQuickBackup,
}) => {
  return (
    <header
      className="sticky top-0 z-30 overflow-x-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 0 0 var(--color-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Logo & Mandal Name */}
        <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={onOpenSettings}>
          {/* Logo square */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 relative"
            style={{ backgroundColor: 'var(--color-primary)', border: '1px solid #333' }}
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Mandal Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-lg">🪔</span>
            )}
          </div>

          <div className="min-w-0">
            <h1
              className="text-base font-bold leading-tight tracking-tight truncate"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)', fontSize: '1rem' }}
            >
              {settings.mandal_name}
            </h1>
            <p className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSupabaseConfigured ? '#27ae60' : '#e67e22', animation: 'pulse 2s infinite' }}
              ></span>
              Vargani {settings.ganeshotsav_year || '2026'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Supabase Status Chip */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
            style={{
              backgroundColor: isSupabaseConfigured ? '#EDFAF1' : 'var(--color-gold-light)',
              borderColor: isSupabaseConfigured ? '#A8E6C1' : '#D4B44A',
              color: isSupabaseConfigured ? '#1a7a3f' : '#8B6914',
            }}
            title={isSupabaseConfigured ? 'Supabase Live Sync Active' : 'Local Storage Mode'}
          >
            {isSupabaseConfigured ? (
              <><Zap className="w-3 h-3" />Live</>
            ) : (
              <><CloudOff className="w-3 h-3" />Local</>
            )}
          </div>

          {/* Balance Badge (sm+) */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
            style={{ backgroundColor: 'var(--color-gold-light)', borderColor: 'var(--color-gold-muted)', color: 'var(--color-gold)' }}
          >
            <span className="font-medium text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Bal</span>
            <span>{formatINR(summary.currentBalance)}</span>
          </div>

          {/* Backup Button */}
          <button
            onClick={onQuickBackup}
            title="Export CSV Backup"
            className="p-2 rounded-xl transition-colors flex items-center gap-1"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Database className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Backup</span>
          </button>

          {/* User / Settings avatar */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
            title="Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
