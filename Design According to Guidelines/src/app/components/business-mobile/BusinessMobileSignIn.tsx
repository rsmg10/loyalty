import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

interface BusinessMobileSignInProps {
  onSignIn: () => void;
}

export function BusinessMobileSignIn({ onSignIn }: BusinessMobileSignInProps) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = () => {
    if (!phone || pin.length < 4) {
      setError('Please enter your phone number and PIN.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignIn();
    }, 1200);
  };

  const pinDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  const handlePinKey = (key: string) => {
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
    } else if (pin.length < 6) {
      setPin((p) => p + key);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex flex-col">
      {/* Logo / Brand */}
      <div className="pt-16 pb-8 px-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-5 shadow-xl">
          <span className="text-4xl">🏪</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Staff Login</h1>
        <p className="text-emerald-200 text-sm mt-1">Costa Coffee — Tripoli Mall</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-gray-900 font-bold text-xl mb-1">Welcome back!</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your phone number and PIN to continue</p>

        {/* Phone Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <div className="flex items-center gap-2 border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
            <span className="text-gray-500 text-sm font-medium select-none">+218</span>
            <div className="w-px h-5 bg-slate-200" />
            <input
              type="tel"
              className="flex-1 text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              placeholder="91 234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={12}
            />
          </div>
        </div>

        {/* PIN Input */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN</label>
          <div className="flex items-center gap-2 border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              className="flex-1 text-gray-900 placeholder-gray-400 outline-none bg-transparent tracking-widest"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
            <button onClick={() => setShowPin((s) => !s)} className="text-gray-400 hover:text-gray-600">
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-lg hover:from-emerald-400 hover:to-teal-500 active:scale-98 transition-all disabled:opacity-60"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ChevronRight size={18} />
            </>
          )}
        </button>

        {/* Quick demo tap */}
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <p className="text-emerald-800 text-xs font-medium text-center">Demo: tap Sign In with any values</p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">Forgot your PIN? Contact your</p>
          <button className="text-emerald-600 font-semibold text-sm">Branch Manager</button>
        </div>
      </div>
    </div>
  );
}
