import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';
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
    if (error) setError(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7 text-center relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Subtle gold top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-muted), transparent)' }}
        />

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mb-4"
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
              <span className="text-2xl">🪔</span>
            )}
          </div>

          <h2
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}
          >
            {settings.mandal_name || 'Ganraj Mitra Mandal'}
          </h2>
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Ganeshotsav Vargani System · {settings.ganeshotsav_year || '2026'}
          </p>
        </div>

        {/* Security Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
          Security Passcode Required
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PIN Dots */}
          <div className="relative flex justify-center items-center gap-3 my-1">
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
                  className="w-12 h-13 rounded-2xl flex items-center justify-center text-xl font-black transition-all"
                  style={{
                    border: `2px solid ${error ? 'var(--color-expense)' : isFilled ? 'var(--color-gold-muted)' : 'var(--color-border)'}`,
                    backgroundColor: error
                      ? 'var(--color-expense-light)'
                      : isFilled
                      ? 'var(--color-gold-light)'
                      : 'var(--bg-subtle)',
                    color: error ? 'var(--color-expense)' : isFilled ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    transform: isFilled ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {error && (
            <div
              className="py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold animate-shake"
              style={{ backgroundColor: 'var(--color-expense-light)', border: '1px solid #e0b4b4', color: 'var(--color-expense)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Incorrect Passcode. Try again.
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="py-3.5 rounded-2xl font-bold text-lg transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-gold-light)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPin(''); setError(false); }}
              className="py-3.5 rounded-2xl font-semibold text-xs transition-all active:scale-95"
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3.5 rounded-2xl font-bold text-lg transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-gold-light)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3.5 rounded-2xl font-bold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 mt-1"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            <KeyRound className="w-4 h-4" style={{ color: 'var(--color-gold-muted)' }} />
            Unlock App
          </button>
        </form>
      </div>
    </div>
  );
};
