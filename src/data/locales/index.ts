import { koData } from './ko';
import { enData } from './en';

export const i18nConfig = {
  ko: { label: '한국어', data: koData },
  en: { label: 'English', data: enData },
};

export type LanguageCode = keyof typeof i18nConfig;

// Setup a fallback utility fetching localized data
export function getDailyDataByLang(lang: LanguageCode) {
  return i18nConfig[lang]?.data || i18nConfig['en'].data;
}
