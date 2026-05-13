import React, { useState } from 'react';
import { Gift, Star, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BottomNav } from './BottomNav';
import { useLanguage } from '../../context/LanguageContext';

export function CustomerRewards({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');

  const availableRewards = [
    {
      id: 1,
      business: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس',
      logo: '🍗',
      reward: language === 'en' ? 'Free Meal' : 'وجبة مجانية',
      description: language === 'en' ? 'Any chicken meal' : 'أي وجبة دجاج',
      progress: 7,
      total: 10,
      expiry: t('rewards.noExpiry'),
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 2,
      business: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي',
      logo: '☕',
      reward: language === 'en' ? 'Free Coffee' : 'قهوة مجانية',
      description: language === 'en' ? 'Any size coffee' : 'أي حجم قهوة',
      progress: 8,
      total: 8,
      expiry: t('rewards.noExpiry'),
      color: 'from-indigo-500 to-violet-500',
      unlocked: true
    },
    {
      id: 3,
      business: language === 'en' ? 'Casper & Gambini\'s' : 'كاسبر آند غامبينيز',
      logo: '🍰',
      reward: language === 'en' ? 'Free Dessert' : 'حلوى مجانية',
      description: language === 'en' ? 'Any dessert item' : 'أي نوع حلوى',
      progress: 2,
      total: 5,
      expiry: t('rewards.noExpiry'),
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const specialOffers = [
    {
      id: 1,
      business: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس',
      logo: '🍗',
      offer: language === 'en' ? '20% off your next purchase' : 'خصم 20% على عملية الشراء القادمة',
      description: language === 'en' ? 'Valid on all items' : 'صالح على جميع المنتجات',
      expiry: '2 ' + t('rewards.daysLeft'),
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 2,
      business: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي',
      logo: '☕',
      offer: language === 'en' ? 'Buy 1 Get 1 Free' : 'اشتري واحد واحصل على الثاني مجاناً',
      description: language === 'en' ? 'On any coffee drink' : 'على أي مشروب قهوة',
      expiry: '5 ' + t('rewards.daysLeft'),
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  const redeemedRewards = [
    {
      id: 1,
      business: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي',
      logo: '☕',
      reward: language === 'en' ? 'Free Coffee' : 'قهوة مجانية',
      date: language === 'en' ? 'Today, 9:30 AM' : 'اليوم، 9:30 صباحاً',
      location: language === 'en' ? 'Downtown Tripoli' : 'وسط طرابلس'
    },
    {
      id: 2,
      business: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس',
      logo: '🍗',
      reward: language === 'en' ? '20% Off' : 'خصم 20%',
      date: language === 'en' ? 'Yesterday, 1:15 PM' : 'أمس، 1:15 مساءً',
      location: language === 'en' ? 'Benghazi Mall' : 'مول بنغازي'
    },
    {
      id: 3,
      business: language === 'en' ? 'Casper & Gambini\'s' : 'كاسبر آند غامبينيز',
      logo: '🍰',
      reward: language === 'en' ? 'Free Dessert' : 'حلوى مجانية',
      date: language === 'en' ? '3 days ago' : 'منذ 3 أيام',
      location: language === 'en' ? 'Tripoli Center' : 'مركز طرابلس'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 text-white px-6 pt-12 pb-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <Gift className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('rewards.title')}</h1>
            <p className="text-indigo-200 text-sm">{t('rewards.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Thin accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-6">
          {[
            { key: 'available' as const, label: t('rewards.available') },
            { key: 'redeemed' as const, label: t('rewards.history') }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3.5 relative text-sm transition-colors ${
                activeTab === tab.key
                  ? 'text-indigo-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        {activeTab === 'available' ? (
          <>
            {/* Special Offers */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-amber-500" size={20} />
                <h2 className="text-base font-semibold text-gray-800">{t('rewards.specialOffers')}</h2>
              </div>
              <div className="space-y-3">
                {specialOffers.map((offer) => (
                  <Card
                    key={offer.id}
                    hoverable
                    onClick={() => onNavigate('business-profile')}
                    className="bg-amber-50 border border-amber-200 hover:border-amber-400 shadow-sm transition-all"
                  >
                    <CardBody className="py-4">
                      <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center text-3xl flex-shrink-0 shadow-md`}>
                          {offer.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm">{offer.business}</h3>
                              <p className="text-sm text-gray-700 mt-0.5">{offer.offer}</p>
                            </div>
                            <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-500">{offer.description}</p>
                            <Badge variant="warning" size="sm">{offer.expiry}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>

            {/* Program Rewards */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="text-indigo-500" size={20} />
                <h2 className="text-base font-semibold text-gray-800">{t('rewards.loyaltyRewards')}</h2>
              </div>
              <div className="space-y-3">
                {availableRewards.map((reward) => (
                  <Card
                    key={reward.id}
                    hoverable
                    onClick={() => onNavigate('loyalty-card')}
                    className={reward.unlocked
                      ? 'border border-emerald-300 bg-emerald-50 shadow-sm'
                      : 'border border-slate-200 hover:border-indigo-300 shadow-sm transition-all'
                    }
                  >
                    <CardBody className="py-4">
                      <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reward.color} flex items-center justify-center text-3xl flex-shrink-0 shadow-md relative`}>
                          {reward.logo}
                          {reward.unlocked && (
                            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                              <Star className="text-white fill-white" size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm">{reward.reward}</h3>
                              <p className="text-xs text-gray-500">{reward.business}</p>
                            </div>
                            {reward.unlocked && (
                              <Badge variant="success" size="sm">
                                ✓ {t('rewards.ready')}
                              </Badge>
                            )}
                          </div>

                          {!reward.unlocked && (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${reward.color} transition-all duration-500`}
                                    style={{ width: `${(reward.progress / reward.total) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-700 font-semibold whitespace-nowrap">
                                  {reward.progress}/{reward.total}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {reward.total - reward.progress} {t('rewards.visitsToUnlock')}
                              </p>
                            </>
                          )}

                          {reward.unlocked && (
                            <p className="text-sm text-gray-600">{reward.description}</p>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Redeemed History */
          <section>
            <div className="space-y-3">
              {redeemedRewards.map((reward) => (
                <Card key={reward.id} className="border border-slate-200 shadow-sm">
                  <CardBody className="py-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                        {reward.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{reward.reward}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{reward.business}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{reward.date}</span>
                          </div>
                          <span>•</span>
                          <span>{reward.location}</span>
                        </div>
                      </div>
                      <Badge variant="gray" size="sm">{t('rewards.redeemed')}</Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeView="rewards" onNavigate={onNavigate} />
    </div>
  );
}
