import { useI18n } from 'vue-i18n';
import { persistLocale } from '../i18n';

export function useLocale() {
  const { locale } = useI18n();

  function setLocale(value: string) {
    locale.value = value;
    persistLocale(value);
  }

  return { locale, setLocale };
}
