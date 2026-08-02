import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { MandalSettings } from '../types';

interface AppLockModalProps {
  isUnlocked: boolean;
  onUnlock: () => void;
  settings: MandalSettings;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isUnlocked,
  onUnlock,
  settings,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isUnlocked) {
      setPin('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isUnlocked]);

  if (isUnlocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '5050') {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '5050') {
          setError(false);
          onUnlock();
        } else {
          setError(true);
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 sm:p-7 border border-amber-500/20 shadow-2xl relative text-center">
        {/* Mandal Branding Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-md mb-3">
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
            <span className="text-3xl">🪔</span>
          </div>

          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
            {settings.mandal_name || 'Ganraj Mitra Mandal'}
          </h2>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
            Ganeshotsav Vargani System ({settings.ganeshotsav_year || '2026'})
          </p>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold mb-5 border border-slate-200 dark:border-slate-700">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Security Passcode Required</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input Dots / Hidden Input */}
          <div className="relative flex justify-center items-center gap-3 my-2">
            <input
              ref={inputRef}
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPin(val);
                if (val.length === 4) {
                  if (val === '5050') {
                    setError(false);
                    onUnlock();
                  } else {
                    setError(true);
                    setPin('');
                  }
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              autoComplete="off"
            />

            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                    error
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                      : isFilled
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 scale-105 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Incorrect Passcode.</span>
            </div>
          )}

          {/* On-screen Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 active:scale-95 text-slate-800 dark:text-slate-100 font-extrabold text-lg transition-all border border-slate-200 dark:border-slate-700/60"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 active:scale-95 text-slate-800 dark:text-slate-100 font-extrabold text-lg transition-all border border-slate-200 dark:border-slate-700/60"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock App</span>
          </button>
        </form>
      </div>
    </div>
  );
};
