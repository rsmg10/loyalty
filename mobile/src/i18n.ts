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
      login: 'Login',
      otpAccess: 'OTP access',
      phone: 'Your phone',
      code: '6-digit code',
      requestOtp: 'Request OTP',
      verify: 'Verify & Continue',
      sending: 'Sending...',
      verifying: 'Verifying...',
      otpSent: 'OTP sent.',
      signedIn: 'Signed in.'
    },
    wallet: {
      statusTitle: 'Your status',
      visitHistory: 'Visit history',
      stampAudit: 'Stamp audit',
      optional: 'Optional',
      loadStatus: 'Load status',
      loadHistory: 'Load history',
      loadStampHistory: 'Load stamp history',
      joinProgram: 'Join program',
      signingUp: 'Joining...',
      loading: 'Loading...',
      program: 'Program',
      reward: 'Reward',
      progress: 'Progress',
      note: 'Note',
      stampExpiration: 'Stamp expiration',
      lastStamp: 'Last stamp',
      rewardAvailableSince: 'Reward available since'
    },
    forms: {
      businessId: 'Business ID',
      customerPhone: 'Customer phone',
      displayName: 'Display name',
      mobileNumber: 'Mobile number'
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
      otpAccess: 'الوصول بالرمز',
      phone: 'هاتفك',
      code: 'رمز من 6 أرقام',
      requestOtp: 'إرسال الرمز',
      verify: 'تحقق واستمر',
      sending: 'جارٍ الإرسال...',
      verifying: 'جارٍ التحقق...',
      otpSent: 'تم إرسال الرمز.',
      signedIn: 'تم تسجيل الدخول.'
    },
    wallet: {
      statusTitle: 'حالتك',
      visitHistory: 'سجل الزيارات',
      stampAudit: 'تدقيق الأختام',
      optional: 'اختياري',
      loadStatus: 'تحميل الحالة',
      loadHistory: 'تحميل السجل',
      loadStampHistory: 'تحميل سجل الأختام',
      joinProgram: 'الانضمام للبرنامج',
      signingUp: 'جارٍ الانضمام...',
      loading: 'جارٍ التحميل...',
      program: 'البرنامج',
      reward: 'المكافأة',
      progress: 'التقدم',
      note: 'ملاحظة',
      stampExpiration: 'انتهاء الأختام',
      lastStamp: 'آخر ختم',
      rewardAvailableSince: 'المكافأة متاحة منذ'
    },
    forms: {
      businessId: 'رقم النشاط',
      customerPhone: 'هاتف العميل',
      displayName: 'الاسم المعروض',
      mobileNumber: 'رقم الهاتف'
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
