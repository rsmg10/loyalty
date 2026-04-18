import { createI18n } from 'vue-i18n';

const STORAGE_KEY = 'loyalty_locale';

const messages = {
  en: {
    app: {
      title: 'Loyalty Pocket',
      subtitle: 'Track your stamps, see when your reward is ready, and keep a clean record of every stop.',
      customerWallet: 'Customer Wallet',
      signOut: 'Sign out',
      shareTitle: 'Share this',
      shareHint: 'Ask staff for the business ID or scan the shop QR to open it instantly.'
    },
    magic: {
      title: 'Magic link',
      loading: 'Linking...',
      ready: 'Business linked.',
      continue: 'Continue',
      invalid: 'Magic link is invalid or expired.',
      detail: 'We will prefill the business ID for you.'
    },
    auth: {
      login: 'Sign in',
      welcomeTitle: 'Your loyalty wallet',
      welcomeSubtitle: 'See your stamps, track rewards, and check in after every visit.',
      enterCode: 'Enter your code',
      phone: 'Phone number',
      phonePlaceholder: '+1 555 000 0000',
      code: 'Verification code',
      codePlaceholder: '000000',
      codeSentTo: 'We sent a 6-digit code to',
      requestOtp: 'Send code',
      verify: 'Verify & continue',
      sending: 'Sending...',
      verifying: 'Verifying...',
      otpSent: 'Code sent. Check your messages.',
      signedIn: 'Signed in.',
      back: '← Use a different number'
    },
    wallet: {
      statusTitle: 'Your loyalty card',
      visitHistory: 'Visit history',
      stampHistory: 'Stamp history',
      optional: 'Optional',
      loadStatus: 'Check my status',
      loadHistory: 'Load visit history',
      loadStampHistory: 'Load stamp history',
      joinTitle: 'Join the program',
      joinProgram: 'Join program',
      signingUp: 'Joining...',
      loading: 'Loading...',
      program: 'Program',
      reward: 'Your reward',
      stamps: 'Stamps',
      progress: 'Progress',
      note: 'Note',
      stampExpiration: 'Stamps expire after',
      days: 'days',
      lastStamp: 'Last visit',
      rewardAvailableSince: 'Reward available since',
      rewardReady: 'Your reward is ready!',
      rewardReadyHint: 'Show this to staff to claim your reward.',
      switchBusiness: 'Check a different business',
      noVisitHistoryYet: 'No visits recorded yet.',
      noStampHistoryYet: 'No stamp history yet.'
    },
    forms: {
      businessId: 'Business ID',
      businessIdPlaceholder: 'e.g. 1',
      customerPhone: 'Customer phone',
      displayName: 'Your name (optional)',
      mobileNumber: 'Mobile number (optional)'
    },
    messages: {
      enterBusiness: 'Enter a business ID.',
      statusLoaded: 'Status loaded.',
      historyLoaded: 'History loaded.',
      stampHistoryLoaded: 'Stamp history loaded.'
    },
    errors: {
      customerNotFound: 'Customer not found',
      customerNotFoundPrompt: 'No membership yet. Tap join to create your account.',
      signupSuccess: 'Membership created. Status loaded.'
    }
  },
  ar: {
    app: {
      title: 'محفظة الولاء',
      subtitle: 'تابع أختامك، اعرف متى تصبح المكافأة جاهزة، واحتفظ بسجل واضح لكل زيارة.',
      customerWallet: 'محفظة العميل',
      signOut: 'تسجيل الخروج',
      shareTitle: 'شارك هذا',
      shareHint: 'اطلب من الموظف رقم النشاط أو امسح رمز QR لفتحه مباشرة.'
    },
    magic: {
      title: 'رابط سريع',
      loading: 'جارٍ الربط...',
      ready: 'تم ربط النشاط.',
      continue: 'متابعة',
      invalid: 'الرابط غير صالح أو منتهي.',
      detail: 'سنقوم بتعبئة رقم النشاط لك.'
    },
    auth: {
      login: 'تسجيل الدخول',
      welcomeTitle: 'محفظة ولائك',
      welcomeSubtitle: 'اعرض أختامك، تابع مكافأتك، وسجّل بعد كل زيارة.',
      enterCode: 'أدخل الرمز',
      phone: 'رقم الهاتف',
      phonePlaceholder: '+966 5X XXX XXXX',
      code: 'رمز التحقق',
      codePlaceholder: '000000',
      codeSentTo: 'أرسلنا رمزاً مكوناً من 6 أرقام إلى',
      requestOtp: 'إرسال الرمز',
      verify: 'تحقق واستمر',
      sending: 'جارٍ الإرسال...',
      verifying: 'جارٍ التحقق...',
      otpSent: 'تم إرسال الرمز. تحقق من رسائلك.',
      signedIn: 'تم تسجيل الدخول.',
      back: '← استخدم رقماً آخر'
    },
    wallet: {
      statusTitle: 'بطاقة ولائك',
      visitHistory: 'سجل الزيارات',
      stampHistory: 'سجل الأختام',
      optional: 'اختياري',
      loadStatus: 'تحقق من حالتي',
      loadHistory: 'تحميل سجل الزيارات',
      loadStampHistory: 'تحميل سجل الأختام',
      joinTitle: 'انضم للبرنامج',
      joinProgram: 'انضم الآن',
      signingUp: 'جارٍ الانضمام...',
      loading: 'جارٍ التحميل...',
      program: 'البرنامج',
      reward: 'مكافأتك',
      stamps: 'الأختام',
      progress: 'التقدم',
      note: 'ملاحظة',
      stampExpiration: 'تنتهي الأختام بعد',
      days: 'يوم',
      lastStamp: 'آخر زيارة',
      rewardAvailableSince: 'المكافأة متاحة منذ',
      rewardReady: 'مكافأتك جاهزة!',
      rewardReadyHint: 'أرِ هذا للموظف لاستلام مكافأتك.',
      switchBusiness: 'تحقق من نشاط آخر',
      noVisitHistoryYet: 'لا توجد زيارات مسجلة بعد.',
      noStampHistoryYet: 'لا يوجد سجل أختام بعد.'
    },
    forms: {
      businessId: 'رقم النشاط',
      businessIdPlaceholder: 'مثال: 1',
      customerPhone: 'هاتف العميل',
      displayName: 'اسمك (اختياري)',
      mobileNumber: 'رقم الهاتف (اختياري)'
    },
    messages: {
      enterBusiness: 'يرجى إدخال رقم النشاط.',
      statusLoaded: 'تم تحميل الحالة.',
      historyLoaded: 'تم تحميل السجل.',
      stampHistoryLoaded: 'تم تحميل سجل الأختام.'
    },
    errors: {
      customerNotFound: 'العميل غير موجود',
      customerNotFoundPrompt: 'لا يوجد اشتراك بعد. اضغط للانضمام الآن.',
      signupSuccess: 'تم إنشاء الاشتراك. تم تحميل الحالة.'
    }
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem(STORAGE_KEY) || 'en',
  fallbackLocale: 'en',
  messages
});

export function setDocumentDirection(locale: string) {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

export function persistLocale(locale: string) {
  localStorage.setItem(STORAGE_KEY, locale);
  setDocumentDirection(locale);
}
