import React from 'react';
import {
  LayoutDashboard,
  HeartHandshake,
  Receipt,
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
    { id: 'donations' as ActiveTab, label: 'Donations', icon: HeartHandshake },
    { id: 'expenses' as ActiveTab, label: 'Expenses', icon: Receipt },
    { id: 'transactions' as ActiveTab, label: 'All Txns', icon: ListOrdered },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
