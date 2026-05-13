import React, { useState } from 'react';
import { Search, MapPin, Star, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BottomNav } from './BottomNav';
import { useLanguage } from '../../context/LanguageContext';

export function CustomerExplore({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t('category.all'));
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    t('category.all'),
    t('category.coffee'),
    t('category.restaurant'),
    t('category.dessert'),
    t('category.bakery'),
    t('category.fastFood'),
    t('category.smoothies')
  ];

  const businesses = [
    {
      id: 1,
      name: language === 'en' ? 'Nando\'s Tripoli' : 'ناندوز طرابلس',
      category: t('category.restaurant'),
      distance: language === 'en' ? '0.5 km' : '0.5 كم',
      rating: 4.8,
      reviews: 234,
      logo: '🍗',
      hasLoyalty: true,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 2,
      name: language === 'en' ? 'Costa Coffee' : 'كوستا كوفي',
      category: t('category.coffee'),
      distance: language === 'en' ? '0.3 km' : '0.3 كم',
      rating: 4.6,
      reviews: 182,
      logo: '☕',
      hasLoyalty: true,
      color: 'from-indigo-500 to-violet-500'
    },
    {
      id: 3,
      name: language === 'en' ? 'Casper & Gambini\'s' : 'كاسبر آند غامبينيز',
      category: t('category.dessert'),
      distance: language === 'en' ? '0.8 km' : '0.8 كم',
      rating: 4.7,
      reviews: 456,
      logo: '🍰',
      hasLoyalty: true,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 4,
      name: language === 'en' ? 'Starbucks' : 'ستاربكس',
      category: t('category.coffee'),
      distance: language === 'en' ? '0.2 km' : '0.2 كم',
      rating: 4.5,
      reviews: 891,
      logo: '☕',
      hasLoyalty: true,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 5,
      name: language === 'en' ? 'KFC Benghazi' : 'كنتاكي بنغازي',
      category: t('category.fastFood'),
      distance: language === 'en' ? '1.1 km' : '1.1 كم',
      rating: 4.4,
      reviews: 312,
      logo: '🍗',
      hasLoyalty: true,
      color: 'from-rose-500 to-red-500'
    },
    {
      id: 6,
      name: language === 'en' ? 'Gelato House' : 'بيت الجيلاتو',
      category: t('category.dessert'),
      distance: language === 'en' ? '1.3 km' : '1.3 كم',
      rating: 4.9,
      reviews: 567,
      logo: '🍦',
      hasLoyalty: true,
      color: 'from-fuchsia-500 to-purple-500'
    }
  ];

  const filteredBusinesses = businesses.filter(b => {
    const matchesCategory = selectedCategory === t('category.all') || b.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 text-white px-6 pt-12 pb-5 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold flex-1">{t('explore.title')}</h1>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('home.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Thin accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      {/* Categories — NOT sticky, just sits below header naturally */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5 py-3 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-sm ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Business List */}
      <div className="px-5 py-5 space-y-3">
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Search className="text-indigo-300" size={36} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t('explore.noResults')}</h3>
            <p className="text-gray-500 text-sm">{t('explore.tryAdjust')}</p>
          </div>
        ) : (
          filteredBusinesses.map((business) => (
            <Card
              key={business.id}
              hoverable
              onClick={() => onNavigate('business-profile')}
              className="border border-slate-200 hover:border-indigo-300 shadow-sm transition-all"
            >
              <CardBody className="py-4">
                <div className="flex gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${business.color} flex items-center justify-center text-3xl flex-shrink-0 shadow-md`}>
                    {business.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{business.category}</p>
                      </div>
                      {business.hasLoyalty && (
                        <Badge variant="info" size="sm">
                          {language === 'en' ? 'Loyalty' : 'ولاء'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="text-amber-400 fill-amber-400" size={16} />
                        <span className="font-semibold text-gray-900">{business.rating}</span>
                        <span className="text-gray-400">({business.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} className="text-indigo-400" />
                        <span>{business.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeView="explore" onNavigate={onNavigate} />
    </div>
  );
}
