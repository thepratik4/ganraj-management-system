import React from 'react';
import { Database, Zap, CloudOff } from 'lucide-react';
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
  onOpenSupabaseModal,
}) => {
  const isPositive = summary.currentBalance >= 0;

  return (
    <header className="sticky top-0 z-30 bg-amber-500/95 backdrop-blur-md border-b border-amber-600/30 shadow-md transition-colors overflow-x-hidden">
      {/* Top Banner Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700"></div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Logo & Mandal Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenSettings}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center overflow-hidden shadow-sm">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Mandal Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="text-xl">🪔</span>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-amber-950 text-[10px] font-extrabold px-1 rounded-full shadow border border-amber-200">
              {settings.ganeshotsav_year || '2026'}
            </span>
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-amber-950 leading-tight tracking-wide flex items-center gap-1.5">
              <span>{settings.mandal_name}</span>
            </h1>
            <p className="text-xs text-amber-900/90 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Vargani Management System
            </p>
          </div>
        </div>

        {/* Right Controls & Balance Chip */}
        <div className="flex items-center gap-2">
          {/* Supabase Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${
              isSupabaseConfigured
                ? 'bg-emerald-900 text-emerald-100 border-emerald-500'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title={isSupabaseConfigured ? 'Supabase Realtime Cloud Sync Active' : 'Local Storage Cache Mode'}
          >
            {isSupabaseConfigured ? (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span className="hidden xs:inline">Supabase Live</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden xs:inline">Local Mode</span>
              </>
            )}
          </div>

          {/* Quick Balance Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              isPositive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <span>Balance:</span>
            <span className="text-sm font-black">{formatINR(summary.currentBalance)}</span>
          </div>

          {/* Backup Button */}
          <button
            onClick={onQuickBackup}
            title="Export CSV Backup"
            className="p-2 rounded-xl text-amber-950 hover:bg-amber-600/20 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Database className="w-4 h-4 text-amber-900" />
            <span className="hidden md:inline">Backup</span>
          </button>
        </div>
      </div>
    </header>
  );
};

