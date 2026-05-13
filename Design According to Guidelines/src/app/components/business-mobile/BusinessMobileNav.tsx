import React from 'react';
import { Home, QrCode, Users, Clock, User } from 'lucide-react';

type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';

interface BusinessMobileNavProps {
  active: BizMobileView;
  onNavigate: (v: BizMobileView) => void;
}

const navItems: { view: BizMobileView; icon: React.ElementType; label: string }[] = [
  { view: 'home', icon: Home, label: 'Home' },
  { view: 'customers', icon: Users, label: 'Customers' },
  { view: 'scan', icon: QrCode, label: 'Scan' },
  { view: 'activity', icon: Clock, label: 'Activity' },
  { view: 'profile', icon: User, label: 'Profile' },
];

export function BusinessMobileNav({ active, onNavigate }: BusinessMobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isCenter = item.view === 'scan';
          const isActive = active === item.view;

          if (isCenter) {
            return (
              <div key={item.view} className="flex flex-col items-center flex-1 -mt-5">
                <button
                  onClick={() => onNavigate(item.view)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-600 ring-4 ring-emerald-200'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-700'
                  }`}
                >
                  <QrCode size={28} className="text-white" strokeWidth={2} />
                </button>
                <span className={`text-xs mt-1 pb-1 ${isActive ? 'text-emerald-600 font-bold' : 'text-gray-400 font-medium'}`}>
                  Scan
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center flex-1 pt-2 pb-3 transition-all ${
                isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-400'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-xs mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
