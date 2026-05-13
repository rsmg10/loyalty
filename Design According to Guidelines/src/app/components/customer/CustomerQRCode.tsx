import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, RefreshCw, Shield, Wifi, CheckCircle2, Copy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CustomerQRCodeProps {
  onBack: () => void;
}

export function CustomerQRCode({ onBack }: CustomerQRCodeProps) {
  const { language } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  // QR payload — in a real app this token would come from the backend
  const customerId = 'LY-2024-001847';
  const customerName = language === 'en' ? 'Ahmed Al-Mansouri' : 'أحمد المنصوري';
  const qrPayload = JSON.stringify({
    customerId,
    name: 'Ahmed Al-Mansouri',
    phone: '+218912345678',
    programs: [
      { id: 'costa-coffee', name: "Costa Coffee", progress: 4, total: 8, reward: 'Free Coffee' },
      { id: 'nandos-tripoli', name: "Nando's Tripoli", progress: 7, total: 10, reward: 'Free Meal' },
      { id: 'casper-gambinis', name: "Casper & Gambini's", progress: 2, total: 5, reward: 'Free Dessert' },
    ],
    ts: timestamp,
  });

  // Auto-refresh every 2 minutes for security
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleRefresh();
          return 120;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setTimestamp(Date.now());
    setRefreshKey((k) => k + 1);
    setSecondsLeft(120);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(customerId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pct = (secondsLeft / 120) * 100;
  const radius = 10;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - pct / 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-lg">
            {language === 'en' ? 'My QR Code' : 'رمز QR الخاص بي'}
          </h1>
          <p className="text-indigo-200 text-xs">
            {language === 'en' ? 'Show this to staff to earn or redeem' : 'أرِه للموظف لكسب النقاط أو الاسترداد'}
          </p>
        </div>
        {/* Countdown ring */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" className="-rotate-90">
            <circle cx="20" cy="20" r={radius + 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle
              cx="20" cy="20" r={radius + 4}
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * (radius + 4)}
              strokeDashoffset={2 * Math.PI * (radius + 4) * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="absolute text-white text-xs font-bold">{secondsLeft > 60 ? `${Math.ceil(secondsLeft / 60)}m` : `${secondsLeft}s`}</span>
        </div>
      </div>

      {/* QR Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Customer info strip */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{customerName}</p>
                <p className="text-indigo-200 text-xs">+218 91 234 5678</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full">
                <Wifi size={12} className="text-emerald-300" />
                <span className="text-emerald-300 text-xs font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="px-8 pt-8 pb-6 flex flex-col items-center">
            <div className="relative p-3 bg-white rounded-2xl border-2 border-indigo-100 shadow-inner">
              <QRCodeSVG
                key={refreshKey}
                value={qrPayload}
                size={220}
                level="H"
                fgColor="#312e81"
                bgColor="#ffffff"
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23312e81'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E",
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>

            {/* Customer ID */}
            <button
              onClick={handleCopyId}
              className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-100 transition-colors"
            >
              {copied ? (
                <CheckCircle2 size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} className="text-slate-400" />
              )}
              <span className="font-mono text-sm text-slate-700 tracking-wider">{customerId}</span>
            </button>

            {/* Programs summary */}
            <div className="w-full mt-5 space-y-2">
              <p className="text-xs text-slate-400 text-center uppercase tracking-wide mb-2">
                {language === 'en' ? 'Active Programs' : 'البرامج النشطة'}
              </p>
              {[
                { logo: '☕', name: "Costa Coffee", progress: 4, total: 8, color: 'from-indigo-400 to-violet-400' },
                { logo: '🍗', name: "Nando's Tripoli", progress: 7, total: 10, color: 'from-amber-400 to-orange-400' },
                { logo: '🍰', name: "Casper & Gambini's", progress: 2, total: 5, color: 'from-teal-400 to-cyan-400' },
              ].map((p, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-lg">{p.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${p.color}`} style={{ width: `${(p.progress / p.total) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{p.progress}/{p.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh + Security note */}
          <div className="border-t border-slate-100 px-6 py-4">
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors py-1"
            >
              <RefreshCw size={15} />
              <span className="text-sm font-semibold">
                {language === 'en' ? 'Refresh Code' : 'تحديث الرمز'}
              </span>
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 mt-5 bg-white/10 px-4 py-2 rounded-full">
          <Shield size={14} className="text-emerald-300" />
          <span className="text-white/80 text-xs">
            {language === 'en'
              ? 'Auto-refreshes every 2 minutes for security'
              : 'يتجدد تلقائياً كل دقيقتين للأمان'}
          </span>
        </div>
      </div>
    </div>
  );
}
