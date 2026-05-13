import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Plus, Gift, CheckCircle2, RotateCcw, Zap, ChevronDown, Search, Flashlight } from 'lucide-react';
import { BusinessMobileNav } from './BusinessMobileNav';

type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';
type ScanPhase = 'idle' | 'scanning' | 'found' | 'stamp-done' | 'redeem-done';

interface LoyaltyProgram {
  id: string;
  name: string;
  progress: number;
  total: number;
  reward: string;
}

interface ScannedCustomer {
  customerId: string;
  name: string;
  phone: string;
  memberSince: string;
  totalVisits: number;
  programs: LoyaltyProgram[];
}

const MOCK_CUSTOMER: ScannedCustomer = {
  customerId: 'LY-2024-001847',
  name: 'Ahmed Al-Mansouri',
  phone: '+218 91 234 5678',
  memberSince: 'Jan 2024',
  totalVisits: 34,
  programs: [
    { id: 'coffee', name: 'Coffee Rewards', progress: 4, total: 8, reward: 'Free Coffee' },
    { id: 'vip', name: 'Monthly VIP', progress: 17, total: 20, reward: '30% Off' },
  ],
};

const MOCK_QR_VALUE = JSON.stringify({
  customerId: MOCK_CUSTOMER.customerId,
  name: MOCK_CUSTOMER.name,
  phone: MOCK_CUSTOMER.phone,
  programs: MOCK_CUSTOMER.programs,
  ts: 1713446400000,
});

interface BusinessMobileScanProps {
  onNavigate: (v: BizMobileView) => void;
}

