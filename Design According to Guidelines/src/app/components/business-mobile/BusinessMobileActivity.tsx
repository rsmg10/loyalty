import React, { useState } from 'react';
import { Plus, Gift, Users, Search, Filter, ChevronDown } from 'lucide-react';
import { BusinessMobileNav } from './BusinessMobileNav';

type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';

interface BusinessMobileActivityProps {
  onNavigate: (v: BizMobileView) => void;
}

type FilterType = 'all' | 'stamp' | 'redeem' | 'join';

const allActivity = [
  { id: 1, name: 'Ahmed Al-Mansouri', action: '+1 Stamp', program: 'Coffee Rewards', time: '09:12', type: 'stamp' as const, avatar: 'AM' },
  { id: 2, name: 'Fatima Khalidi', action: 'Free Coffee', program: 'Coffee Rewards', time: '09:05', type: 'redeem' as const, avatar: 'FK' },
  { id: 3, name: 'Omar Benali', action: '+1 Stamp', program: 'Monthly VIP', time: '08:58', type: 'stamp' as const, avatar: 'OB' },
  { id: 4, name: 'Nura Al-Fassi', action: 'Joined Program', program: 'Coffee Rewards', time: '08:44', type: 'join' as const, avatar: 'NF' },
  { id: 5, name: 'Khaled Zwawi', action: '30% Off', program: 'Monthly VIP', time: '08:30', type: 'redeem' as const, avatar: 'KZ' },
  { id: 6, name: 'Maryam Elgamal', action: '+1 Stamp', program: 'Coffee Rewards', time: '08:19', type: 'stamp' as const, avatar: 'ME' },
  { id: 7, name: 'Yusuf Trabelsi', action: '+1 Stamp', program: 'Coffee Rewards', time: '08:07', type: 'stamp' as const, avatar: 'YT' },
  { id: 8, name: 'Salma Hnish', action: 'Joined Program', program: 'Monthly VIP', time: '07:53', type: 'join' as const, avatar: 'SH' },
  { id: 9, name: 'Ibrahim Shalabi', action: 'Free Coffee', program: 'Coffee Rewards', time: 'Yesterday', type: 'redeem' as const, avatar: 'IS' },
  { id: 10, name: 'Reem Al-Barasi', action: '+1 Stamp', program: 'Coffee Rewards', time: 'Yesterday', type: 'stamp' as const, avatar: 'RB' },
];

const filterLabels: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'stamp', label: 'Stamps' },
  { key: 'redeem', label: 'Redeemed' },
  { key: 'join', label: 'New Members' },
];

const typeConfig = {
  stamp: { icon: Plus, bg: 'bg-indigo-100', iconColor: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', label: 'Stamp' },
  redeem: { icon: Gift, bg: 'bg-emerald-100', iconColor: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', label: 'Redeemed' },
  join: { icon: Users, bg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', label: 'Joined' },
};

export function BusinessMobileActivity({ onNavigate }: BusinessMobileActivityProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const todayCounts = {
    stamps: allActivity.filter((a) => a.type === 'stamp' && a.time.includes(':')).length,
    redeems: allActivity.filter((a) => a.type === 'redeem' && a.time.includes(':')).length,
    joins: allActivity.filter((a) => a.type === 'join' && a.time.includes(':')).length,
  };

  const filtered = allActivity.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group by day
  const todayItems = filtered.filter((a) => a.time.includes(':'));
  const yesterdayItems = filtered.filter((a) => a.time === 'Yesterday');

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 pt-12 pb-5 px-5">
        <h1 className="text-white text-xl font-bold mb-1">Activity Log</h1>
        <p className="text-emerald-200 text-sm">Today's transactions</p>

        {/* Mini stats */}
        <div className="flex gap-2 mt-4">
          {[
            { label: 'Stamps', value: todayCounts.stamps, color: 'bg-indigo-400/20' },
            { label: 'Redeemed', value: todayCounts.redeems, color: 'bg-emerald-400/20' },
            { label: 'New', value: todayCounts.joins, color: 'bg-amber-400/20' },
          ].map((s, i) => (
            <div key={i} className={`flex-1 ${s.color} border border-white/10 rounded-xl px-3 py-2 text-center`}>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/70 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
          <Search size={17} className="text-gray-400 flex-shrink-0" />
          <input
            className="flex-1 text-gray-900 placeholder-gray-400 outline-none bg-transparent text-sm"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterLabels.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f.key
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Today */}
        {todayItems.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Today</p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {todayItems.map((item, i) => {
                const cfg = typeConfig[item.type];
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0 font-bold text-sm text-gray-600`}>
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">{item.program}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {item.action}
                      </span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {yesterdayItems.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Yesterday</p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {yesterdayItems.map((item, i) => {
                const cfg = typeConfig[item.type];
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0 font-bold text-sm text-gray-600`}>
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">{item.program}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {item.action}
                      </span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No results</p>
            <p className="text-sm mt-1">Try a different filter or search</p>
          </div>
        )}
      </div>

      <BusinessMobileNav active="activity" onNavigate={onNavigate} />
    </div>
  );
}
