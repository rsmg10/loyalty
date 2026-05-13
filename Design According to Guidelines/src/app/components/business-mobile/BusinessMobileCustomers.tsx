import React, { useState } from 'react';
import { Search, QrCode, Gift, Star, ChevronRight, Users, TrendingUp, X } from 'lucide-react';
import { BusinessMobileNav } from './BusinessMobileNav';

type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';

interface BusinessMobileCustomersProps {
  onNavigate: (v: BizMobileView) => void;
}

const customers = [
  { id: 1, name: 'Ahmed Al-Mansouri', phone: '+218 91 234 5678', visits: 34, stamps: 4, total: 8, program: 'Coffee Rewards', lastVisit: 'Today', status: 'active', avatar: 'AM' },
  { id: 2, name: 'Fatima Khalidi', phone: '+218 92 345 6789', visits: 28, stamps: 8, total: 8, program: 'Coffee Rewards', lastVisit: 'Today', status: 'ready', avatar: 'FK' },
  { id: 3, name: 'Omar Benali', phone: '+218 91 456 7890', visits: 51, stamps: 3, total: 8, program: 'Coffee Rewards', lastVisit: 'Yesterday', status: 'active', avatar: 'OB' },
  { id: 4, name: 'Nura Al-Fassi', phone: '+218 94 567 8901', visits: 12, stamps: 2, total: 8, program: 'Coffee Rewards', lastVisit: '2 days ago', status: 'new', avatar: 'NF' },
  { id: 5, name: 'Khaled Zwawi', phone: '+218 91 678 9012', visits: 67, stamps: 20, total: 20, program: 'Monthly VIP', lastVisit: 'Today', status: 'ready', avatar: 'KZ' },
  { id: 6, name: 'Maryam Elgamal', phone: '+218 92 789 0123', visits: 22, stamps: 6, total: 8, program: 'Coffee Rewards', lastVisit: '3 days ago', status: 'active', avatar: 'ME' },
  { id: 7, name: 'Yusuf Trabelsi', phone: '+218 91 890 1234', visits: 15, stamps: 1, total: 8, program: 'Coffee Rewards', lastVisit: '1 week ago', status: 'inactive', avatar: 'YT' },
  { id: 8, name: 'Salma Hnish', phone: '+218 93 901 2345', visits: 8, stamps: 5, total: 8, program: 'Monthly VIP', lastVisit: '5 days ago', status: 'active', avatar: 'SH' },
];

type StatusFilter = 'all' | 'ready' | 'active' | 'new';

const statusConfig = {
  ready: { label: 'Ready to Redeem', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  active: { label: 'Active', bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  new: { label: 'New', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

interface CustomerDetailProps {
  customer: typeof customers[0];
  onClose: () => void;
  onScan: () => void;
}

function CustomerDetail({ customer, onClose, onScan }: CustomerDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 text-lg">Customer Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {customer.avatar}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{customer.name}</p>
            <p className="text-gray-500 text-sm">{customer.phone}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Visits', value: customer.visits },
            { label: 'Stamps', value: `${customer.stamps}/${customer.total}` },
            { label: 'Last Visit', value: customer.lastVisit },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-3 text-center">
              <p className="font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Program progress */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 text-sm">{customer.program}</p>
            {customer.status === 'ready' && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Ready!</span>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {Array.from({ length: customer.total }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                  i < customer.stamps ? 'bg-emerald-500 text-white' : 'bg-white border border-emerald-200'
                }`}
              >
                {i < customer.stamps ? '✓' : ''}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">{customer.total - customer.stamps} more stamps to unlock reward</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onScan}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-3.5 font-bold shadow-md active:scale-95 transition-all"
          >
            <QrCode size={18} />
            Scan Their QR
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 rounded-2xl py-3.5 font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function BusinessMobileCustomers({ onNavigate }: BusinessMobileCustomersProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);

  const filtered = customers.filter((c) => {
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const readyCount = customers.filter((c) => c.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 pt-12 pb-5 px-5">
        <h1 className="text-white text-xl font-bold mb-1">Customers</h1>
        <p className="text-emerald-200 text-sm">{customers.length} members · {readyCount} ready to redeem</p>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 bg-white/15 border border-white/20 rounded-2xl px-4 py-3">
          <Search size={17} className="text-emerald-200 flex-shrink-0" />
          <input
            className="flex-1 text-white placeholder-emerald-300 outline-none bg-transparent text-sm"
            placeholder="Name or phone number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {([
            { key: 'all', label: 'All' },
            { key: 'ready', label: '🎁 Ready' },
            { key: 'active', label: 'Active' },
            { key: 'new', label: 'New' },
          ] as { key: StatusFilter; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                statusFilter === f.key
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Ready to redeem banner */}
        {statusFilter === 'all' && readyCount > 0 && (
          <button
            onClick={() => setStatusFilter('ready')}
            className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Gift size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-800 text-sm">{readyCount} customers ready to redeem</p>
              <p className="text-emerald-600 text-xs mt-0.5">Tap to view them</p>
            </div>
            <ChevronRight size={16} className="text-emerald-400" />
          </button>
        )}

        {/* Customer list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.map((c, i) => {
            const cfg = statusConfig[c.status as keyof typeof statusConfig] ?? statusConfig.inactive;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm flex-shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} flex-shrink-0`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{c.visits} visits · Last: {c.lastVisit}</p>
                  {/* Progress mini bar */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(c.stamps / c.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{c.stamps}/{c.total}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium text-sm">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Sheet */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onScan={() => { setSelectedCustomer(null); onNavigate('scan'); }}
        />
      )}

      <BusinessMobileNav active="customers" onNavigate={onNavigate} />
    </div>
  );
}
