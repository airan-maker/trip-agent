'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';

const localeLabels: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

const localeFlags: Record<string, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    // Replace the current locale segment in the pathname
    const segments = pathname.split('/');
    if (routing.locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="text-sm bg-transparent border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 hover:border-violet-300 focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {localeFlags[l]} {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
