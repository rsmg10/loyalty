import React, { useState } from 'react';
import { ChevronRight, Bell, Shield, HelpCircle, LogOut, Store, Users, Star, TrendingUp, Moon, Globe, Phone } from 'lucide-react';
import { BusinessMobileNav } from './BusinessMobileNav';

type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';

interface BusinessMobileProfileProps {
  onNavigate: (v: BizMobileView) => void;
  onSignOut: () => void;
}

export function BusinessMobileProfile({ onNavigate, onSignOut }: BusinessMobileProfileProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 pt-12 pb-8 px-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl">
            👨‍💼
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Mohammed Warfali</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-emerald-400/30 text-emerald-100 text-xs font-semibold px-2 py-0.5 rounded-full">Branch Manager</span>
            </div>
            <p className="text-emerald-200 text-xs mt-1">+218 91 234 5678</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4">
        {/* Business Info */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <Store size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Costa Coffee</p>
                <p className="text-gray-500 text-xs">Tripoli Mall · Ground Floor</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { icon: Users, label: 'Members', value: '412' },
              { icon: Star, label: 'Programs', value: '2' },
              { icon: TrendingUp, label: 'Visits/mo', value: '1.2k' },
            ].map((s, i) => (
              <div key={i} className="px-3 py-4 text-center">
                <s.icon size={18} className="text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-gray-900 text-base">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Info */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-5 pt-4 pb-2">My Info</p>
          {[
            { icon: Phone, label: 'Phone', value: '+218 91 234 5678' },
            { icon: Shield, label: 'Role', value: 'Branch Manager' },
            { icon: Globe, label: 'Branch', value: 'Tripoli Mall' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-5 pt-4 pb-2">Preferences</p>

          {/* Notifications toggle */}
          <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Notifications</p>
              <p className="text-xs text-gray-400">Alerts for redemptions & stamps</p>
            </div>
            <button
              onClick={() => setNotifications((n) => !n)}
              className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center gap-4 px-5 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Moon size={16} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Dark Mode</p>
              <p className="text-xs text-gray-400">Easier on eyes at night</p>
            </div>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {[
            { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact us', color: 'bg-blue-100', iconColor: 'text-blue-600' },
            { icon: Shield, label: 'Privacy Policy', sub: 'How we use your data', color: 'bg-violet-100', iconColor: 'text-violet-600' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon size={16} className={item.iconColor} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="w-full bg-white border-2 border-red-100 rounded-3xl py-4 flex items-center justify-center gap-3 text-red-600 font-bold shadow-sm hover:bg-red-50 active:scale-98 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <p className="text-center text-xs text-gray-300 pb-2">Loyalty Platform v1.0 · Libya</p>
      </div>

      <BusinessMobileNav active="profile" onNavigate={onNavigate} />
    </div>
  );
}
