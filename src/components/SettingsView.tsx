import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { MandalSettings } from '../types';
import { StorageService } from '../utils/storage';

interface SettingsViewProps {
  settings: MandalSettings;
  onSaveSettings: (newSettings: MandalSettings) => void;
  onReloadData: () => void;
  onConfirmResetSample: () => void;
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
  onSaveSettings,
  onReloadData,
  onConfirmResetSample,
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
    const data = {
      settings: StorageService.getSettings(),
      donations: StorageService.getDonations(),
      expenses: StorageService.getExpenses(),
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GMM_Database_Backup_${year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportCSV = () => {
    const csvContent = StorageService.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GMM_Vargani_Backup_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.donations && json.expenses) {
          StorageService.saveDonations(json.donations);
          StorageService.saveExpenses(json.expenses);
          if (json.settings) StorageService.saveSettings(json.settings);
          onReloadData();
          alert('Database restored successfully!');
        } else {
          alert('Invalid backup file format');
        }
      } catch {
        alert('Failed to parse backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-20 max-w-2xl mx-auto">
      {/* Settings Form */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              Mandal & Receipt Settings
            </h2>
            <p className="text-xs text-slate-500">
              Customize committee name, branding, footer message, and WhatsApp contact
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mandal Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mandal Name
            </label>
            <input
              type="text"
              value={mandalName}
              onChange={(e) => setMandalName(e.target.value)}
              placeholder="Ganraj Mitra Mandal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Ganeshotsav Year & WhatsApp Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ganeshotsav Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Committee WhatsApp Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Mandal Logo URL / Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mandal Logo URL
            </label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            {/* Presets */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400">Presets:</span>
              {LOGO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLogo(preset.url)}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Footer Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Receipt Footer Note
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="Thank you for your generous contribution. Ganpati Bappa Morya!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </p>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Maintenance Section */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              Database Management & Backup
            </h3>
            <p className="text-xs text-slate-500">
              Export database, restore from backup, or load sample records
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Backup CSV */}
          <button
            onClick={handleExportCSV}
            className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-all flex items-center gap-2.5"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div className="text-left">
              <span className="block font-black">Export CSV / Excel</span>
              <span className="text-[10px] opacity-80">Full donation & expense report</span>
            </div>
          </button>

          {/* Backup JSON */}
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-950/80 transition-all flex items-center gap-2.5"
          >
            <Database className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <span className="block font-black">Backup Database (JSON)</span>
              <span className="text-[10px] opacity-80">Complete system backup file</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2.5 cursor-pointer">
            <Upload className="w-5 h-5 text-sky-600" />
            <div className="text-left">
              <span className="block font-black">Restore from Backup</span>
              <span className="text-[10px] text-slate-400">Upload JSON backup file</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Reset to Sample Data */}
          <button
            onClick={onConfirmResetSample}
            className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-200 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-950/80 transition-all flex items-center gap-2.5"
          >
            <RefreshCw className="w-5 h-5 text-sky-600" />
            <div className="text-left">
              <span className="block font-black">Load Sample Data</span>
              <span className="text-[10px] opacity-80">Reset to Ganeshotsav sample records</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
