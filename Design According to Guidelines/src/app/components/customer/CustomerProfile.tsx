import React from 'react';
import { User, Mail, Phone, MapPin, Settings, Bell, CreditCard, LogOut, Languages, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BottomNav } from './BottomNav';
import { useLanguage } from '../../context/LanguageContext';

export function CustomerProfile({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, language, setLanguage } = useLanguage();

  const joinedPrograms = [
    {
      name: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس',
      logo: '🍗',
      status: t('profile.active'),
      progress: 70,
      color: 'from-amber-500 to-orange-500'
    },
    {
      name: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي',
      logo: '☕',
      status: t('profile.active'),
      progress: 50,
      color: 'from-indigo-500 to-violet-500'
    },
    {
      name: language === 'en' ? 'Casper & Gambini\'s' : 'كاسبر آند غامبينيز',
      logo: '🍰',
      status: t('profile.active'),
      progress: 40,
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header — fixed height, no large padding-bottom overlap trick */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 text-white px-6 pt-12 pb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-2xl flex-shrink-0">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{language === 'en' ? 'Ahmed Al-Mansouri' : 'أحمد المنصوري'}</h1>
            <p className="text-indigo-200 text-sm mt-0.5">ahmed@email.com</p>
            <p className="text-indigo-300 text-xs mt-0.5">+218 91 234 5678</p>
          </div>
        </div>
      </div>

      {/* Thin accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      {/* Stats — sits cleanly below the header, no negative margin overlap */}
      <div className="px-5 pt-4 mb-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardBody className="py-4">
            <div className="grid grid-cols-3 divide-x divide-slate-200">
              <div className="text-center px-2">
                <p className="text-2xl font-bold text-indigo-600">5</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('profile.programs')}</p>
              </div>
              <div className="text-center px-2">
                <p className="text-2xl font-bold text-amber-500">12</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('profile.totalRewards')}</p>
              </div>
              <div className="text-center px-2">
                <p className="text-2xl font-bold text-teal-500">47</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('profile.visits')}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="px-5">
        {/* Account Settings */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('profile.account')}</h2>
        <Card className="mb-4 border border-slate-200 shadow-sm">
          <CardBody className="p-0 divide-y divide-slate-100">
            {[
              { icon: User, label: t('profile.personalInfo'), value: '' },
              { icon: Mail, label: t('profile.email'), value: 'ahmed@email.com' },
              { icon: Phone, label: t('profile.phone'), value: '+218 91 234 5678' },
              { icon: MapPin, label: t('profile.location'), value: t('location.tripoli') + ', ' + t('location.libya') }
            ].map((item, idx) => (
              <button key={idx} className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-indigo-600" size={18} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  {item.value && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.value}</p>}
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Preferences */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('profile.preferences')}</h2>
        <Card className="mb-4 border border-slate-200 shadow-sm">
          <CardBody className="p-0 divide-y divide-slate-100">
            {[
              { icon: Bell, label: t('profile.notifications'), badge: t('common.on') },
              { icon: Languages, label: language === 'en' ? 'Language' : 'اللغة', badge: language === 'en' ? 'English' : 'العربية', onClick: () => setLanguage(language === 'en' ? 'ar' : 'en') },
              { icon: Settings, label: t('profile.appSettings'), badge: '' },
              { icon: CreditCard, label: t('profile.paymentMethods'), badge: language === 'en' ? '2 cards' : '2 ' + t('common.cards') }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-indigo-600" size={18} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                </div>
                {item.badge && <Badge variant="purple" size="sm">{item.badge}</Badge>}
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Joined Programs */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('profile.joinedPrograms')}</h2>
        <div className="space-y-2.5 mb-5">
          {joinedPrograms.map((program, idx) => (
            <Card key={idx} hoverable className="border border-slate-200 hover:border-indigo-200 shadow-sm transition-all">
              <CardBody className="py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                    {program.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{program.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[90px]">
                        <div className={`h-full bg-gradient-to-r ${program.color}`} style={{ width: `${program.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{program.progress}%</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">{program.status}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full px-5 py-3.5 flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors border border-rose-200 mb-4">
          <LogOut size={18} />
          <span className="text-sm font-semibold">{t('profile.logout')}</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeView="profile" onNavigate={onNavigate} />
    </div>
  );
}