export function BusinessMobileScan({ onNavigate }: BusinessMobileScanProps) {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [customer, setCustomer] = useState<ScannedCustomer | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  // Animate scan line
  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setInterval(() => setScanLine((l) => (l >= 100 ? 0 : l + 2)), 18);
    return () => clearInterval(t);
  }, [phase]);

  const handleScan = () => {
    setPhase('scanning');
    setTimeout(() => {
      setCustomer(MOCK_CUSTOMER);
      setSelectedProgram(MOCK_CUSTOMER.programs[0]);
      setPhase('found');
    }, 2200);
  };

  const handleStamp = () => {
    if (!customer || !selectedProgram) return;
    const updated = {
      ...customer,
      programs: customer.programs.map((p) =>
        p.id === selectedProgram.id ? { ...p, progress: Math.min(p.progress + 1, p.total) } : p
      ),
    };
    setCustomer(updated);
    setSelectedProgram(updated.programs.find((p) => p.id === selectedProgram.id) ?? selectedProgram);
    setPhase('stamp-done');
  };

  const handleRedeem = () => {
    setPhase('redeem-done');
  };

  const handleReset = () => {
    setPhase('idle');
    setCustomer(null);
    setSelectedProgram(null);
    setProgramsOpen(false);
  };

  const isComplete = selectedProgram ? selectedProgram.progress >= selectedProgram.total : false;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 pt-12 pb-5 px-5 text-white">
        <h1 className="text-xl font-bold">Scan QR Code</h1>
        <p className="text-emerald-200 text-sm mt-0.5">Tap the button below to scan a customer's code</p>
      </div>

      <div className="flex-1 px-5 pt-5 space-y-4">

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <>
            {/* Camera preview area */}
            <div className="relative bg-black rounded-3xl overflow-hidden aspect-square max-w-sm mx-auto shadow-2xl">
              {/* Simulated camera background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="opacity-20">
                  <QRCodeSVG value={MOCK_QR_VALUE} size={160} fgColor="white" bgColor="transparent" />
                </div>
              </div>

              {/* Corner markers */}
              {[
                'top-4 left-4 border-t-4 border-l-4 rounded-tl-xl',
                'top-4 right-4 border-t-4 border-r-4 rounded-tr-xl',
                'bottom-4 left-4 border-b-4 border-l-4 rounded-bl-xl',
                'bottom-4 right-4 border-b-4 border-r-4 rounded-br-xl',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-emerald-400 ${cls}`} />
              ))}

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <QrCode size={16} className="text-emerald-400" />
                  <span className="text-white text-sm font-medium">Point at customer's QR</span>
                </div>
              </div>

              {/* Flashlight button */}
              <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-lg">🔦</span>
              </button>
            </div>

            {/* Scan button */}
            <button
              onClick={handleScan}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:from-emerald-400 hover:to-teal-500 active:scale-98 transition-all"
            >
              <QrCode size={24} />
              Simulate Scan
            </button>

            {/* Search divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-xs">or find by</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Search fallback */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
                <Search size={17} className="text-gray-400 flex-shrink-0" />
                <input
                  className="flex-1 text-gray-900 placeholder-gray-400 outline-none bg-transparent text-sm"
                  placeholder="+218 phone or customer ID"
                />
              </div>
              <button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-all">
                Find
              </button>
            </div>
          </>
        )}

        {/* ── SCANNING ANIMATION ── */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center justify-center pt-8">
            <div className="relative w-64 h-64 mx-auto">
              {/* Dark background */}
              <div className="absolute inset-0 bg-gray-900 rounded-3xl overflow-hidden">
                {/* QR ghost */}
                <div className="absolute inset-6 opacity-30 flex items-center justify-center">
                  <QRCodeSVG value={MOCK_QR_VALUE} size={180} fgColor="white" bgColor="transparent" />
                </div>
                {/* Animated scan line */}
                <div
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px]"
                  style={{ top: `${scanLine}%`, transition: 'top 18ms linear' }}
                />
                <div
                  className="absolute left-2 right-2 h-4 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
                  style={{ top: `calc(${scanLine}% - 8px)` }}
                />
              </div>
              {/* Corner markers */}
              {['top-2 left-2 border-t-4 border-l-4 rounded-tl-2xl',
                'top-2 right-2 border-t-4 border-r-4 rounded-tr-2xl',
                'bottom-2 left-2 border-b-4 border-l-4 rounded-bl-2xl',
                'bottom-2 right-2 border-b-4 border-r-4 rounded-br-2xl'
              ].map((cls, i) => (
                <div key={i} className={`absolute w-10 h-10 border-emerald-400 ${cls}`} />
              ))}
            </div>
            <p className="text-gray-700 font-semibold mt-6">Reading QR code…</p>
            <p className="text-gray-400 text-sm mt-1">Hold steady</p>
          </div>
        )}

        {/* ── CUSTOMER FOUND ── */}
        {phase === 'found' && customer && selectedProgram && (
          <div className="space-y-4">
            {/* Customer card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-lg leading-tight">{customer.name}</p>
                    <span className="bg-emerald-400/30 text-emerald-100 text-xs px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                  </div>
                  <p className="text-emerald-200 text-sm mt-0.5">{customer.phone}</p>
                </div>
                <button onClick={handleReset} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Member since', value: customer.memberSince },
                  { label: 'Total visits', value: customer.totalVisits },
                  { label: 'Programs', value: customer.programs.length },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/15 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-white font-bold text-base">{stat.value}</p>
                    <p className="text-emerald-200 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Program selector */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center gap-3 px-5 py-4"
                onClick={() => setProgramsOpen((o) => !o)}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Gift size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-gray-500 font-medium">Selected Program</p>
                  <p className="font-bold text-gray-900">{selectedProgram.name}</p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${programsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {programsOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {customer.programs.map((prog) => {
                    const done = prog.progress >= prog.total;
                    return (
                      <button
                        key={prog.id}
                        onClick={() => { setSelectedProgram(prog); setProgramsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left ${
                          selectedProgram.id === prog.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{prog.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${(prog.progress / prog.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{prog.progress}/{prog.total}</span>
                          </div>
                        </div>
                        {done && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ready!</span>}
                        {selectedProgram.id === prog.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress for selected program */}
            <div className="bg-white border border-slate-200 rounded-3xl px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">{selectedProgram.name} Progress</p>
                <p className="text-sm font-bold text-gray-900">{selectedProgram.progress}/{selectedProgram.total}</p>
              </div>
              {/* Stamp dots */}
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: selectedProgram.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                      i < selectedProgram.progress
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm'
                        : 'bg-slate-100'
                    }`}
                  >
                    {i < selectedProgram.progress ? '☕' : ''}
                  </div>
                ))}
              </div>
              {isComplete ? (
                <div className="flex items-center gap-1.5 mt-3">
                  <Zap size={14} className="text-emerald-600" />
                  <p className="text-emerald-700 font-semibold text-sm">Card complete — {selectedProgram.reward} unlocked!</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedProgram.total - selectedProgram.progress} more stamp{selectedProgram.total - selectedProgram.progress !== 1 ? 's' : ''} to earn <strong>{selectedProgram.reward}</strong>
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <button
                onClick={handleStamp}
                className="flex-1 flex flex-col items-center justify-center gap-2 bg-indigo-600 text-white rounded-2xl py-5 font-bold shadow-lg active:scale-95 transition-all"
              >
                <Plus size={26} strokeWidth={2.5} />
                <span>Add Stamp</span>
              </button>
              <button
                onClick={handleRedeem}
                disabled={!isComplete}
                className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-5 font-bold shadow-lg transition-all ${
                  isComplete
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Gift size={26} strokeWidth={2.5} />
                <span>Redeem</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAMP DONE ── */}
        {phase === 'stamp-done' && customer && selectedProgram && (
          <div className="flex flex-col items-center text-center pt-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-5 shadow-inner">
              <CheckCircle2 size={52} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Stamp Added!</h2>
            <p className="text-gray-500 mb-1">{customer.name}</p>
            <p className="text-indigo-600 font-semibold">{selectedProgram.name}</p>
            <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-2xl px-6 py-3 inline-flex items-center gap-2">
              <span className="text-indigo-700 font-bold text-lg">{selectedProgram.progress}</span>
              <span className="text-indigo-500">/</span>
              <span className="text-indigo-500">{selectedProgram.total} stamps</span>
            </div>
            {selectedProgram.progress >= selectedProgram.total && (
              <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <Zap size={16} className="text-emerald-600" />
                <span className="text-emerald-700 font-semibold text-sm">Card full — {selectedProgram.reward} ready!</span>
              </div>
            )}
            <div className="flex gap-3 mt-8 w-full">
              <button
                onClick={() => setPhase('found')}
                className="flex-1 border-2 border-slate-300 text-slate-700 rounded-2xl py-4 font-bold hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                Back
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-4 font-bold shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                New Scan
              </button>
            </div>
          </div>
        )}

        {/* ── REDEEM DONE ── */}
        {phase === 'redeem-done' && customer && selectedProgram && (
          <div className="flex flex-col items-center text-center pt-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-5 shadow-inner">
              <Gift size={52} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Reward Redeemed!</h2>
            <p className="text-gray-500 mb-4">{customer.name}</p>
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl px-8 py-5 mb-2">
              <p className="text-3xl mb-2">🎁</p>
              <p className="text-emerald-800 font-bold text-xl">{selectedProgram.reward}</p>
              <p className="text-emerald-600 text-sm mt-1">{selectedProgram.name}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2 mb-8">Stamps have been reset for this program</p>
            <button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-4 font-bold shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              New Scan
            </button>
          </div>
        )}
      </div>

      <BusinessMobileNav active="scan" onNavigate={onNavigate} />
    </div>
  );
}
