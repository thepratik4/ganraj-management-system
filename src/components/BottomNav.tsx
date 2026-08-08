import React from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Settings,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'donations'
  | 'expenses'
  | 'transactions'
  | 'reports'
  | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Transact', icon: ListOrdered },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'transactions' &&
              (activeTab === 'donations' || activeTab === 'expenses'));
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200"
              style={{ color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
            >
              <div
                className="p-1.5 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--color-gold-light)' : 'transparent',
                }}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
              </div>
              <span
                className="text-[10px] mt-0.5 tracking-tight"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
