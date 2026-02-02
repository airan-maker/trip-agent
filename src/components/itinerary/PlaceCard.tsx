'use client';

import { useTranslations } from 'next-intl';
import { Place } from '@/types/trip';
import {
  MapPin,
  Clock,
  Star,
  Utensils,
  Coffee,
  Camera,
  ShoppingBag,
  Compass,
  Home,
  Hotel,
  Ticket,
  Bus,
  TreePine,
  Landmark,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { usePlaceImage } from '@/hooks/usePlaceImage';
import { getBookingSearchUrl, getGetYourGuideUrl, getKlookSearchUrl } from '@/lib/affiliate';

const categoryConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  '관광지': { icon: <Camera className="w-4 h-4" />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  '맛집': { icon: <Utensils className="w-4 h-4" />, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  '카페': { icon: <Coffee className="w-4 h-4" />, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  '쇼핑': { icon: <ShoppingBag className="w-4 h-4" />, bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
  '체험': { icon: <Compass className="w-4 h-4" />, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  '숙소': { icon: <Home className="w-4 h-4" />, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  '이동': { icon: <Bus className="w-4 h-4" />, bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' },
  '자연': { icon: <TreePine className="w-4 h-4" />, bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  '신사/사찰': { icon: <Landmark className="w-4 h-4" />, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
};

function getGoogleMapsUrl(place: Place): string {
  if (place.latitude != null && place.longitude != null) {
    const query = encodeURIComponent(place.nameLocal || place.name);
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${place.latitude},${place.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.nameLocal || place.name)}`;
}

function getSearchUrl(place: Place): string {
  const query = encodeURIComponent(`${place.nameLocal || place.name} ${place.name !== (place.nameLocal || '') ? place.name : ''} review`.trim());
  return `https://www.google.com/search?q=${query}`;
}

interface PlaceCardProps {
  place: Place;
  showTimeSlot?: boolean;
}

export default function PlaceCard({ place, showTimeSlot = false }: PlaceCardProps) {
  const t = useTranslations('itinerary');
  const config = categoryConfig[place.category] || { icon: <MapPin className="w-4 h-4" />, bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' };

  const timeSlotLabelsMap: Record<string, string> = {
    morning: t('morning'),
    lunch: t('lunch'),
    afternoon: t('afternoon'),
    evening: t('evening'),
  };

  const timeSlotColorsMap: Record<string, string> = {
    morning: 'text-amber-600 bg-amber-50',
    lunch: 'text-orange-600 bg-orange-50',
    afternoon: 'text-blue-600 bg-blue-50',
    evening: 'text-violet-600 bg-violet-50',
  };

  const slot = place.timeSlot;
  const { imageUrl } = usePlaceImage(place.name, place.nameLocal, place.id, place.imageUrl);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        {imageUrl && (
          <div className="relative w-full h-32 overflow-hidden">
            <img src={imageUrl} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className={`absolute top-2 left-2 w-7 h-7 rounded-lg ${config.bg} ${config.text} flex items-center justify-center border ${config.border} shadow-sm`}>
              {config.icon}
            </div>
          </div>
        )}
        <CardContent className={imageUrl ? 'p-3' : 'p-4'}>
          <div className={imageUrl ? '' : 'flex items-start gap-3'}>
            {!imageUrl && (
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} ${config.text} flex items-center justify-center border ${config.border}`}>
                {config.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {showTimeSlot && slot && (
                  <Badge variant="secondary" className={`text-[0.65rem] ${timeSlotColorsMap[slot] || ''}`}>
                    {timeSlotLabelsMap[slot] || slot}
                  </Badge>
                )}
                <h3 className="font-bold text-sm text-gray-900">{place.name}</h3>
                {place.nameLocal && (
                  <span className="text-xs text-gray-400 font-light">{place.nameLocal}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{place.description}</p>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {place.rating != null && place.rating > 0 && (
                  <Badge variant="amber"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{place.rating}</Badge>
                )}
                {place.duration && (
                  <Badge variant="secondary"><Clock className="w-3 h-3" />{place.duration}</Badge>
                )}
                {place.cost && (
                  <Badge variant="secondary">{place.cost}</Badge>
                )}
              </div>
              {(place.address || place.openingHours) && (
                <div className="space-y-0.5 mb-2">
                  {place.address && (
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-gray-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{place.address}</span>
                    </div>
                  )}
                  {place.openingHours && (
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" /><span>{place.openingHours}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
                <a href={getGoogleMapsUrl(place)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.7rem] text-blue-500 hover:text-blue-700 transition-colors font-medium">
                  <MapPin className="w-3 h-3" />{t('viewOnGoogleMaps')}<ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a href={getSearchUrl(place)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.7rem] text-emerald-500 hover:text-emerald-700 transition-colors font-medium">
                  <Search className="w-3 h-3" />{t('viewReviews')}<ExternalLink className="w-2.5 h-2.5" />
                </a>
                {place.category === '숙소' && (() => {
                  const url = getBookingSearchUrl(place.name);
                  return url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-1 text-[0.7rem] text-indigo-500 hover:text-indigo-700 transition-colors font-medium">
                      <Hotel className="w-3 h-3" />{t('searchOnBooking')}<ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : null;
                })()}
                {place.category === '체험' && (() => {
                  const gygLink = getGetYourGuideUrl(place.name);
                  const klookLink = getKlookSearchUrl(place.name);
                  return (
                    <>
                      {klookLink && (
                        <a href={klookLink} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-1 text-[0.7rem] text-orange-500 hover:text-orange-700 transition-colors font-medium">
                          <Ticket className="w-3 h-3" />{t('searchOnKlook')}<ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {gygLink && (
                        <a href={gygLink} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-1 text-[0.7rem] text-teal-500 hover:text-teal-700 transition-colors font-medium">
                          <Compass className="w-3 h-3" />{t('searchTours')}<ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
