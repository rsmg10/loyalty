import React from 'react';
import { TrendingUp, Search, Gift, QrCode } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const { t } = useLanguage();

  const leftItems = [
    { icon: TrendingUp, label: t('nav.home'), view: 'home' },
    { icon: Search, label: t('nav.explore'), view: 'explore' },
  ];

  const rightItems = [
    { icon: Gift, label: t('nav.rewards'), view: 'rewards' },
    { icon: '👤' as const, label: t('nav.profile'), view: 'profile' },
  ];

  const renderItem = (item: typeof leftItems[0] | typeof rightItems[0]) => {
    const isActive = activeView === item.view;
    return (
      <button
        key={item.view}
        className={`flex flex-col items-center gap-0.5 transition-all min-w-[56px] py-1 ${
          isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'
        }`}
        onClick={() => onNavigate(item.view)}
      >
        {typeof item.icon === 'string' ? (
          <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
        ) : (
          <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
        )}
        <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
        {isActive && <div className="w-1 h-1 rounded-full bg-indigo-500" />}
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-slate-200 shadow-lg z-50">
      <div className="flex items-center justify-around px-3 pt-2 pb-3 max-w-md mx-auto">
        {/* Left items */}
        {leftItems.map(renderItem)}

        {/* Center QR button */}
        <div className="flex flex-col items-center -mt-6">
          <button
            onClick={() => onNavigate('qrcode')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              activeView === 'qrcode'
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 ring-4 ring-indigo-200'
                : 'bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600'
            }`}
          >
            <QrCode size={26} className="text-white" strokeWidth={2} />
          </button>
          <span className={`text-xs mt-1 ${activeView === 'qrcode' ? 'text-indigo-600 font-semibold' : 'text-gray-400 font-medium'}`}>
            My QR
          </span>
        </div>

        {/* Right items */}
        {rightItems.map(renderItem)}
      </div>
    </div>
  );
}
