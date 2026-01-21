import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTranslations from '../locales/zh.json';
import enTranslations from '../locales/en.json';
import koTranslations from '../locales/ko.json';

const resources = {
  zh: {
    translation: zhTranslations,
  },
  en: {
    translation: enTranslations,
  },
  ko: {
    translation: koTranslations,
  },
};

// 获取浏览器语言
const getBrowserLanguage = () => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ko')) return 'ko';
  return 'en';
};

// 从 localStorage 获取保存的语言，或使用浏览器语言
const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('language');
    if (saved && ['zh', 'en', 'ko'].includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to access localStorage:', e);
  }
  return getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// 监听语言变化，保存到 localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('language', lng);
  } catch (e) {
    console.warn('Failed to save language to localStorage:', e);
  }
});

export default i18n;
