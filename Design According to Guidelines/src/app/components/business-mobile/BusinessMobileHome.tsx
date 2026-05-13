import React, { useState } from 'react';
import { QrCode, TrendingUp, Users, Gift, ChevronRight, Zap, Coffee, Star, Bell } from 'lucide-react';
import { BusinessMobileNav } from './BusinessMobileNav';

type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';

interface BusinessMobileHomeProps {
  onNavigate: (v: BizMobileView) => void;
}

const todayStats = [
  { label: 'Stamps Given', value: 38, icon: Star, color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { label: 'Redeemed', value: 6, icon: Gift, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { label: 'New Members', value: 4, icon: Users, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { label: 'Total Visits', value: 82, icon: TrendingUp, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-700' },
];

const recentActivity = [
  { id: 1, name: 'Ahmed Al-Mansouri', action: '+1 Stamp', program: 'Coffee Rewards', time: '4m ago', type: 'stamp' },
  { id: 2, name: 'Fatima Khalidi', action: 'Free Coffee', program: 'Coffee Rewards', time: '11m ago', type: 'redeem' },
  { id: 3, name: 'Omar Benali', action: '+1 Stamp', program: 'Coffee Rewards', time: '18m ago', type: 'stamp' },
  { id: 4, name: 'Nura Al-Fassi', action: 'Joined Program', program: 'Coffee Rewards', time: '25m ago', type: 'join' },
];

export function BusinessMobileHome({ onNavigate }: BusinessMobileHomeProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 pt-12 pb-6 px-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-emerald-200 text-sm">{greeting},</p>
            <h1 className="text-white text-xl font-bold">Mohammed Warfali</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-300 text-xs">Costa Coffee · Tripoli Mall</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
              <Bell size={18} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
            </button>
            <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
              <span className="text-lg">👨‍💼</span>
            </div>
          </div>
        </div>

        {/* Big Scan CTA */}
        <button
          onClick={() => onNavigate('scan')}
          className="w-full bg-white/15 border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-4 backdrop-blur-sm hover:bg-white/20 active:scale-98 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <QrCode size={26} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-bold">Scan Customer QR</p>
            <p className="text-emerald-200 text-xs mt-0.5">Add stamps or redeem rewards instantly</p>
          </div>
          <ChevronRight className="text-white/60" size={20} />
        </button>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Today Stats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Today's Summary</h2>
            <span className="text-xs text-gray-400">Sat 18 Apr</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {todayStats.map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl px-4 py-4`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2 shadow-sm`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Active */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Active Programs</h2>
            <button className="text-emerald-600 text-sm font-semibold">Manage</button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {[
              { name: 'Coffee Rewards', description: '8 stamps → Free Coffee', members: 412, active: true },
              { name: 'Monthly VIP', description: '20 visits → 30% off', members: 87, active: true },
            ].map((prog, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Coffee size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{prog.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{prog.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{prog.members}</p>
                  <p className="text-xs text-gray-400">members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <button className="text-emerald-600 text-sm font-semibold" onClick={() => onNavigate('activity')}>
              View all
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {recentActivity.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'redeem' ? 'bg-emerald-100' :
                  item.type === 'join' ? 'bg-amber-100' : 'bg-indigo-100'
                }`}>
                  {item.type === 'redeem' ? <Gift size={16} className="text-emerald-600" /> :
                   item.type === 'join' ? <Users size={16} className="text-amber-600" /> :
                   <Star size={16} className="text-indigo-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate">{item.action} · {item.program}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shift tip */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-start gap-3">
          <Zap size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Peak hours approaching</p>
            <p className="text-xs text-amber-700 mt-0.5">12:00–14:00 is typically your busiest period. 3 customers have rewards ready to redeem!</p>
          </div>
        </div>
      </div>

      <BusinessMobileNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
