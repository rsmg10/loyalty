import React from 'react';
import { Search, MapPin, Gift, Coffee, UtensilsCrossed, IceCream, ChevronRight, QrCode } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BottomNav } from './BottomNav';
import { useLanguage } from '../../context/LanguageContext';

export function CustomerHome({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, language } = useLanguage();

  const loyaltyCards = [
    { id: 1, business: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس', logo: '🍗', progress: 7, total: 10, reward: language === 'en' ? 'Free Meal' : 'وجبة مجانية', color: 'bg-gradient-to-br from-amber-500 to-orange-500', bar: 'from-amber-400 to-orange-500' },
    { id: 2, business: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي', logo: '☕', progress: 4, total: 8, reward: language === 'en' ? 'Free Coffee' : 'قهوة مجانية', color: 'bg-gradient-to-br from-indigo-500 to-violet-500', bar: 'from-indigo-400 to-violet-500' },
    { id: 3, business: language === 'en' ? 'Casper & Gambini\'s' : 'كاسبر آند غامبينيز', logo: '🍰', progress: 2, total: 5, reward: language === 'en' ? 'Free Dessert' : 'حلوى مجانية', color: 'bg-gradient-to-br from-teal-500 to-cyan-500', bar: 'from-teal-400 to-cyan-500' }
  ];

  const offers = [
    { id: 1, business: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس', offer: language === 'en' ? '20% off your next purchase' : 'خصم 20% على عملية الشراء القادمة', expires: language === 'en' ? '2 days left' : 'باقي يومين' },
    { id: 2, business: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي', offer: language === 'en' ? 'Buy 1 Get 1 Free' : 'اشتري واحد واحصل على الثاني مجاناً', expires: language === 'en' ? '5 days left' : 'باقي 5 أيام' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header — no rounded bottom, flows naturally into content */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 text-white px-6 pt-12 pb-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-sm mb-0.5">{t('home.welcome')}</p>
            <h1 className="text-2xl font-bold">{language === 'en' ? 'Ahmed 👋' : '👋 أحمد'}</h1>
            <span className="inline-flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full text-sm mt-2">
              <Gift size={14} />
              3 {t('home.activeRewards')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl ring-2 ring-white/30">
            👤
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('home.search')}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onClick={() => onNavigate('explore')}
          />
        </div>
      </div>

      {/* Thin accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      {/* QR Code quick-action banner */}
      <button
        onClick={() => onNavigate('qrcode')}
        className="mx-5 mt-4 w-[calc(100%-2.5rem)] flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-5 py-4 shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-98"
      >
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <QrCode className="text-white" size={24} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-semibold text-sm">
            {language === 'en' ? 'Show My QR Code' : 'عرض رمز QR الخاص بي'}
          </p>
          <p className="text-indigo-200 text-xs mt-0.5">
            {language === 'en' ? 'Let staff scan to earn stamps or redeem' : 'دع الموظف يمسح لكسب الطوابع أو الاسترداد'}
          </p>
        </div>
        <ChevronRight className="text-white/60" size={18} />
      </button>

      <div className="px-5 pt-5">
        {/* Active Loyalty Cards */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">{t('home.yourCards')}</h2>
            <Gift className="text-indigo-500" size={20} />
          </div>
          <div className="space-y-3">
            {loyaltyCards.map((card) => (
              <Card key={card.id} hoverable onClick={() => onNavigate('loyalty-card')} className="border border-slate-200 hover:border-indigo-300 shadow-sm transition-all">
                <CardBody className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                      {card.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{card.business}</h3>
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${card.bar} transition-all duration-500`}
                            style={{ width: `${(card.progress / card.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{card.progress}/{card.total}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{card.total - card.progress} {t('home.moreFor')} <span className="text-indigo-600 font-medium">{card.reward}</span></p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Active Offers */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              🎁 {t('home.specialOffers')}
            </h2>
            <button className="text-indigo-600 text-sm font-semibold">{t('home.viewAll')}</button>
          </div>
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id} hoverable className="bg-amber-50 border border-amber-200 hover:border-amber-400 shadow-sm transition-all">
                <CardBody className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                      <Gift className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{offer.business}</h3>
                      <p className="text-sm text-gray-700 mt-0.5">{offer.offer}</p>
                    </div>
                    <Badge variant="warning" size="sm" className="font-semibold flex-shrink-0">{offer.expires}</Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Nearby Businesses */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="text-indigo-500" size={18} />
              {t('home.nearby')}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Coffee, name: t('category.coffee'), color: 'from-amber-400 to-orange-500' },
              { icon: UtensilsCrossed, name: t('category.food'), color: 'from-rose-400 to-pink-500' },
              { icon: IceCream, name: t('category.dessert'), color: 'from-teal-400 to-cyan-500' }
            ].map((category, idx) => (
              <Card key={idx} hoverable onClick={() => onNavigate('explore')} className="border border-slate-200 hover:border-indigo-200 shadow-sm transition-all">
                <CardBody className="py-4 text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <category.icon size={24} />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{category.name}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeView="home" onNavigate={onNavigate} />
    </div>
  );
}