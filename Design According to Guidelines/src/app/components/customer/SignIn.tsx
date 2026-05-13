import React, { useState } from 'react';
import { Phone, Mail, ArrowRight, Sparkles, Star, Gift } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useLanguage } from '../../context/LanguageContext';

export function SignIn({ onSignIn }: { onSignIn: () => void }) {
  const [view, setView] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const { t, language, setLanguage, isRTL } = useLanguage();

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 flex flex-col">
        {/* Language Toggle */}
        <div className="p-6 flex justify-end">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-all"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        {/* Animated Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <Gift className="text-white/30" size={48} />
          </div>
          <div className="absolute top-40 right-16 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <Star className="text-yellow-300/40" size={40} />
          </div>
          <div className="absolute bottom-32 left-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
            <Sparkles className="text-white/30" size={36} />
          </div>
          <div className="absolute bottom-48 right-12 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4s' }}>
            <Star className="text-white/30" size={44} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {/* Icon Animation */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
                <Gift className="text-white" size={48} />
              </div>
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center animate-bounce">
                <Star className="text-white fill-white" size={24} />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white text-center mb-3">
            {t('auth.welcome')}
          </h1>
          <div className="text-5xl font-bold text-white text-center mb-4">
            {t('auth.loyaltyPlatform')}
          </div>
          <p className="text-xl text-white/90 text-center mb-12 max-w-sm">
            {t('auth.subtitle')}
          </p>

          {/* Features */}
          <div className="w-full max-w-sm space-y-3 mb-12">
            {[
              { icon: Gift, text: language === 'en' ? 'Earn rewards with every visit' : 'اكسب المكافآت مع كل زيارة' },
              { icon: Star, text: language === 'en' ? 'Unlock exclusive offers' : 'افتح العروض الحصرية' },
              { icon: Sparkles, text: language === 'en' ? 'Track your progress' : 'تتبع تقدمك' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-white" size={20} />
                </div>
                <span className="text-white font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="!bg-white !text-purple-600 hover:!bg-gray-100 !shadow-2xl max-w-sm"
            onClick={() => setView('signin')}
          >
            {t('auth.getStarted')}
            <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700">
        {/* Language Toggle */}
        <div className="p-6 flex justify-between items-center">
          <button
            onClick={() => setView('welcome')}
            className="text-white flex items-center gap-2"
          >
            <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
            {t('common.back')}
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="px-6 pt-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
                <Gift className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.signIn')}</h2>
              <p className="text-gray-600">{t('auth.subtitle')}</p>
            </div>

            <div className="space-y-4 mb-6">
              <Input
                label={t('auth.phone')}
                type="tel"
                placeholder="+218 91 234 5678"
                icon={<Phone size={20} />}
              />
              <Input
                label={t('auth.password')}
                type="password"
                placeholder="••••••••"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="!bg-gradient-to-r from-indigo-600 to-violet-600 mb-4"
              onClick={onSignIn}
            >
              {t('auth.continue')}
            </Button>

            <div className="text-center">
              <button
                onClick={() => setView('signup')}
                className="text-indigo-600 font-medium"
              >
                {t('auth.dontHaveAccount')} {t('auth.signUp')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700">
      {/* Language Toggle */}
      <div className="p-6 flex justify-between items-center">
        <button
          onClick={() => setView('welcome')}
          className="text-white flex items-center gap-2"
        >
          <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
          {t('common.back')}
        </button>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium"
        >
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      <div className="px-6 pt-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.signUp')}</h2>
            <p className="text-gray-600">{t('auth.subtitle')}</p>
          </div>

          <div className="space-y-4 mb-6">
            <Input
              label={t('auth.phone')}
              type="tel"
              placeholder="+218 91 234 5678"
              icon={<Phone size={20} />}
            />
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="name@example.com"
              icon={<Mail size={20} />}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••••"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="!bg-gradient-to-r from-indigo-600 to-violet-600 mb-4"
            onClick={onSignIn}
          >
            {t('auth.continue')}
          </Button>

          <div className="text-center">
            <button
              onClick={() => setView('signin')}
              className="text-indigo-600 font-medium"
            >
              {t('auth.alreadyHaveAccount')} {t('auth.signIn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}