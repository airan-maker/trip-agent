'use client';

import { useTranslations } from 'next-intl';
import {
  getBookingSearchUrl,
  getGetYourGuideUrl,
  getKlookSearchUrl,
  getAiraloUrl,
} from '@/lib/affiliate';
import { ExternalLink, Hotel, Compass, Smartphone, Ticket } from 'lucide-react';

interface AffiliateLinksProps {
  destination: string;
}

export default function AffiliateLinks({ destination }: AffiliateLinksProps) {
  const t = useTranslations('affiliate');
  const bookingUrl = getBookingSearchUrl(destination);
  const gygUrl = getGetYourGuideUrl(destination);
  const klookUrl = getKlookSearchUrl(destination);
  const airaloUrl = getAiraloUrl();

  if (!bookingUrl && !gygUrl && !klookUrl && !airaloUrl) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {t('prepareTravel', { destination })}
        </p>
        <div className="flex flex-wrap gap-3">
          {bookingUrl && (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium">
              <Hotel className="w-4 h-4" />{t('searchAccommodation')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {klookUrl && (
            <a href={klookUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-sm font-medium">
              <Ticket className="w-4 h-4" />{t('searchTours')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {gygUrl && (
            <a href={gygUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium">
              <Compass className="w-4 h-4" />{t('searchGYG')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {airaloUrl && (
            <a href={airaloUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors text-sm font-medium">
              <Smartphone className="w-4 h-4" />{t('buyESIM')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <p className="text-[0.65rem] text-gray-400 mt-3">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
