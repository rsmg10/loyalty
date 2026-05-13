import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Auth
    'auth.welcome': 'Welcome to',
    'auth.loyaltyPlatform': 'Loyalty Rewards',
    'auth.subtitle': 'Earn rewards at your favorite places',
    'auth.getStarted': 'Get Started',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.phone': 'Phone Number',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.continue': 'Continue',
    'auth.orContinueWith': 'Or continue with',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",

    // Home
    'home.welcome': 'Welcome back',
    'home.activeRewards': 'active rewards',
    'home.search': 'Search businesses...',
    'home.yourCards': 'Your Loyalty Cards',
    'home.moreFor': 'more for',
    'home.specialOffers': 'Special Offers',
    'home.viewAll': 'View all',
    'home.nearby': 'Nearby Businesses',

    // Categories
    'category.coffee': 'Coffee',
    'category.food': 'Food',
    'category.dessert': 'Dessert',
    'category.restaurant': 'Restaurant',
    'category.bakery': 'Bakery',
    'category.fastFood': 'Fast Food',
    'category.smoothies': 'Smoothies',
    'category.all': 'All',

    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.rewards': 'Rewards',
    'nav.profile': 'Profile',

    // Explore
    'explore.title': 'Explore Businesses',
    'explore.noResults': 'No businesses found',
    'explore.tryAdjust': 'Try adjusting your search or filters',

    // Rewards
    'rewards.title': 'My Rewards',
    'rewards.subtitle': 'Track and redeem your rewards',
    'rewards.available': 'Available',
    'rewards.history': 'History',
    'rewards.specialOffers': 'Special Offers',
    'rewards.loyaltyRewards': 'Loyalty Rewards',
    'rewards.ready': 'Ready',
    'rewards.redeemed': 'Redeemed',
    'rewards.visitsToUnlock': 'more visits to unlock',
    'rewards.noExpiry': 'No expiry',
    'rewards.daysLeft': 'days left',

    // Profile
    'profile.personalInfo': 'Personal Information',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.location': 'Location',
    'profile.account': 'Account',
    'profile.preferences': 'Preferences',
    'profile.notifications': 'Notifications',
    'profile.appSettings': 'App Settings',
    'profile.paymentMethods': 'Payment Methods',
    'profile.joinedPrograms': 'Joined Programs',
    'profile.logout': 'Log Out',
    'profile.programs': 'Programs',
    'profile.visits': 'Visits',
    'profile.totalRewards': 'Rewards',
    'profile.active': 'Active',

    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.on': 'On',
    'common.off': 'Off',
    'common.cards': 'cards',

    // Locations
    'location.tripoli': 'Tripoli',
    'location.benghazi': 'Benghazi',
    'location.libya': 'Libya',
  },
  ar: {
    // Auth
    'auth.welcome': 'مرحباً بك في',
    'auth.loyaltyPlatform': 'مكافآت الولاء',
    'auth.subtitle': 'اكسب المكافآت في أماكنك المفضلة',
    'auth.getStarted': 'ابدأ الآن',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.phone': 'رقم الهاتف',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.continue': 'متابعة',
    'auth.orContinueWith': 'أو تابع مع',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',

    // Home
    'home.welcome': 'أهلاً بعودتك',
    'home.activeRewards': 'مكافأة نشطة',
    'home.search': 'ابحث عن الأنشطة التجارية...',
    'home.yourCards': 'بطاقات الولاء الخاصة بك',
    'home.moreFor': 'المزيد للحصول على',
    'home.specialOffers': 'عروض خاصة',
    'home.viewAll': 'عرض الكل',
    'home.nearby': 'الأنشطة التجارية القريبة',

    // Categories
    'category.coffee': 'قهوة',
    'category.food': 'طعام',
    'category.dessert': 'حلويات',
    'category.restaurant': 'مطعم',
    'category.bakery': 'مخبز',
    'category.fastFood': 'وجبات سريعة',
    'category.smoothies': 'عصائر',
    'category.all': 'الكل',

    // Navigation
    'nav.home': 'الرئيسية',
    'nav.explore': 'استكشف',
    'nav.rewards': 'المكافآت',
    'nav.profile': 'الملف الشخصي',

    // Explore
    'explore.title': 'استكشف الأنشطة التجارية',
    'explore.noResults': 'لم يتم العثور على أنشطة تجارية',
    'explore.tryAdjust': 'حاول تعديل البحث أو الفلاتر',

    // Rewards
    'rewards.title': 'مكافآتي',
    'rewards.subtitle': 'تتبع واسترد مكافآتك',
    'rewards.available': 'المتاحة',
    'rewards.history': 'السجل',
    'rewards.specialOffers': 'عروض خاصة',
    'rewards.loyaltyRewards': 'مكافآت الولاء',
    'rewards.ready': 'جاهز',
    'rewards.redeemed': 'تم الاسترداد',
    'rewards.visitsToUnlock': 'المزيد من الزيارات لفتحها',
    'rewards.noExpiry': 'لا تنتهي',
    'rewards.daysLeft': 'أيام متبقية',

    // Profile
    'profile.personalInfo': 'المعلومات الشخصية',
    'profile.email': 'البريد الإلكتروني',
    'profile.phone': 'الهاتف',
    'profile.location': 'الموقع',
    'profile.account': 'الحساب',
    'profile.preferences': 'التفضيلات',
    'profile.notifications': 'الإشعارات',
    'profile.appSettings': 'إعدادات التطبيق',
    'profile.paymentMethods': 'طرق الدفع',
    'profile.joinedPrograms': 'البرامج المنضم إليها',
    'profile.logout': 'تسجيل الخروج',
    'profile.programs': 'برامج',
    'profile.visits': 'زيارات',
    'profile.totalRewards': 'مكافآت',
    'profile.active': 'نشط',

    // Common
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.done': 'تم',
    'common.on': 'مفعل',
    'common.off': 'معطل',
    'common.cards': 'بطاقات',

    // Locations
    'location.tripoli': 'طرابلس',
    'location.benghazi': 'بنغازي',
    'location.libya': 'ليبيا',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
